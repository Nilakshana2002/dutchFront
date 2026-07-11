import { useState } from 'react'
import Reveal from "../components/Reveal"
import Footer from "../components/Footer"
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import { SiTripadvisor } from 'react-icons/si'
import toast from 'react-hot-toast'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      // Allow only numbers and cap at 10 digits
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: sanitized });
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Validate phone number format (must be exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }

    setIsSubmitting(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })

      setTimeout(() => setIsSubmitted(false), 4000)
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      toast.error('Failed to send message: ' + error.message);
    }
  }

  return (
    <div className="w-full overflow-hidden">

      <section className="relative h-[45vh] min-h-[360px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dztzaoo6r/image/upload/v1775325412/2025-12-21_tilqwn.webp')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-900/60 to-navy-950/80" />
        <div className="relative z-10 text-center px-4">
          <span className="inline-block text-teal-300 text-sm font-semibold tracking-widest uppercase mb-4">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Contact Us
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            We'd love to hear from you. Reach out and let us help plan your perfect stay.
          </p>
        </div>
      </section>


      <section className="relative -mt-12 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '📍',
                title: 'Address',
                lines: ['111/1c Pitipana St,', 'Negombo 11500,', 'Sri Lanka'],
                gradient: 'from-teal-500 to-teal-600',
              },
              {
                icon: '📞',
                title: 'Phone',
                lines: ['0312263340'],
                gradient: 'from-blue-500 to-blue-600',
              },
              {
                icon: '✉️',
                title: 'Email',
                lines: ['dutchpointresort@gmail.com'],
                gradient: 'from-gold-500 to-gold-600',
              },
              {
                icon: '🕐',
                title: 'Business Hours',
                lines: ['Monday - Sunday: 24/7', 'Front Desk: Always Open'],
                gradient: 'from-emerald-500 to-emerald-600',
              },
            ].map((info, idx) => (
              <Reveal key={info.title} delay={idx * 0.1} width="100%">
                <div
                  className="group bg-white p-6 rounded-2xl shadow-xl border border-navy-100/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 text-center relative overflow-hidden h-full"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${info.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                  <div className="text-3xl mb-3">{info.icon}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{info.title}</h3>
                  {info.lines.map((line, i) => (
                    <p key={i} className="text-navy-600 text-sm">{line}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Reveal width="100%">
              <div>
                <span className="text-teal-600 font-semibold text-sm tracking-widest uppercase">Send a Message</span>
                <h2 className="text-3xl font-bold text-navy-900 mt-3 mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
                  We'd Love to Hear from You
                </h2>

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 font-medium flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    Thank you! We'll get back to you shortly.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-navy-800 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-navy-800 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 outline-none"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-semibold text-navy-800 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="contact-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 outline-none"
                        placeholder="e.g. 0764219211"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-semibold text-navy-800 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="contact-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 outline-none"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-navy-800 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3.5 bg-navy-50/50 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 resize-none outline-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-navy-800 to-navy-900 text-white px-6 py-4 rounded-xl font-bold text-base hover:from-navy-900 hover:to-navy-950 transition-all duration-300 shadow-lg shadow-navy-900/20 hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>
            </Reveal>


            <div>
              <span className="text-teal-600 font-semibold text-sm tracking-widest uppercase">Find Us</span>
              <h2 className="text-3xl font-bold text-navy-900 mt-3 mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
                Our Location
              </h2>
              <div className="h-[400px] rounded-2xl overflow-hidden shadow-xl border border-navy-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2778.0425804564443!2d79.81518030851676!3d7.2038132148581155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2ed0004eae449%3A0x6f7ff050cf422677!2sDutch%20point%20negombo%20beach%20resort!5e1!3m2!1sen!2slk!4v1772039369168!5m2!1sen!2slk"
                  title="Dutch Point Negombo Beach Resort Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-navy-900 mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { name: 'Facebook', icon: <FaFacebook />, color: 'hover:bg-blue-600', link: 'https://www.facebook.com/share/1D7ZsRJQKY/' },
                    { name: 'Instagram', icon: <FaInstagram />, color: 'hover:bg-pink-600', link: 'https://www.instagram.com/dutch_point_beach_resort?igsh=MTdyc2Nuc3ZpcTNxdQ==' },
                    { name: 'Twitter', icon: <FaXTwitter />, color: 'hover:bg-gray-800' },
                    { name: 'TripAdvisor', icon: <SiTripadvisor />, color: 'hover:bg-green-600' },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      className={`w-11 h-11 bg-navy-100 rounded-xl flex items-center justify-center text-navy-600 ${social.color} hover:text-white transition-all duration-300 text-sm font-bold`}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default ContactUs
