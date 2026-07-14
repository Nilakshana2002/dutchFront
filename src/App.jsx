
import React, { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import SignIn from './pages/SignIn'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import VenueGallery from './pages/VenueGallery'
import DayOutingRooms from './pages/DayOutingRooms'
import StandardRooms from './pages/standardRooms' 
import DeluxeRooms from './pages/deluxeRooms'
import LuxuryRooms from './pages/luxuryRooms'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Gallery from './pages/Gallery'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import FoodItems from './pages/other/foods/FoodItems'

import AddRoomForm from './components/admin_components/AddRoomForm'
import useIdleTimeout from './hooks/useIdleTimeout'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppButton from './components/WhatsAppButton'


const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const RoomManagement = lazy(() => import('./pages/admin/RoomManagement'))
const BookingManagement = lazy(() => import('./pages/admin/BookingManagement'))

const FeedbackManagement = lazy(() => import('./pages/admin/FeedbackManagement'))
const OfferManagement = lazy(() => import('./pages/admin/OfferManagement'))
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'))
const DiningManagement = lazy(() => import('./pages/admin/DiningManagement'))

const ReceptionistLayout = lazy(() => import('./pages/receptionist/ReceptionistLayout'))
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/ReceptionistDashboard'))
const ReceptionistScanner = lazy(() => import('./pages/receptionist/ReceptionistScanner'))
const ReceptionistProfile = lazy(() => import('./pages/receptionist/ReceptionistProfile'))

function App() {

  useIdleTimeout(15);
  
  const location = useLocation();
  const hideNavbarRoutes = ['/admin', '/addRoom', '/receptionist'];
  const shouldShowNavbar = !hideNavbarRoutes.some(route => location.pathname.startsWith(route));
  
  // Hide WhatsApp floating icon on admin and receptionist panels
  const hideWhatsAppRoutes = ['/admin', '/receptionist', '/addRoom'];
  const shouldShowWhatsApp = !hideWhatsAppRoutes.some(route => location.pathname.startsWith(route));

  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signin';
  const mainPadding = shouldShowNavbar && !isHomePage 
    ? (isAuthPage ? 'pt-[72px] md:pt-[88px]' : 'pt-20 md:pt-24') 
    : '';

  return (
    <CartProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />
      {shouldShowNavbar && <Navbar />}
      {shouldShowWhatsApp && <WhatsAppButton />}
      <main className={mainPadding}>
      <Suspense fallback={<div className="h-screen flex items-center justify-center text-navy-500 font-bold">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/venues" element={<VenueGallery />} />
          <Route path="/foods" element={<FoodItems />} />
          <Route path="/DayOutingRooms" element={<DayOutingRooms />} />
          <Route path="/standardRooms" element={<StandardRooms />} />
          <Route path="/deluxeRooms" element={<DeluxeRooms />} />
          <Route path="/luxuryRooms" element={<LuxuryRooms />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/addRoom" element={<AddRoomForm />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="bookings" element={<BookingManagement />} />

            <Route path="feedback" element={<FeedbackManagement />} />


            <Route path="offers" element={<OfferManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="dining" element={<DiningManagement />} />
          </Route>

          {/* Receptionist Routes */}
          <Route path="/receptionist" element={<ReceptionistLayout />}>
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="rooms" element={<RoomManagement />} />

            <Route path="scanner" element={<ReceptionistScanner />} />
            <Route path="profile" element={<ReceptionistProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </main>
    </CartProvider>
  )

}

export default App;
