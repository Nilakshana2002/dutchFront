import { Link } from 'react-router-dom'

const sections = [
  {
    id: 'information-collect',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create an account, we collect your first name, last name, email address, and phone number. Your password is securely hashed using bcrypt before being stored — we never store plain-text passwords.',
      },
      {
        subtitle: 'Google Sign-In Data',
        text: 'If you choose to sign in with Google via Firebase Authentication, we receive your Google account ID, display name, email address, and profile photo URL from Google. We use this information solely to authenticate your account.',
      },
      {
        subtitle: 'Booking Information',
        text: 'When you make a room or event reservation, we collect your guest details (first name, last name, email, phone number), check-in and check-out dates, number of guests, room/package preferences, special requests, and payment method selection.',
      },
      {
        subtitle: 'Contact Form Submissions',
        text: 'When you submit our contact form, we collect your full name, email address, phone number (optional), subject line, and message content to respond to your inquiry.',
      },
      {
        subtitle: 'Event Reservation Information',
        text: 'For event bookings, we additionally collect the event type, event date, time slot preference, number of guests, decoration preferences, and food package selection.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Reservation & Service Delivery',
        text: 'To process and manage your room bookings and event reservations, track availability, handle booking confirmations, and communicate updates about your stay.',
      },
      {
        subtitle: 'Account Management',
        text: 'To create and maintain your user account, authenticate your identity during login, and allow you to view your booking history and profile details.',
      },
      {
        subtitle: 'Customer Support',
        text: 'To respond to your inquiries submitted through our contact form and provide assistance before, during, and after your visit.',
      },
      {
        subtitle: 'Administrative Operations',
        text: 'To generate internal reports, manage room availability, and oversee booking operations through our admin dashboard.',
      },
      {
        subtitle: 'Legal Compliance',
        text: 'To comply with applicable laws and regulations, including the Sri Lankan Personal Data Protection Act (PDPA), No. 9 of 2022, tax obligations, and government reporting requirements.',
      },
    ],
  },
  {
    id: 'data-sharing',
    title: '3. Data Sharing & Third-Party Services',
    content: [
      {
        subtitle: 'Firebase / Google Authentication',
        text: 'We use Google Firebase for "Sign in with Google" functionality. When you use this feature, your authentication data (UID, display name, email, and profile photo) is processed by Google/Firebase. Please refer to Google\'s Privacy Policy for details.',
      },
      {
        subtitle: 'Cloudinary (Image Hosting)',
        text: 'We use Cloudinary to host and deliver images displayed on our website (such as room photos and our logo). Cloudinary may collect standard web server logs when images are loaded.',
      },
      {
        subtitle: 'Google Places API',
        text: 'We use the Google Places API (v1) to display real customer reviews and ratings from our Google Maps listing on our website. This data is public and is fetched directly from Google.',
      },
      {
        subtitle: 'Google Maps',
        text: 'Our Contact Us page includes an embedded Google Map showing our location. Google may collect usage data through this embed; please refer to Google\'s Privacy Policy for details.',
      },
      {
        subtitle: 'Google Fonts',
        text: 'We load fonts (Inter, Playfair Display) from Google Fonts. When you visit our site, your browser makes a request to Google\'s servers to load these fonts.',
      },
      {
        subtitle: 'No Sale of Data',
        text: 'We do not sell, trade, or rent your personal information to any third parties for their marketing purposes.',
      },
    ],
  },
  {
    id: 'data-storage',
    title: '4. Data Storage & Security',
    content: [
      {
        subtitle: 'Database Storage',
        text: 'Your personal data is stored in a MongoDB database. We implement security measures including password hashing (bcrypt with salt), and access controls to protect your information.',
      },
      {
        subtitle: 'Local Storage',
        text: 'We use your browser\'s localStorage to store your login session information (such as your name and authentication state) so you remain logged in as you navigate the site. This data stays on your device and is cleared when you log out.',
      },
      {
        subtitle: 'Session Timeout',
        text: 'For security, your session will automatically expire after 15 minutes of inactivity, at which point your locally stored session data is cleared.',
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain your personal information for as long as your account is active or for a period required to fulfill the purposes outlined in this policy. Specifically, booking and financial records are retained for a minimum of 7 years to comply with Sri Lankan tax and legal requirements.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking',
    content: [
      {
        subtitle: 'Our Cookie Usage',
        text: 'Our website does not use cookies for tracking or analytics purposes. We do not use Google Analytics or any similar tracking services.',
      },
      {
        subtitle: 'Local Storage',
        text: 'Instead of cookies, we use browser localStorage solely to maintain your login session. This is not used for tracking or advertising.',
      },
      {
        subtitle: 'Third-Party Cookies',
        text: 'Embedded third-party services (such as Google Maps on our Contact page or Google Places reviews) may set their own cookies for performance, security, and analysis. These are governed by the respective third party\'s privacy policy and are not controlled by us.',
      },
    ],
  },
  {
    id: 'payment',
    title: '6. Payment Information',
    content: [
      {
        subtitle: 'On-Site Payments',
        text: 'All payments for room bookings and events are processed on-site at our resort. We do not collect or store credit card numbers, bank account details, or any sensitive financial information through our website.',
      },
      {
        subtitle: 'Booking Amounts',
        text: 'We store the booking amount, subtotal, and any applicable discounts in our system for record-keeping and administrative purposes only.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You can view and update your personal information (name, email, phone) through your Profile page at any time after logging in.',
      },
      {
        subtitle: 'Account Deletion',
        text: 'You may request that we delete your account and associated personal data by contacting us. Please note that we may retain certain booking records as required by law.',
      },
      {
        subtitle: 'Data Inquiry',
        text: 'You have the right to request details about what personal information we hold about you. Contact us using the details below to make such a request.',
      },
    ],
  },
  {
    id: 'children',
    title: "8. Children's Privacy",
    content: [
      {
        subtitle: '',
        text: 'Our website is not directed at children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected information from a child under 13, we will take steps to delete it promptly. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.',
      },
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: [
      {
        subtitle: '',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of our website after any changes constitutes your acceptance of the updated policy.',
      },
    ],
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: [
      {
        subtitle: '',
        text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please contact us:',
      },
    ],
  },
]

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-teal-500/20 border border-teal-500/40 rounded-full text-teal-400 text-xs font-semibold tracking-widest uppercase mb-6">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-navy-300 text-lg mb-4 max-w-2xl mx-auto">
            Dutch Point Negombo Beach Resort is committed to protecting your privacy
            and handling your personal data responsibly.
          </p>
          <p className="text-navy-400 text-sm">
            Last Updated: <span className="text-teal-400 font-medium">April 8, 2026</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

        {/* Intro */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
          <p className="text-navy-300 leading-relaxed text-sm">
            This Privacy Policy explains how <strong className="text-white">Dutch Point Negombo Beach Resort</strong> ("we," "us," or "our"),
            located at 111/1c Pitipana St, Negombo 11500, Sri Lanka, collects, uses, discloses, and safeguards
            your personal information when you visit our website or make a reservation. Please read this policy
            carefully. By using our website, you agree to the practices described herein.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-teal-500/30 transition-colors duration-300"
            >
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                <span className="w-1 h-6 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full flex-shrink-0" />
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.content.map((item, idx) => (
                  <div key={idx}>
                    {item.subtitle && (
                      <h3 className="text-teal-400 font-semibold text-sm mb-1">{item.subtitle}</h3>
                    )}
                    <p className="text-navy-300 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Contact details card */}
              {section.id === 'contact' && (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Address', value: '111/1c Pitipana St, Negombo 11500, Sri Lanka' },
                    { label: 'Phone', value: '0764219211' },
                    { label: 'Email', value: 'dutchpointresort@gmail.com' },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                    >

                      <div className="text-teal-400 text-xs font-semibold uppercase tracking-wide mb-1">{c.label}</div>
                      <div className="text-navy-300 text-xs leading-relaxed">{c.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-teal-500/25"
          >
            ← Back to Home
          </Link>
          <p className="text-navy-500 text-xs mt-4">
            Have questions?{' '}
            <Link to="/contact-us" className="text-teal-400 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
