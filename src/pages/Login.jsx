import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Reveal from "../components/Reveal"
import { googleSignIn, loginUser } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { auth, googleProvider, signInWithPopup } from '../firebase'
import { GoogleAuthProvider } from 'firebase/auth'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Store form data (email + password)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return;
    }

    setIsSubmitting(true)
    try {
      // Call backend API for login
      const data = await loginUser(formData)

      // Save user in auth context
      login(data)
      toast.success('Logged in successfully!')
      
      if (data.role === 'admin') {
        navigate('/admin')
      } else if (data.role === 'receptionist') {
        navigate('/receptionist/dashboard')
      } else if (data.role === 'staff') {
        navigate('/employee/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }


  // Google Login using Firebase SDK
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Open Google popup (OAuth)
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      // Get Google ID token from Firebase
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const googleIdToken = credential?.idToken

      if (!googleIdToken) {
        throw new Error('Google sign-in did not return a valid token')
      }

      // Send Google user data to backend
      const data = await googleSignIn({
        idToken: googleIdToken,
        googleId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      })

      // Save login session
      login(data)

      // Role-based redirect
      if (data.role === 'admin') {
        navigate('/admin')
      } else if (data.role === 'receptionist') {
        navigate('/receptionist/dashboard')
      } else if (data.role === 'staff') {
        navigate('/employee/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex selection:bg-teal-500 selection:text-white overflow-hidden">

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[20000ms] hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
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
              Guest Portal
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              Welcome back to <br />
              <span className="text-sand-400 italic">Paradise.</span>
            </h2>
            <p className="text-white/70 text-base max-w-sm font-light leading-relaxed">
              Reconnect with the tranquility of Negombo. Your sanctuary awaits.
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

        <Reveal width="100%" className="max-w-md w-full relative z-10 text-center">
          <div className="mb-4">
            <Link to="/" className="inline-block mb-2 group">
              <img
                src="https://res.cloudinary.com/dtdgufs9u/image/upload/v1772345832/ChatGPT_Image_Feb_13_2026_02_11_36_PM_jgcxnu.png"
                alt="Dutch Point Negombo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <h2 className="text-2xl font-bold text-navy-950 mb-0.5 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              Sign In
            </h2>
            <p className="text-navy-500 font-light text-[10px] uppercase tracking-[0.2em]">Exclusively for Guests</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl p-5 shadow-xl shadow-navy-950/5 border border-navy-50 relative group">
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1 pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-navy-900 text-sm placeholder:text-navy-300"
                  placeholder="name@luxury.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 pl-1">
                  <label htmlFor="login-password" className="block text-xs font-bold text-navy-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link to="/forgot-password" size={18} className="text-[10px] font-bold text-teal-600 hover:text-teal-700 tracking-widest uppercase transition-colors">
                    Forgot Key?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-navy-900 text-sm placeholder:text-navy-300 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-teal-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy-950 text-white py-3 rounded-xl font-bold text-sm tracking-[0.2em] uppercase hover:bg-navy-900 transition-all shadow-lg shadow-navy-950/20 transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-navy-100" />
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-[0.2em] text-navy-300">
                <span className="px-3 bg-white">OR</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-6 py-2.5 border border-navy-100 rounded-xl text-sm font-bold text-navy-700 hover:bg-navy-50 transition-all group"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-4 text-navy-400 font-light text-sm">
            Not yet a member?{' '}
            <Link to="/signin" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">
              Create Account
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  )
}

export default Login
