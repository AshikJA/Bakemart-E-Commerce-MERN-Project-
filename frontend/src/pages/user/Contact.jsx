import React from 'react'

function Contact() {
  return (
    <div>
      <section className="py-30 bg-[#FDF6EC]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3D2B1F] mb-6">
                Get in <span className="text-[#D4A96A]">Touch</span>
              </h2>
              <p className="text-lg text-[#5D4037] mb-8 leading-relaxed">
                We'd love to hear from you! Whether you have a question, 
                need assistance, or just want to share your thoughts, we're 
                here to help.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#D4A96A] p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#3D2B1F] mb-1">Email Us</h3>
                    <p className="text-[#5D4037]">{import.meta.env.VITE_EMAIL_ADDRESS}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#D4A96A] p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#3D2B1F] mb-1">Call Us</h3>
                    <p className="text-[#5D4037]">{import.meta.env.VITE_PHONE_NO}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#D4A96A] p-3 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#3D2B1F] mb-1">Visit Us</h3>
                    <p className="text-[#5D4037]">{import.meta.env.VITE_SHOP_ADDRESS}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#E0E0E0] focus:border-[#D4A96A] focus:ring-0 outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5D4037] font-medium mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#E0E0E0] focus:border-[#D4A96A] focus:ring-0 outline-none transition-colors"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#5D4037] font-medium mb-2">Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E0E0E0] focus:border-[#D4A96A] focus:ring-0 outline-none transition-colors"
                    placeholder="Subject of your message"
                  />
                </div>
                <div>
                  <label className="block text-[#5D4037] font-medium mb-2">Message</label>
                  <textarea 
                    rows="5" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#E0E0E0] focus:border-[#D4A96A] focus:ring-0 outline-none transition-colors"
                    placeholder="Your message"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#D4A96A] text-white py-3 rounded-xl font-semibold hover:bg-[#C09A5B] transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact