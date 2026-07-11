import { Link } from 'react-router-dom'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: [
      {
        subtitle: '',
        text: 'By accessing and using the Dutch Point Negombo Beach Resort website ("Site"), you agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations of Sri Lanka. If you do not agree with any of these Terms, you must not use the Site. We reserve the right to modify these Terms at any time; continued use of the Site constitutes acceptance of any changes.',
      },
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: [
      {
        subtitle: 'Age Requirement',
        text: 'You must be at least 18 years of age to create an account, make a booking, or submit an event reservation through our Site. By using our services, you represent and warrant that you meet this age requirement.',
      },
      {
        subtitle: 'Account Responsibility',
        text: 'If you create an account (either via email/password registration or Google Sign-In), you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.',
      },
    ],
  },
  {
    id: 'room-bookings',
    title: '3. Room Reservations',
    content: [
      {
        subtitle: 'Booking Process',
        text: 'Room reservations are made through our website by selecting a room category (Deluxe, Semi-Luxury, Luxury, or Day Outing), choosing dates and guest count, and providing guest information. A booking confirmation will be displayed on-screen and sent to the email address you provide.',
      },
      {
        subtitle: 'Room Categories & Packages',
        text: 'Rooms are offered under "Full Board" and "Day Use" packages. Full Board reservations include overnight stays with check-in between 12:00 PM – 2:00 PM and check-out between 9:00 AM – 11:00 AM. Day Use access is from 9:00 AM – 7:00 PM on the selected date.',
      },
      {
        subtitle: 'Availability & Confirmation',
        text: 'All bookings are subject to availability. A reservation is only confirmed once you receive a booking confirmation with a unique Booking ID (e.g., BK-XXXXXX). We reserve the right to decline or cancel bookings at our discretion due to availability constraints or policy violations.',
      },
      {
        subtitle: 'Non-Refundable Policy',
        text: 'All room bookings are non-refundable once confirmed. By completing a reservation, you acknowledge and accept this policy. We strongly recommend verifying your dates, times, and room selection before confirming your booking.',
      },
      {
        subtitle: 'Guest Capacity',
        text: 'Rooms have maximum guest capacity limits. You must select a room that accommodates the number of guests in your party. We reserve the right to refuse check-in if the actual number of guests exceeds the room\u0027s stated capacity.',
      },
    ],
  },
  {
    id: 'event-bookings',
    title: '4. Event Reservations',
    content: [
      {
        subtitle: 'Event Types',
        text: 'We host Birthday Parties, Weddings, Anniversaries, and Corporate Events. Event bookings are made through our Event Management page and require you to select an event type, date, time slot (Day or Night), guest count, decoration style, and food package.',
      },
      {
        subtitle: 'Pricing',
        text: 'Event pricing is composed of a decoration package fee and a per-head food package fee multiplied by the number of guests. Final prices displayed are estimates and may vary based on specific requirements and seasonal availability.',
      },
      {
        subtitle: 'Authentication Required',
        text: 'You must be logged in with a valid account to complete an event booking. Guest (unauthenticated) event bookings are not permitted.',
      },
      {
        subtitle: 'Event Availability',
        text: 'Event availability is checked in real-time. Only one event may be booked per time slot (Day or Night) on any given date. If your selected slot is already reserved, you will be prompted to choose an alternative.',
      },
    ],
  },
  {
    id: 'payment',
    title: '5. Payment Terms',
    content: [
      {
        subtitle: 'On-Site Payment',
        text: 'All payments for room bookings are currently processed on-site at our resort upon arrival. We do not collect credit card numbers, bank account details, or any sensitive financial information through this website.',
      },
      {
        subtitle: 'Currency',
        text: 'All prices displayed on the Site are quoted in Sri Lankan Rupees (LKR) unless otherwise stated. Event pricing may be displayed in USD for international reference.',
      },
      {
        subtitle: 'Price Changes',
        text: 'We reserve the right to change room rates, package prices, and event pricing at any time without prior notice. However, confirmed bookings will be honoured at the price quoted at the time of reservation.',
      },
    ],
  },
  {
    id: 'cancellation',
    title: '6. Cancellation & Modifications',
    content: [
      {
        subtitle: 'Cancellation by Guest',
        text: 'Booking cancellations may be requested by contacting us directly. As all bookings are non-refundable, cancellation will not result in a refund. Booking status can transition through pending, confirmed, completed, or cancelled states as managed by our team.',
      },
      {
        subtitle: 'Cancellation by Resort',
        text: 'Dutch Point Negombo Beach Resort reserves the right to cancel a reservation due to force majeure events, property maintenance, safety concerns, or violation of these Terms. In such cases, we will make reasonable efforts to offer an alternative date or accommodation.',
      },
      {
        subtitle: 'Modifications',
        text: 'Modifications to confirmed bookings (such as date changes) are subject to availability and must be requested by contacting us directly. We cannot guarantee modifications will be accommodated.',
      },
    ],
  },
  {
    id: 'user-conduct',
    title: '7. User Conduct',
    content: [
      {
        subtitle: 'Acceptable Use',
        text: 'You agree to use the Site only for lawful purposes and in accordance with these Terms. You shall not use the Site to make fraudulent bookings, impersonate another person, submit false information, or interfere with the proper functioning of the Site.',
      },
      {
        subtitle: 'Account Suspension',
        text: 'We reserve the right to suspend or terminate your account (with status set to "Inactive" or "Suspended") if we determine, in our sole discretion, that you have violated these Terms or engaged in conduct detrimental to the resort or other guests.',
      },
      {
        subtitle: 'Property Rules',
        text: 'All guests are expected to comply with resort policies and rules during their stay, including pool safety rules, noise restrictions, and property care. The resort reserves the right to refuse service or remove guests who violate these rules.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    content: [
      {
        subtitle: 'Ownership',
        text: 'All content on this website — including text, graphics, logos, images, room photographs, page layouts, and software — is the property of Dutch Point Negombo Beach Resort or its licensors and is protected by Sri Lankan and international copyright and intellectual property laws.',
      },
      {
        subtitle: 'Limited License',
        text: 'You are granted a limited, non-exclusive, non-transferable license to access and use the Site for personal, non-commercial purposes only. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.',
      },
      {
        subtitle: 'Third-Party Content',
        text: 'Guest reviews displayed on our Site are sourced from the Google Places API and remain the intellectual property of their respective authors and Google. Room images are hosted via Cloudinary. All third-party trademarks, logos, and service marks are the property of their respective owners.',
      },
    ],
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers & Limitation of Liability',
    content: [
      {
        subtitle: 'As-Is Basis',
        text: 'The Site and all services are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.',
      },
      {
        subtitle: 'Limitation of Liability',
        text: 'To the maximum extent permitted by Sri Lankan law, Dutch Point Negombo Beach Resort shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Site or services, including but not limited to loss of data, loss of revenue, or personal injury.',
      },
      {
        subtitle: 'Third-Party Services',
        text: 'We are not responsible for the availability, accuracy, or content of third-party services integrated into our Site, including Google Authentication, Google Maps, Google Places, and Cloudinary. Your use of these services is subject to their respective terms and policies.',
      },
    ],
  },
  {
    id: 'privacy',
    title: '10. Privacy',
    content: [
      {
        subtitle: '',
        text: 'Your use of the Site is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information in compliance with the Sri Lankan Personal Data Protection Act (PDPA), No. 9 of 2022. By using the Site, you consent to the practices described in our Privacy Policy.',
      },
    ],
  },
  {
    id: 'governing-law',
    title: '11. Governing Law & Dispute Resolution',
    content: [
      {
        subtitle: 'Jurisdiction',
        text: 'These Terms shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka, without regard to its conflict of law provisions.',
      },
      {
        subtitle: 'Dispute Resolution',
        text: 'Any disputes arising out of or in connection with these Terms shall first be attempted to be resolved amicably through direct negotiation. If a resolution cannot be reached, disputes shall be submitted to the exclusive jurisdiction of the courts of Negombo, Sri Lanka.',
      },
    ],
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    content: [
      {
        subtitle: '',
        text: 'If you have any questions or concerns regarding these Terms of Service, please contact us:',
      },
    ],
  },
]

const TermsOfService = () => {
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
            Terms of Service
          </h1>
          <p className="text-navy-300 text-lg mb-4 max-w-2xl mx-auto">
            Please read these terms carefully before using the Dutch Point
            Negombo Beach Resort website or making a reservation.
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
            These Terms of Service ("Terms") govern your access to and use of the website operated by{' '}
            <strong className="text-white">Dutch Point Negombo Beach Resort</strong> ("we," "us," or "our"),
            located at 111/1c Pitipana St, Negombo 11500, Sri Lanka. These Terms apply to all visitors,
            registered users, and guests who access the Site or use our reservation services.
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

              {/* Privacy Policy link */}
              {section.id === 'privacy' && (
                <div className="mt-5">
                  <Link
                    to="/privacy-policy"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 rounded-xl font-semibold text-sm hover:bg-teal-500/20 transition-all duration-300"
                  >
                    📄 Read Our Privacy Policy
                  </Link>
                </div>
              )}

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

export default TermsOfService
