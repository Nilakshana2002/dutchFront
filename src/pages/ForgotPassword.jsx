import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Key, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Reveal from "../components/Reveal"
import { forgotPassword, verifyOTP, resetPassword } from '../utils/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await forgotPassword({ email })
      setMessage('OTP sent to your email address')
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  }

  const clearOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    // Focus the first input box
    const firstInput = document.querySelector('input[data-index="0"]');
    if (firstInput) firstInput.focus();
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    try {
      await verifyOTP({ email, otp: otpCode })
      setStep(3)
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await resetPassword({
        email,
        otp: otp.join(''),
        password: formData.password
      })
      setStep(4)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-teal-500 selection:text-white bg-sand-50 overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-navy-100/30 rounded-full -mr-48 -mt-48 blur-3xl p-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100/30 rounded-full -ml-48 -mb-48 blur-3xl p-10" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <Reveal width="100%" className="max-w-md w-full text-center">
          
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-navy-400 hover:text-teal-600 transition-colors group mb-6">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Login</span>
            </Link>
            
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-navy-50 flex items-center justify-center mx-auto mb-4">
              {step === 4 ? (
                <CheckCircle2 className="text-teal-500" size={32} />
              ) : (
                <Lock className="text-navy-900" size={32} />
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-navy-950 mb-2 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              {step === 1 && 'Restore Access'}
              {step === 2 && 'Verify Identity'}
              {step === 3 && 'New Credentials'}
              {step === 4 && 'Success!'}
            </h2>
            <p className="text-navy-500 text-sm font-light max-w-xs mx-auto">
              {step === 1 && 'Enter your email to receive a secure authentication code.'}
              {step === 2 && `We've sent a 6-digit OTP to ${email}.`}
              {step === 3 && 'Create a strong, unique password for your account.'}
              {step === 4 && 'Your password has been updated. You can now log in.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              {error}
            </div>
          )}

          {message && step === 2 && !error && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-700 text-xs rounded-2xl font-bold uppercase tracking-wider">
              {message}
            </div>
          )}

          <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-navy-950/5 border border-navy-50 relative overflow-hidden">
            
            {/* Form Step: Email */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="text-left">
                  <label htmlFor="email" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2 pl-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-sand-50/50 border border-navy-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-navy-900 text-sm placeholder:text-navy-300"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy-950 text-white py-4 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-navy-900 transition-all shadow-xl shadow-navy-950/20 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending code...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Form Step: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="flex justify-between gap-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      data-index={index}
                      type="text"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      className={`w-full h-14 text-center text-xl font-bold bg-sand-50/50 border rounded-xl focus:ring-2 outline-none text-navy-900 shadow-sm transition-all ${
                        error ? 'border-red-200 focus:ring-red-500' : 'border-navy-100 focus:ring-teal-500'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-navy-950 text-white py-4 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-navy-900 transition-all shadow-xl shadow-navy-950/20 transform hover:-translate-y-1 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <div className="flex justify-between items-center px-2">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] font-bold text-navy-400 uppercase tracking-widest hover:text-teal-600 transition-colors"
                    >
                      Resend Code
                    </button>
                    <button 
                      type="button"
                      onClick={clearOtp}
                      className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form Step: Reset Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="text-left space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2 pl-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-12 pr-12 py-4 bg-sand-50/50 border border-navy-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-navy-900 text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-teal-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2 pl-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-sand-50/50 border border-navy-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-navy-900 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy-950 text-white py-4 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-navy-900 transition-all shadow-xl shadow-navy-950/20 transform hover:-translate-y-1"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* Form Step: Success */}
            {step === 4 && (
              <div className="space-y-8 py-4">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-teal-500" size={40} />
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-navy-950 text-white py-4 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-navy-900 transition-all shadow-xl shadow-navy-950/20 transform hover:-translate-y-1"
                >
                  Log In Now
                </button>
              </div>
            )}
          </div>
          
          <p className="mt-8 text-navy-400 font-light text-xs uppercase tracking-widest">
            © 2026 Dutch Point Resort Negombo
          </p>
        </Reveal>
      </div>
    </div>
  )
}

export default ForgotPassword
