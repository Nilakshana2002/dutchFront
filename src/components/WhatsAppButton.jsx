import React from 'react';

const WhatsAppButton = () => {
  // Use Sri Lankan country code (+94) for the 076 number
  const phoneNumber = "94764219211";
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
      style={{ boxShadow: '0 4px 14px 0 rgba(37, 211, 102, 0.39)' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        viewBox="0 0 16 16"
        className="group-hover:rotate-12 transition-transform duration-300"
      >
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.33 6.33 0 0 1-3.23-.881l-.23-.137-2.404.63.64-2.34-.15-.24a6.3 6.3 0 0 1-1.002-3.405c.005-3.484 2.845-6.324 6.33-6.324a6.3 6.3 0 0 1 4.474 1.85 6.3 6.3 0 0 1 1.848 4.473c-.005 3.483-2.845 6.323-6.33 6.323zm3.467-4.736c-.19-.096-1.125-.556-1.3-.618-.174-.063-.301-.096-.428.094-.127.192-.49.618-.6.745-.111.127-.223.144-.413.048-.191-.096-.803-.296-1.53-.941-.566-.502-.95-1.12-1.062-1.311-.111-.191-.012-.294.083-.39.085-.084.19-.22.285-.33.095-.11.127-.19.19-.317.063-.127.032-.24-.015-.334-.048-.096-.428-1.032-.586-1.413-.155-.371-.312-.32-.428-.326-.111-.005-.24-.006-.367-.006a.71.71 0 0 0-.518.241c-.191.192-.728.711-.728 1.734 0 1.024.745 2.012.85 2.139.105.127 1.455 2.222 3.525 3.115.493.213.877.34 1.176.435.495.157.946.134 1.303.081.405-.06 1.125-.459 1.283-.902.158-.444.158-.825.111-.903-.048-.078-.175-.125-.366-.221z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
