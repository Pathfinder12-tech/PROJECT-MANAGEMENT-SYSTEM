<!DOCTYPE html>
<html>
<head>
    <title>Security Code</title>
</head>
<body style="font-family: Arial, sans-serif; color: #332928; line-height: 1.6;">
    <div style="max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ded7d4; border-radius: 10px;">
        <h2 style="color: #962c30;">NSSF Project Management System</h2>
        <p>Hello,</p>
        <p>You recently requested to unlock your account or reset your password. Use the secure code below to proceed:</p>
        
        <div style="background-color: #f6f2ef; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #962c30;">{{ $otp }}</span>
        </div>

        <p style="font-size: 12px; color: #817572;">This code will expire in 15 minutes. If you did not request this, please ignore this email or contact ICT Support.</p>
    </div>
</body>
</html>