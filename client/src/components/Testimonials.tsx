export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-black text-white">
      {/* Divider */}
      <div className="border-t border-white/20" />

      <div className="max-w-[1400px] mx-auto px-8 py-28 text-center">
        
        {/* Label */}
        <p className="text-xs tracking-widest uppercase text-white/60 mb-10">
          Voices from Our Community
        </p>

        {/* Quote */}
        <blockquote className="text-2xl md:text-3xl leading-relaxed font-light max-w-4xl mx-auto mb-12">
          “The attention to detail is unmistakable. Every piece feels
          intentional, refined, and built to last — this is modern luxury
          done right.”
        </blockquote>

        {/* Customer */}
        <p className="text-xs tracking-widest uppercase text-white/50 mb-16">
          — Verified Customer, New Delhi
        </p>

        {/* Secondary quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto text-left">
          
          <blockquote className="text-lg leading-relaxed text-white/80">
            “What stood out was not just the design, but how effortlessly it
            fits into everyday life. Quiet confidence.”
            <span className="block mt-6 text-xs tracking-widest uppercase text-white/40">
              — Customer, Mumbai
            </span>
          </blockquote>

          <blockquote className="text-lg leading-relaxed text-white/80">
            “Minimal, purposeful, and beautifully crafted. I’ve never felt
            the need to explain my choice — it speaks for itself.”
            <span className="block mt-6 text-xs tracking-widest uppercase text-white/40">
              — Customer, Bengaluru
            </span>
          </blockquote>

        </div>
      </div>
    </section>
  );
}
