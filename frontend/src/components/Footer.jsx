import { GiChocolateBar } from "react-icons/gi";

const Footer = () => {
  return (
    <footer className="bg-[#6B3F1F] text-[#F5E6D3] py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GiChocolateBar className="text-[#FDF6EC] text-2xl" />
            <span className="font-heading text-xl font-bold text-[#FDF6EC]">
              Backe<span className="text-[#D4A96A]">Mart</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#F5E6D3] opacity-80">
            Premium chocolates, gift hampers & cake supplies — crafted with love.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[#FDF6EC] mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {["Shop", "Hampers", "Cakes", "About Us", "Contact"].map((l) => (
              <li key={l} className="hover:text-[#FDF6EC] cursor-pointer transition-colors">{l}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#FDF6EC] mb-3">Contact Us</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <a href={`mailto:${import.meta.env.VITE_EMAIL_ADDRESS}`} className="hover:text-[#D4A96A] transition-colors">
                📧 {import.meta.env.VITE_EMAIL_ADDRESS}
              </a>
            </li>
            <li>
              <a href="tel:+919483801700" className="hover:text-[#D4A96A] transition-colors">
                📞 +91 94838 01700
              </a>
            </li>
            <li>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Car+Street,+Opp.+Police+Station,+Sullia,+Karnataka,+India" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#D4A96A] transition-colors"
              >
                📍 Car Street, Opp. Police Station, Sullia, Karnataka, India
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-[#F5E6D3] opacity-50 mt-8">
        © 2026 BackeMart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;