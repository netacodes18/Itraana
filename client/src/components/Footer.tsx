export default function Footer() {
  return (
    <footer id="about" className="bg-black text-white">
      {/* Divider */}
      <div className="border-t border-white/20" />

      {/* Top Section */}
      <div className="max-w-[1400px] mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
        
        {/* Left – Brand Statement */}
        <div>
          <p className="text-xs tracking-widest uppercase text-white/60 mb-6">
            About Itraana
          </p>
          <p className="text-sm text-white/70 leading-relaxed max-w-sm">
            ITRAANA represents the timeless art of attar — rooted in India’s
            rich heritage and reimagined for the modern world. Crafted with
            precision and purpose, our fragrances bridge tradition and
            contemporary expression, resonating both in India and beyond.
          </p>
        </div>

        {/* Center – Brand */}
        <div className="flex items-center justify-center">
          <h2 className="text-lg tracking-[0.45em] uppercase">
            ITRAANA
          </h2>
        </div>

        {/* Right – Contact */}
        <div>
          <p className="text-xs tracking-widest uppercase text-white/60 mb-6">
            Contact
          </p>
          <p className="text-sm text-white/70">
            support@itraana.com
          </p>
          <p className="text-sm text-white/70 mt-2">
            +91 9XXXX XXXXX
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20" />

      {/* Bottom Links */}
      <div className="max-w-[1400px] mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs tracking-widest uppercase text-white/70">
        
        <div className="flex flex-wrap gap-6 justify-center">
          <span className="cursor-pointer hover:text-white transition">
            Services
          </span>
          <span className="cursor-pointer hover:text-white transition">
            Shipping & Returns
          </span>
          <span className="cursor-pointer hover:text-white transition">
            Customer Care
          </span>
          <span className="cursor-pointer hover:text-white transition">
            Legal
          </span>
          <span className="cursor-pointer hover:text-white transition">
            Corporate
          </span>
          <span className="cursor-pointer hover:text-white transition">
            Follow Us
          </span>
        </div>

        <div className="cursor-pointer hover:text-white transition">
          India / English
        </div>
      </div>

      {/* Credit */}
      <div className="border-t border-white/20">
        <p className="text-center text-[10px] text-white/40 py-6 tracking-widest">
          Made with <span className="opacity-60">♥</span> by Hardyansh & Utkarsh
        </p>
      </div>
    </footer>
  );
}
