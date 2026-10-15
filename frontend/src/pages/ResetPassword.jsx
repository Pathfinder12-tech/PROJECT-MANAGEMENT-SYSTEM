import React, { useState } from 'react'
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck, Sparkles, UserRound, ArrowLeft, CheckCircle2, AlertCircle, Mail, Smartphone } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
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

export default function ResetPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [method, setMethod] = useState('email')
  const [formData, setFormData] = useState({ otp: '', password: '', password_confirmation: '' })
  
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const requestOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { identifier, method })
      setStep(2)
      setSuccessMessage(`Reset code sent successfully to your ${method}.`)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error sending OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { identifier, ...formData })
      setSuccessMessage('Password reset successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error resetting password. Check your code.')
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
              Secure Account Recovery
            </div>
            <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-[#2f2524] xl:text-6xl">
              Regain access to your
              <span className="relative ml-3 inline-block text-[#962c30]">
                workspace
                <span className="absolute bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-[#F9B233]/75" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#6f625f]">
              Verify your identity using your registered email or phone number to securely reset your password and continue your work.
            </p>
          </div>
          <div className="text-xs font-medium text-[#8a7e7b]">Internal access • Protected environment • Authorised users only</div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg">
            <div className="relative overflow-hidden rounded-[2rem] bg-white/88 p-6 shadow-[0_30px_90px_rgba(70,45,40,0.16)] ring-1 ring-black/5 backdrop-blur-xl sm:p-8">
              <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#962c30] via-[#b34b4e] to-[#F9B233]" />

              <div className="mb-8 pt-2">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#962c30]/10 text-[#962c30]">
                  <KeyRound size={23} />
                </div>
                <h2 className="text-3xl font-black tracking-[-0.03em] text-[#2f2524]">Reset Password</h2>
                <p className="mt-2 text-sm leading-6 text-[#776a67]">
                  {step === 1 ? 'Enter your details to receive a secure reset code.' : 'Create a new, secure password for your account.'}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={20} className="shrink-0 text-red-500" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={requestOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">Account Identifier</label>
                    <div className="group relative">
                      <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d918e] transition group-focus-within:text-[#962c30]" />
                      <input
                        type="text"
                        required
                        placeholder="Email or Phone Number"
                        className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 pl-11 text-sm text-[#332928] outline-none transition focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">Send code via</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMethod('email')}
                        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                          method === 'email' ? 'border-[#962c30] bg-[#962c30]/5 ring-1 ring-[#962c30]' : 'border-[#ded7d4] bg-[#fbfaf9] hover:bg-white'
                        }`}
                      >
                        <Mail size={24} className={method === 'email' ? 'text-[#962c30]' : 'text-[#b4aaa7]'} />
                        <span className={`text-xs font-bold ${method === 'email' ? 'text-[#962c30]' : 'text-[#6d5f5c]'}`}>Email</span>
                        {method === 'email' && <CheckCircle2 size={16} className="absolute right-2 top-2 text-[#962c30]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setMethod('phone')}
                        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                          method === 'phone' ? 'border-[#962c30] bg-[#962c30]/5 ring-1 ring-[#962c30]' : 'border-[#ded7d4] bg-[#fbfaf9] hover:bg-white'
                        }`}
                      >
                        <Smartphone size={24} className={method === 'phone' ? 'text-[#962c30]' : 'text-[#b4aaa7]'} />
                        <span className={`text-xs font-bold ${method === 'phone' ? 'text-[#962c30]' : 'text-[#6d5f5c]'}`}>Phone</span>
                        {method === 'phone' && <CheckCircle2 size={16} className="absolute right-2 top-2 text-[#962c30]" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-between rounded-2xl px-5 py-4 font-extrabold text-white shadow-[0_14px_30px_rgba(150,44,48,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(150,44,48,0.26)] disabled:opacity-60"
                    style={{ backgroundColor: '#962c30' }}
                  >
                    <span>{loading ? 'Sending...' : 'Send Reset Code'}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 group-hover:bg-white/18"><ArrowRight size={18} /></span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-5" autoComplete="off">
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">6-Digit Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="••••••"
                      disabled={loading}
                      autoComplete="one-time-code"
                      className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] text-[#332928] outline-none transition placeholder:tracking-normal focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8 disabled:opacity-50"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6d5f5c]">New Password</label>
                    <div className="group relative mb-3">
                      <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d918e] transition group-focus-within:text-[#962c30]" />
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        disabled={loading}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 pl-11 text-sm text-[#332928] outline-none transition focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8 disabled:opacity-50"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="group relative">
                      <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d918e] transition group-focus-within:text-[#962c30]" />
                      <input
                        type="password"
                        required
                        placeholder="Confirm new password"
                        disabled={loading}
                        autoComplete="new-password"
                        className="w-full rounded-2xl border border-[#ded7d4] bg-[#fbfaf9] px-4 py-3.5 pl-11 text-sm text-[#332928] outline-none transition focus:border-[#962c30]/40 focus:bg-white focus:ring-4 focus:ring-[#962c30]/8 disabled:opacity-50"
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-between rounded-2xl px-5 py-4 font-extrabold text-white shadow-[0_14px_30px_rgba(6,135,55,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(6,135,55,0.26)] disabled:opacity-60"
                    style={{ backgroundColor: '#068737' }}
                  >
                    <span>{loading ? 'Resetting...' : 'Save New Password'}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/12 group-hover:bg-white/18"><ShieldCheck size={18} /></span>
                  </button>
                </form>
              )}

              <div className="mt-6 flex items-center justify-center border-t border-[#eee8e5] pt-5">
                <Link to="/login" className="flex items-center gap-2 text-xs font-extrabold text-[#962c30] hover:underline">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}