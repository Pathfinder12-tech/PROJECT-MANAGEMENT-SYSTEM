import React, { useMemo, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole, ShieldCheck, Sparkles, UserRound, ShieldAlert, CheckCircle2, AlertCircle, Mail, Smartphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/axios'

const FullPageSamsungLoader = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm transition-all">
    <style>
      {`
        @keyframes circle-cycle {
          0%, 100% { opacity: 0.2; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .circle-dot {
          width: 14px;
          height: 14px;
          background-color: #962c30;
          border-radius: 50%;
          animation: circle-cycle 1.2s infinite ease-in-out;
        }
      `}
    </style>
    
    {/* A standard 2x2 grid without the 45-degree tilt */}
    <div className="mb-3 grid grid-cols-2 gap-3">
      <div className="circle-dot" style={{ animationDelay: '0ms' }} />   {/* Top Left */}
      <div className="circle-dot" style={{ animationDelay: '300ms' }} /> {/* Top Right */}
      <div className="circle-dot" style={{ animationDelay: '900ms' }} /> {/* Bottom Left */}
      <div className="circle-dot" style={{ animationDelay: '600ms' }} /> {/* Bottom Right */}
    </div>
    
    <span className="mt-4 text-[11px] font-extrabold tracking-[0.2em] text-[#6d5f5c] uppercase">
      Please Wait...
    </span>
  </div>
); 

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [step, setStep] = useState(1)
  const [otpMethod, setOtpMethod] = useState('email')
  const [otpCode, setOtpCode] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const initials = useMemo(() => {
    const first = email.trim().charAt(0).toUpperCase()
    return first || 'N'
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await api.post('/login', { login: email, password })
      const user = response.data.user
      login(user, response.data.token)
      navigate('/')
    } catch (err) {
      const locked = err.response?.status === 423 || err.response?.data?.is_locked

      if (locked) {
        setStep(2)
        setErrorMessage('Your account has been locked due to multiple failed attempts.')
        setLoading(false)
        return
      }

      setErrorMessage(
        err.response?.data?.message || err.response?.data?.errors?.login?.[0] || 'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { identifier: email, method: otpMethod })
      setStep(3)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error sending OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)
    try {
      await api.post('/auth/unlock', { identifier: email, otp: otpCode })
      setStep(1)
      setPassword('')
      setOtpCode('')
      setSuccessMessage('Account unlocked securely! You may now sign in.')
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f2ee]">
      
      {loading && <FullPageSamsungLoader />}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(150,44,48,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(249,178,51,0.18),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(70,55,50,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(70,55,50,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -left-24 top-[-12rem] h-[42rem] w-[42rem] rounded-full border-[8rem] border-[#962c30]/8" />
      <div className="pointer-events-none absolute -bottom-52 -right-48 h-[38rem] w-[38rem] rounded-full border-[7rem] border-[#F9B233]/10" />

      <main className="relative z-10 mx-auto grid min-h-screen max-w-[1480px] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden px-12 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-black/5 backdrop-blur">
              <img src="/nssf-logo.png" alt="NSSF Logo" className="h-14 w-auto rounded-xl" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-[#3d2f2e]">National Social Security Fund</div>
              <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#962c30]">
                Project Management System
              </div>
            </div>
          </div>

          <div className="max-w-2xl pb-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-bold text-[#5e4744] shadow-sm ring-1 ring-black/5 backdrop-blur">
              <Sparkles size={15} className="text-[#962c30]" />
              Built for focused internal work
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-[#2f2524] xl:text-6xl">
              Manage projects with
              <span className="relative ml-3 inline-block text-[#962c30]">
                clarity
                <span className="absolute bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-[#F9B233]/75" />
              </span>
              <span className="relative"> and confidence.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#6f625f]">
              A dedicated workspace for NSSF teams to plan, monitor and deliver projects without the visual clutter of a public service portal.
            </p>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['01', 'Plan', 'Organise work'],
                ['02', 'Track', 'See progress'],
                ['03', 'Deliver', 'Close with confidence'],
              ].map(([no, title, body]) => (
                <div key={no} className="rounded-2xl bg-white/60 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
                  <div className="text-[10px] font-black tracking-[0.22em] text-[#962c30]">{no}</div>
                  <div className="mt-3 text-sm font-extrabold text-[#3d2f2e]">{title}</div>
                  <div className="mt-1 text-xs text-[#837572]">{body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs font-medium text-[#8a7e7b]">
            Internal access • Protected environment • Authorised users only
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
                <img src="/nssf-logo.png" alt="NSSF Logo" className="h-12 w-auto rounded-lg" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#3d2f2e]">National Social Security Fund</div>
                <div className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#962c30]">
                  Project Management System
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-white/88 p-6 shadow-[0_30px_90px_rgba(70,45,40,0.16)] ring-1 ring-black/5 backdrop-blur-xl sm:p-8">
              <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#962c30] via-[#b34b4e] to-[#F9B233]" />

              <div className="mb-8 flex items-start justify-between gap-4 pt-2">
                <div>
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white ${step === 1 ? 'bg-[#962c30]/10 text-[#962c30]' : 'bg-red-100 text-red-600'}`}>
                    {step === 1 ? <Fingerprint size={23} /> : <ShieldAlert size={23} />}
                  </div>
                  <h2 className="text-3xl font-black tracking-[-0.03em] text-[#2f2524]">
                    {step === 1 ? 'Welcome back' : 'Account Locked'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#776a67]">
                    {step === 1 
                      ? 'Sign in to continue to your NSSF project workspace.'
                      : 'Please verify your identity to unlock your account.'}
                  </p>
                </div>

                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f6f1ef] text-lg font-black text-[#962c30] sm:flex">
                  {initials}
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="shrink-0 text-red-500" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                </div>
              )}
              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">
                      Email address
                    </label>
                    <div className="group relative">
                      <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d918e] transition group-focus-within:text-[#962c30]" />
                      <input
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="name@nssf.go.tz"
                        className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 pl-11 text-sm text-[#332928] outline-none transition placeholder:text-[#b4aaa7] focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label className="block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs font-extrabold text-[#962c30] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="group relative">
                      <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d918e] transition group-focus-within:text-[#962c30]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 pl-11 pr-12 text-sm text-[#332928] outline-none transition placeholder:text-[#b4aaa7] focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-0 flex h-full items-center px-4 text-[#9d918e] transition hover:text-[#5f514e]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-between rounded-2xl px-5 py-4 font-extrabold text-white shadow-[0_14px_30px_rgba(150,44,48,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(150,44,48,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: '#962c30' }}
                  >
                    <span>{loading ? 'Signing you in...' : 'Enter workspace'}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 transition group-hover:bg-white/18">
                      <ArrowRight size={18} />
                    </span>
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">
                      Send unlock code to:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOtpMethod('email')}
                        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                          otpMethod === 'email' ? 'border-[#962c30] bg-[#962c30]/5 ring-1 ring-[#962c30]' : 'border-[#ded7d4] bg-[#fbfaf9] hover:bg-white'
                        }`}
                      >
                        <Mail size={24} className={otpMethod === 'email' ? 'text-[#962c30]' : 'text-[#b4aaa7]'} />
                        <span className={`text-xs font-bold ${otpMethod === 'email' ? 'text-[#962c30]' : 'text-[#6d5f5c]'}`}>Email</span>
                        {otpMethod === 'email' && <CheckCircle2 size={16} className="absolute right-2 top-2 text-[#962c30]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOtpMethod('phone')}
                        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                          otpMethod === 'phone' ? 'border-[#962c30] bg-[#962c30]/5 ring-1 ring-[#962c30]' : 'border-[#ded7d4] bg-[#fbfaf9] hover:bg-white'
                        }`}
                      >
                        <Smartphone size={24} className={otpMethod === 'phone' ? 'text-[#962c30]' : 'text-[#b4aaa7]'} />
                        <span className={`text-xs font-bold ${otpMethod === 'phone' ? 'text-[#962c30]' : 'text-[#6d5f5c]'}`}>Phone</span>
                        {otpMethod === 'phone' && <CheckCircle2 size={16} className="absolute right-2 top-2 text-[#962c30]" />}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-between rounded-2xl px-5 py-4 font-extrabold text-white shadow-[0_14px_30px_rgba(150,44,48,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(150,44,48,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: '#962c30' }}
                  >
                    <span>{loading ? 'Sending code...' : 'Send Unlock Code'}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 transition group-hover:bg-white/18">
                      <ArrowRight size={18} />
                    </span>
                  </button>

                  <button type="button" onClick={() => { setStep(1); setErrorMessage('') }} className="mt-4 block w-full text-center text-xs font-extrabold text-[#958986] hover:text-[#332928] hover:underline">
                    Cancel and return to login
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">
                      Enter 6-digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="••••••"
                      disabled={loading}
                      required
                      className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] text-[#332928] outline-none transition placeholder:tracking-normal focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8 disabled:opacity-50"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-between rounded-2xl px-5 py-4 font-extrabold text-white shadow-[0_14px_30px_rgba(150,44,48,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(150,44,48,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: '#068737' }}
                  >
                    <span>{loading ? 'Verifying...' : 'Unlock My Account'}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 transition group-hover:bg-white/18">
                      <LockKeyhole size={18} />
                    </span>
                  </button>
                </form>
              )}

              <div className="mt-7 rounded-2xl bg-[#f6f2ef] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#962c30]" />
                  <div>
                    <div className="text-xs font-extrabold text-[#4e403e]">Protected internal access</div>
                    <p className="mt-1 text-[11px] leading-5 text-[#817572]">
                      Accounts are managed by ICT Support. Never share your password or verification code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#eee8e5] pt-5 text-[11px] font-semibold text-[#958986]">
                <span>NSSF PMS</span>
                <span>Secure access gateway</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}