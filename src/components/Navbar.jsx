import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trash2, X, Plus, Minus, User, LogOut, ChevronDown, Settings, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const [isRoomsDropdownOpen, setIsRoomsDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userMenuRef = useRef(null)

  const location = useLocation()

  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return null;

  const leftNavItems = [
    { name: 'Home', path: '/' },
    { name: 'Dining', path: '/foods' },
    { name: 'Gallery', path: '/gallery' }
  ]

  const roomCategories = [
    { name: 'Standard Rooms', path: '/standardRooms' },
    { name: 'Deluxe Rooms', path: '/deluxeRooms' },
    { name: 'Luxury Rooms', path: '/luxuryRooms' },
    { name: 'Day Outing', path: '/DayOutingRooms' },

  ]

  const rightNavItems = [
    { name: 'About Us', path: '/about-us' },
    { name: 'Contact Us', path: '/contact-us' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideUser = userMenuRef.current && userMenuRef.current.contains(event.target)
      if (!isInsideUser) setIsUserDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => location.pathname === path

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signin'
  const isHomePage = location.pathname === '/' || location.pathname === '/home'

  const shouldShowSolidNavbar = isAuthPage || !isHomePage || isScrolled

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${shouldShowSolidNavbar
        ? 'bg-white shadow-xl border-b border-navy-100/50 py-1'
        : 'bg-transparent py-2'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">

          {/* Left Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-5 flex-1 justify-end pr-4">
            {leftNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative px-2 py-1 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${shouldShowSolidNavbar
                  ? isActive(item.path)
                    ? 'text-navy-950'
                    : 'text-navy-700 hover:text-navy-950'
                  : isActive(item.path)
                    ? (isHomePage ? 'text-navy-950' : 'text-white')
                    : (isHomePage ? 'text-navy-700 hover:text-navy-950' : 'text-white/80 hover:text-white')
                  }`}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 transform origin-left ${shouldShowSolidNavbar ? 'bg-navy-950' : 'bg-teal-400'
                    } ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                />
              </Link>
            ))}

            {/* Rooms Dropdown - Desktop */}
            <div
              className="relative group pt-1"
              onMouseEnter={() => setIsRoomsDropdownOpen(true)}
              onMouseLeave={() => setIsRoomsDropdownOpen(false)}
            >
              <button
                className={`flex items-center space-x-1 px-2 py-1 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${shouldShowSolidNavbar
                  ? roomCategories.some(cat => isActive(cat.path))
                    ? 'text-navy-950'
                    : 'text-navy-700 hover:text-navy-950'
                  : roomCategories.some(cat => isActive(cat.path))
                    ? (isHomePage ? 'text-navy-950' : 'text-white')
                    : (isHomePage ? 'text-navy-700 hover:text-navy-950' : 'text-white/80 hover:text-white')
                  }`}
              >
                <span>Rooms</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${isRoomsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 transform origin-left ${shouldShowSolidNavbar ? 'bg-navy-950' : 'bg-teal-400'
                    } ${roomCategories.some(cat => isActive(cat.path)) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                />
              </button>

              {/* Dropdown Menu - Bridge to prevent hover loss */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 w-56 transition-all duration-300 transform origin-top ${isRoomsDropdownOpen
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
              >
                <div className={`rounded-xl overflow-hidden shadow-2xl ${shouldShowSolidNavbar ? 'bg-white' : 'bg-navy-950/90 backdrop-blur-md border border-white/10'
                  }`}>
                  <div className="py-2">
                    {roomCategories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        className={`block px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-center transition-all duration-300 ${shouldShowSolidNavbar
                          ? isActive(category.path)
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-navy-700 hover:bg-navy-50 hover:text-navy-950'
                          : isActive(category.path)
                            ? 'bg-teal-400/20 text-teal-400'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo - Center */}
          <div className="flex-shrink-0 flex justify-center w-32 md:w-44 overflow-visible">
            <Link to="/" className="flex items-center group">
              <div className={`relative transition-all duration-500 ${isScrolled ? 'scale-75' : 'scale-95'}`}>
                {/* Subtle Glow behind logo */}
                <div className={`absolute inset-0 bg-teal-400/20 blur-2xl rounded-full transition-opacity duration-500 ${shouldShowSolidNavbar ? 'opacity-0' : 'opacity-100'}`} />
                <img
                  src="https://res.cloudinary.com/dtdgufs9u/image/upload/v1772345832/ChatGPT_Image_Feb_13_2026_02_11_36_PM_jgcxnu.png"
                  alt="Dutch-Point Negombo Beach Resort"
                  className="h-16 md:h-20 w-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          </div>

          {/* Right Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 pl-4 justify-start">
            {rightNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative px-2 py-1 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${shouldShowSolidNavbar
                  ? isActive(item.path)
                    ? 'text-navy-950'
                    : 'text-navy-700 hover:text-navy-950'
                  : isActive(item.path)
                    ? (isHomePage ? 'text-navy-950' : 'text-white')
                    : (isHomePage ? 'text-navy-700 hover:text-navy-950' : 'text-white/80 hover:text-white')
                  }`}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 transform origin-left ${shouldShowSolidNavbar ? 'bg-navy-950' : 'bg-teal-400'
                    } ${isActive(item.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                />
              </Link>
            ))}



            {/* Auth/User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <div className="relative group">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={`flex items-center gap-2 h-9 px-3 rounded-lg transition-all duration-300 border-2 ${shouldShowSolidNavbar
                      ? 'border-navy-950 text-navy-950 hover:bg-navy-950 hover:text-white'
                      : isHomePage
                        ? 'border-navy-950/30 text-navy-950 hover:bg-navy-950 hover:text-white hover:border-navy-950'
                        : 'border-white/30 text-white hover:bg-white/10 hover:border-white'
                      }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <User size={14} className="text-teal-500" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[80px]">
                      {user.name || 'Account'}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200 ${shouldShowSolidNavbar ? 'bg-white border-navy-100' : 'bg-navy-950/95 backdrop-blur-md border-white/10'}`}>
                      <div className="p-2 space-y-1">
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${shouldShowSolidNavbar ? 'text-navy-700 hover:bg-teal-50 hover:text-teal-600' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                          >
                            <Settings size={14} />
                            Admin Panel
                          </Link>
                        )}
                        {user.role === 'receptionist' && (
                          <Link
                            to="/receptionist/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${shouldShowSolidNavbar ? 'text-navy-700 hover:bg-teal-50 hover:text-teal-600' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                          >
                            <Settings size={14} />
                            Dashboard
                          </Link>
                        )}
                        {user.role === 'staff' && (
                          <Link
                            to="/employee/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${shouldShowSolidNavbar ? 'text-navy-700 hover:bg-teal-50 hover:text-teal-600' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                          >
                            <TrendingUp size={14} />
                            Staff Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${shouldShowSolidNavbar ? 'text-navy-700 hover:bg-navy-50 hover:text-navy-950' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                        >
                          <User size={14} />
                          My Profile
                        </Link>

                        <div className={`h-px my-1 ${shouldShowSolidNavbar ? 'bg-navy-100' : 'bg-white/10'}`} />
                        <button
                          onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/signin"
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 whitespace-nowrap flex items-center h-9 ${shouldShowSolidNavbar
                      ? 'border-navy-950 text-navy-950 hover:bg-navy-950 hover:text-white'
                      : isHomePage
                        ? 'border-navy-950/30 text-navy-950 hover:bg-navy-950 hover:text-white hover:border-navy-950'
                        : 'border-white/30 text-white hover:bg-white/10 hover:border-white'
                      }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap h-9 flex items-center ${shouldShowSolidNavbar
                      ? 'bg-navy-950 text-white hover:bg-navy-900 shadow-navy-900/20'
                      : isHomePage
                        ? 'bg-navy-950 text-white hover:bg-navy-900 shadow-navy-900/20'
                        : 'bg-white text-navy-950 hover:bg-teal-50 shadow-white/10'
                      }`}
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Cart + Menu button */}
          <div className="lg:hidden flex items-center gap-2">

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all duration-300 ${shouldShowSolidNavbar
                ? 'text-navy-950 hover:bg-navy-50'
                : (isHomePage ? 'text-navy-950 hover:bg-navy-50' : 'text-white hover:bg-white/10')
                }`}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${shouldShowSolidNavbar || isHomePage ? 'bg-navy-950' : 'bg-white'} ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${shouldShowSolidNavbar || isHomePage ? 'bg-navy-950' : 'bg-white'} ${isOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 rounded-full transition-all duration-300 ${shouldShowSolidNavbar || isHomePage ? 'bg-navy-950' : 'bg-white'} ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'visible' : 'invisible'
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute top-0 right-0 w-[80%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="p-6 flex justify-between items-center border-b border-navy-50">
            <img
              src="https://res.cloudinary.com/dtdgufs9u/image/upload/v1772345832/ChatGPT_Image_Feb_13_2026_02_11_36_PM_jgcxnu.png"
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-navy-400 hover:text-navy-950 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
            {leftNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${isActive(item.path)
                  ? 'bg-navy-50 text-navy-950'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-950'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Rooms Section */}
            <div className="space-y-1">
              <button
                onClick={() => setIsRoomsDropdownOpen(!isRoomsDropdownOpen)}
                className={`w-full flex justify-between items-center px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${roomCategories.some(cat => isActive(cat.path))
                  ? 'bg-navy-50 text-navy-950'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-950'
                  }`}
              >
                <span>Rooms</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${isRoomsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isRoomsDropdownOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="pl-4 space-y-1 mt-1 pb-2">
                  {roomCategories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className={`block px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 ${isActive(category.path)
                        ? 'bg-teal-50 text-teal-600'
                        : 'text-navy-500 hover:bg-navy-50 hover:text-navy-950'
                        }`}
                      onClick={() => {
                        setIsOpen(false)
                        setIsRoomsDropdownOpen(false)
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {rightNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${isActive(item.path)
                  ? 'bg-navy-50 text-navy-950'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-950'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="p-6 border-t border-navy-50 space-y-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between w-full px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest bg-teal-600 text-white shadow-xl shadow-teal-900/20 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Admin Panel</span>
                    <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </Link>
                )}
                {user.role === 'receptionist' && (
                  <Link
                    to="/receptionist/dashboard"
                    className="flex items-center justify-between w-full px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest bg-teal-600 text-white shadow-xl shadow-teal-900/20 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Dashboard</span>
                    <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </Link>
                )}
                {user.role === 'staff' && (
                  <Link
                    to="/employee/dashboard"
                    className="flex items-center justify-between w-full px-5 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest bg-navy-950 text-white shadow-xl shadow-navy-900/20 transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Staff Dashboard</span>
                    <TrendingUp size={20} className="opacity-70" />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-center border-2 border-navy-950 text-navy-950 hover:bg-navy-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-center bg-red-600 text-white shadow-lg shadow-red-900/20 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-center border-2 border-navy-950 text-navy-950 hover:bg-navy-50 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="block w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-center bg-navy-950 text-white shadow-lg shadow-navy-900/20 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slide-down animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  )
}

export default Navbar
