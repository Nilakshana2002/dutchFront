import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, updateUserProfile } from '../utils/api'
import { Eye, EyeOff } from 'lucide-react'
import Reveal from '../components/Reveal'


const Profile = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
 
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile()
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '',
          confirmPassword: '',
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      }
    }
    fetchProfile()
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password || undefined
      })
      
  
      login(data)
      setSuccessMsg('Profile updated successfully!')
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null;

  return (
    <>

      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-sand-50 px-6 relative overflow-hidden">
      
        <div className="absolute top-20 right-0 w-64 h-64 bg-navy-100/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

        <Reveal width="100%" className="max-w-2xl w-full relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-navy-950/5 border border-navy-50">
            <h2 className="text-3xl font-bold text-navy-950 mb-2 font-serif text-center" style={{ fontFamily: 'var(--font-serif)' }}>
              My Profile
            </h2>
            <p className="text-navy-500 font-light text-[10px] uppercase tracking-[0.2em] text-center mb-8">Manage Your Details</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-700 text-sm rounded-xl font-bold uppercase tracking-wider text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="profile-firstName" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5 pl-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="profile-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                  />
                </div>
                <div>
                  <label htmlFor="profile-lastName" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5 pl-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="profile-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="profile-email" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5 pl-1">
                    Email <span className="lowercase text-[10px] text-navy-300 font-normal ml-1">(Cannot be changed)</span>
                  </label>
                  <input
                    type="email"
                    id="profile-email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5 pl-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="profile-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-navy-50">
                <h3 className="text-sm font-bold text-navy-900 mb-4 tracking-widest uppercase">Change Password</h3>
                <p className="text-xs text-navy-400 mb-4">Leave blank if you don't want to change your password.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="profile-password" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5 pl-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="profile-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="profile-confirmPassword" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-1.5 pl-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="profile-confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-sand-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-navy-900 text-sm placeholder:text-navy-300"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={logout}
                  className="px-6 py-3 border border-red-200 text-red-600 rounded-xl font-bold text-xs sm:text-sm tracking-[0.1em] uppercase hover:bg-red-50 hover:border-red-300 transition-all flex-1 sm:flex-none text-center"
                >
                  Logout
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 flex-1 bg-navy-950 text-white py-3 rounded-xl font-bold text-xs sm:text-sm tracking-[0.15em] uppercase hover:bg-navy-900 transition-all shadow-lg shadow-navy-950/20 transform hover:-translate-y-0.5 disabled:opacity-60 text-center"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </>
  )
}

export default Profile
