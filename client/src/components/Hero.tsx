export default function Hero() {
  return (
    <section className="h-screen bg-black relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1920&q=80)`,
          filter: 'brightness(0.35)'
        }}
      ></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>

      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-900/10 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="relative text-center px-6 text-white max-w-5xl">
        {/* Top accent */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-200/40"></div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-amber-100/60 font-light">
            Est. Crafted Attars
          </p>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-200/40"></div>
        </div>

        {/* Main title */}
        <h1 className="text-[clamp(4rem,12vw,9rem)] font-extralight tracking-[-0.02em] mb-6 leading-none">
          <span className="block bg-gradient-to-b from-white via-amber-50 to-amber-100/80 bg-clip-text text-transparent">
            ITRAANA
          </span>
        </h1>

        {/* Subtitle with ornamental divider */}
        <div className="space-y-6">
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-200/30 to-transparent"></div>
          
          <p className="text-[11px] uppercase tracking-[0.4em] text-amber-50/70 font-light leading-relaxed">
            Timeless Attars <span className="text-amber-200/40 mx-3">·</span> Pure Essence <span className="text-amber-200/40 mx-3">·</span> Quiet Luxury
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/40">Discover</p>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
