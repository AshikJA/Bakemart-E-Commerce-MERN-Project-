import { GiChocolateBar } from "react-icons/gi";
import { Link } from "react-router-dom";

const navLinks = ["Home", "Contact", "About"];

const Footer = () => {
  return (
    <footer className="bg-[#6B3F1F] text-[#F5E6D3] py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
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
            {navLinks.map((l) => (
              <li key={l} >
              <Link to={l === "Home" ? "/" : `/${l.toLowerCase()}`}
              className="hover:text-[#FDF6EC] cursor-pointer transition-colors">
                {l}
              </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#FDF6EC] mb-3">Social Links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <a href="https://www.instagram.com/bakemart_sullia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==ht" target="_blank" rel="noopener noreferrer" className="hover:text-[#FDF6EC] transition-colors">
                📸 Instagram
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@Bakemart_Sullia" target="_blank" rel="noopener noreferrer" className="hover:text-[#FDF6EC] transition-colors">
                ▶️ Youtube
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FDF6EC] transition-colors">
                📘 Facebook
              </a>
            </li>
            <li>
              <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FDF6EC] transition-colors">
                🐦 Twitter
              </a>
            </li>
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
              <a href={`tel:${import.meta.env.VITE_PHONE_NO}`} className="hover:text-[#D4A96A] transition-colors">
                📞 {import.meta.env.VITE_PHONE_NO}
              </a>
            </li>
            <li>
              <a 
                href="https://www.google.com/maps/place/Bake+Mart/@12.5558833,75.3926853,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba4f3185b71c487:0x65b6d7bbf7505559!8m2!3d12.5558833!4d75.3926853!16s%2Fg%2F11kl38zy7x?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#D4A96A] transition-colors"
              >
                📍 {import.meta.env.VITE_SHOP_ADDRESS}
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