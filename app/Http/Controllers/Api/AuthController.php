<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Role;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
                function ($attribute, $value, $fail) {
                    $allowedDomains = ['dict.go.tz', 'nssf.or.tz', 'gmail.com'];
                    $domain = strtolower((string) substr((string) strrchr($value, '@'), 1));
                    if (! in_array($domain, $allowedDomains, true)) {
                        $fail('Registration is restricted to authorized domains (@dict.go.tz, @nssf.or.tz, @gmail.com).');
                    }
                },
            ],
            'password' => ['required', 'string', Password::min(8)->numbers()],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'User registered successfully. A verification link has been sent to your email address.',
            'user'    => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $fieldType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $attemptedUser = User::where($fieldType, $request->login)->first();

        // 1. Block if already locked
        if ($attemptedUser && $attemptedUser->is_locked) {
            $this->recordAudit($attemptedUser->id, 'login_blocked_locked', $request);
            return response()->json([
                'message' => 'Account is locked due to too many failed attempts.',
                'is_locked' => true
            ], 423);
        }

        // 2. Check credentials & track failed attempts
        if (! Auth::attempt([$fieldType => $request->login, 'password' => $request->password])) {
            if ($attemptedUser) {
                // Manually add to update the model in memory
                $attemptedUser->login_attempts = $attemptedUser->login_attempts + 1;
                
                // Lock if 3 attempts reached
                if ($attemptedUser->login_attempts >= 3) {
                    $attemptedUser->is_locked = true;
                    $attemptedUser->save(); 
                    
                    $this->recordAudit($attemptedUser->id, 'account_locked', $request);
                    
                    return response()->json([
                        'message' => 'Maximum attempts reached. Account locked.',
                        'is_locked' => true
                    ], 423);
                }

                // Save the incremented attempt if under 3
                $attemptedUser->save();
                $this->recordAudit($attemptedUser->id, 'login_failed', $request);
            }

            throw ValidationException::withMessages([
                'login' => ['The provided credentials do not match our records.'],
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        // 3. Block if account is administratively disabled
        if ($user->is_active === false) {
            Auth::logout();
            $this->recordAudit($user->id, 'login_blocked_disabled', $request);
            throw ValidationException::withMessages([
                'login' => ['This account is disabled. Contact ICT Support.'],
            ]);
        }

        // 4. Reset attempts on successful login
        $user->update(['login_attempts' => 0, 'is_locked' => false]);

        $this->ensureKnownAccountHasRole($user);
        $user->refresh();
        $token = $user->createToken('auth_token')->plainTextToken;
        $this->recordAudit($user->id, 'login_success', $request);

        return response()->json([
            'message'        => 'Login successful',
            'token'          => $token,
            'email_verified' => true,
            'user'           => $user->toAuthArray(),
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        /** @var PersonalAccessToken|null $token */
        $token = $user?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        if ($user) {
            $this->recordAudit($user->id, 'logout', $request);
        }

        return response()->json(['message' => 'Logout successful'], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->ensureKnownAccountHasRole($user);
        $user->refresh();

        return response()->json([
            'data'           => $user->toAuthArray(),
            'user'           => $user->toAuthArray(),
            'email_verified' => $user->hasVerifiedEmail(),
            'permissions'    => $user->permissionCodes(),
        ], 200);
    }

    public function users(): JsonResponse
    {
        $users = User::query()
            ->with('activeRoles')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->activeRoles
                    ->map(fn ($role) => [
                        'id' => $role->id,
                        'name' => $role->name,
                    ])
                    ->values(),
            ]);

        return response()->json(['data' => $users]);
    }

    public function verifyEmail(Request $request, string $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email address is already verified.'], 200);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email address verified successfully.'], 200);
    }

    public function resendVerification(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email address is already verified.'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email link resent successfully.'], 200);
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate(['identifier' => 'required', 'method' => 'required|in:email,phone']);
        
        $fieldType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($fieldType, $request->identifier)->firstOrFail();

        // Force string type to prevent validation mismatches
        $otp = (string) rand(100000, 999999);
        
        $user->update([
            'otp_code' => Hash::make($otp),
            'otp_expires_at' => now()->addMinutes(15)
        ]);

        if ($request->input('method') === 'email') {
            Mail::to($user->email)->send(new OtpMail($otp));
        } else {
            // Add SMS logic in the future
        }

        $this->recordAudit($user->id, 'otp_sent', $request, 'Method: ' . $request->input('method'));
        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function unlockAccount(Request $request): JsonResponse
    {
        $request->validate(['identifier' => 'required', 'otp' => 'required']);
        
        $fieldType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($fieldType, $request->identifier)->firstOrFail();

        $cleanOtp = trim((string) $request->otp);

        if (empty($user->otp_expires_at) || empty($user->otp_code)) {
            return response()->json(['message' => 'No active OTP found. Please request a new code.'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'The OTP has expired.'], 400);
        }

        if (!Hash::check($cleanOtp, $user->otp_code)) {
            return response()->json(['message' => 'The code you entered is incorrect.'], 400);
        }

        $user->update(['is_locked' => false, 'login_attempts' => 0, 'otp_code' => null, 'otp_expires_at' => null]);
        $this->recordAudit($user->id, 'account_unlocked', $request);

        return response()->json(['message' => 'Account unlocked']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required', 
            'otp' => 'required', 
            'password' => ['required', 'string', Password::min(8)->numbers(), 'confirmed']
        ]);
        
        $fieldType = filter_var($request->identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($fieldType, $request->identifier)->firstOrFail();

        $cleanOtp = trim((string) $request->otp);

        if (empty($user->otp_expires_at) || empty($user->otp_code)) {
            return response()->json(['message' => 'No active OTP found. Please request a new code.'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'The OTP has expired.'], 400);
        }

        if (!Hash::check($cleanOtp, $user->otp_code)) {
            return response()->json(['message' => 'The code you entered is incorrect.'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password), 
            'is_locked' => false,
            'login_attempts' => 0,
            'otp_code' => null,
            'otp_expires_at' => null
        ]);
        
        $this->recordAudit($user->id, 'password_reset', $request);

        return response()->json(['message' => 'Password reset successfully']);
    }

    private function ensureKnownAccountHasRole(User $user): void
    {
        if ($user->roles()->exists()) {
            return;
        }

        $roleByEmail = [
            'mussasaid@gmail.com' => 'Project Administrator',
            'sms.mussasaid@gmail.com' => 'Project Administrator',
            'luquman2004tajir@gmail.com' => 'Project Reviewer',
            'ictsupport@nssf.go.tz' => 'ICT Support',
            'coordinator@nssf.or.tz' => 'Project Coordinator',
            'approver@nssf.or.tz' => 'Project Approver',
            'planner@nssf.or.tz' => 'Project Planner',
            'viewonly@nssf.or.tz' => 'Project ViewOnly',
        ];

        $roleName = $roleByEmail[strtolower((string) $user->email)] ?? null;
        if (! $roleName) {
            return;
        }

        $role = Role::where('name', $roleName)->first();
        if (! $role) {
            return;
        }

        $user->roles()->sync([
            $role->id => ['is_active' => true, 'assigned_at' => now()],
        ]);
    }

    private function recordAudit(int $userId, string $action, Request $request, ?string $description = null): void
    {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'ip_address' => $request->ip(),
        ]);
    }
}