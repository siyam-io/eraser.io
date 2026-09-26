import Header from "../_components/Header";

export default function History() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-center mb-24">
          Timeline
        </h1>
        
        <div className="max-w-4xl mx-auto border-l-8 border-[#121212] pl-8 md:pl-16 space-y-24 relative">
          {[
            { year: "2024", title: "Foundation", color: "bg-[#D02020]", shape: "rounded-full" },
            { year: "2025", title: "Beta Phase", color: "bg-[#1040C0]", shape: "rounded-none" },
            { year: "2026", title: "Scale", color: "bg-[#F0C020]", shape: "[clip-path:polygon(50%_0%,0%_100%,100%_100%)]" }
          ].map((milestone, idx) => (
            <div key={idx} className="relative group">
              <div className={`absolute -left-[56px] md:-left-[88px] top-0 w-12 h-12 ${milestone.color} ${milestone.shape} border-4 border-[#121212] group-hover:scale-125 transition-transform duration-300 origin-center`} />
              
              <div className="bg-white border-4 border-[#121212] p-8 md:p-12 shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-300 relative">
                <span className="absolute -top-12 right-4 text-8xl font-black text-[#121212]/5 z-0">{milestone.year}</span>
                <div className="relative z-10">
                  <h3 className="text-4xl font-black uppercase mb-6">{milestone.title}</h3>
                  <p className="font-medium text-lg leading-relaxed max-w-lg">
                    The structure was built. We assembled the core geometric pieces and aligned them to the grid. Form followed function perfectly.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
