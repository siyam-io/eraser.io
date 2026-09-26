import Header from "../_components/Header";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-24">
          <div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
              We <br/><span className="text-[#D02020]">Construct</span><br/> Ideas
            </h1>
            <p className="text-xl font-medium border-l-4 border-[#121212] pl-6 leading-relaxed max-w-xl">
              A passionate team of designers and engineers embracing functional honesty. We eliminate the friction between thinking and creating.
            </p>
          </div>
          <div className="relative aspect-square max-w-md mx-auto w-full">
             <div className="absolute inset-0 bg-[#F0C020] rounded-full border-4 border-[#121212] shadow-[12px_12px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-300 ease-out flex items-center justify-center">
                <div className="w-1/2 h-1/2 bg-[#1040C0] border-4 border-[#121212] rotate-45" />
             </div>
          </div>
        </div>

        {/* 3 Col Grid */}
        <div className="grid md:grid-cols-3 gap-8 pt-12 border-t-4 border-[#121212]">
          {[
            { title: "Mission", text: "To eliminate the friction between thinking and creating.", color: "bg-[#D02020]" },
            { title: "Vision", text: "A unified workspace where documentation lives with design.", color: "bg-[#1040C0]" },
            { title: "Values", text: "Pure functionality without unnecessary decoration.", color: "bg-[#F0C020]" }
          ].map((item, i) => (
            <div key={i} className="bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-300 ease-out relative">
              <div className={`absolute -top-6 -right-6 w-12 h-12 ${item.color} border-4 border-[#121212] ${i === 0 ? 'rounded-full' : i === 1 ? 'rounded-none' : '[clip-path:polygon(50%_0%,0%_100%,100%_100%)]'}`} />
              <h3 className="text-3xl font-black uppercase mb-4">{item.title}</h3>
              <p className="font-medium text-lg leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
