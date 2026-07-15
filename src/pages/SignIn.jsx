import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Reveal from "../components/Reveal"
import { registerUser } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const SignIn = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      // Allow only numbers and cap at 10 digits
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: sanitized }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return;
    }

    // Validate phone number format (must be exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits')
      return;
    }

    // Validate password length (at least 8 characters)
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return;
    }

    // Confirm passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      // Success
      login(data)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex selection:bg-teal-500 selection:text-white overflow-hidden">

      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[20000ms] hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/90 via-navy-900/60 to-teal-900/40" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full">
          <Link to="/" className="group inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-white font-bold tracking-widest text-xs uppercase">Return Home</span>
          </Link>

          <div>
            <span className="text-sand-400 font-bold text-[10px] tracking-[0.3em] uppercase block mb-3 px-1 border-l-2 border-sand-500">
              The Society
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              Join the <br />
              <span className="text-sand-400 italic">Circle.</span>
            </h2>
            <p className="text-white/70 text-base max-w-sm font-light leading-relaxed">
              Unlock a world of coastal luxury at Dutch Point Negombo.
            </p>
          </div>

          <p className="text-white/30 text-[10px] uppercase tracking-widest">
            © 2026 Dutch Point Negombo
          </p>
        </div>
      </div>


      <div className="flex-1 flex flex-col items-center justify-center bg-sand-50 px-6 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-64 h-64 bg-navy-100/30 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full -ml-32 -mb-32 blur-3xl" />

        <Reveal width="100%" className="max-w-xl w-full relative z-10 text-center">
          <div className="mb-4">
            <Link to="/" className="inline-block mb-2 group">
              <img
                src="https://res.cloudinary.com/dtdgufs9u/image/upload/v1772345832/ChatGPT_Image_Feb_13_2026_02_11_36_PM_jgcxnu.png"
                alt="Dutch Point Negombo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <h2 className="text-2xl font-bold text-navy-950 mb-0.5 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              Create Account
            </h2>
            <p className="text-navy-500 font-light text-[10px] uppercase tracking-[0.2em]">Join our Exclusive Society</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 shadow-xl shadow-navy-950/5 border border-navy-50 relative group">
            <form onSubmit={handleSubmit} className="space-y-3 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-firstName" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="signup-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="signup-lastName" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="signup-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-email" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                    placeholder="name@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="signup-phone" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="signup-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                    placeholder="e.g. 0764219211"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-password" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-teal-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="signup-confirmPassword" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                    Confirm Key
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="signup-confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-teal-600 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy-950 text-white py-3 rounded-xl font-bold text-sm tracking-[0.15em] uppercase hover:bg-navy-900 transition-all shadow-lg shadow-navy-950/20 transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {isSubmitting ? 'Creating ID...' : 'Join the Society'}
              </button>
            </form>
          </div>

          <p className="mt-4 text-navy-400 font-light text-sm">
            Already a member?{' '}
            <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
              Sign In
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  )
}

export default SignIn
