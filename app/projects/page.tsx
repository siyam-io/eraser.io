import Header from "../_components/Header";

export default function Projects() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      <Header />
      
      <div className="bg-[#F0C020] border-b-4 border-[#121212] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          <h1 className="text-6xl md:text-8xl font-black text-[#121212] uppercase tracking-tighter leading-[0.9] z-10 relative">
            Constructed <br/>Works
          </h1>
          <div className="absolute right-0 top-0 hidden md:flex items-center justify-center">
             <div className="w-48 h-48 bg-[#D02020] border-4 border-[#121212] rounded-full shadow-[8px_8px_0px_0px_#121212] mix-blend-multiply" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-4 border-[#121212] bg-[#121212] shadow-[12px_12px_0px_0px_#121212]">
          {[
            { name: "Acme Base", tag: "Design", color: "bg-[#D02020]" },
            { name: "Global API", tag: "System", color: "bg-white" },
            { name: "UI Framework", tag: "Module", color: "bg-[#1040C0]" },
            { name: "Q3 Campaign", tag: "Print", color: "bg-white" },
            { name: "Data Core", tag: "Engineering", color: "bg-[#F0C020]" },
            { name: "Flow Logic", tag: "Product", color: "bg-white" }
          ].map((project, idx) => (
            <div key={idx} className={`${project.color} border-[2px] border-[#121212] aspect-square p-8 flex flex-col justify-between group cursor-pointer hover:bg-[#121212] transition-colors duration-300`}>
              <div className="flex justify-between items-start">
                <span className="font-bold uppercase tracking-widest text-sm border-2 border-current px-3 py-1 group-hover:text-white group-hover:border-white transition-colors">{project.tag}</span>
                <div className={`w-8 h-8 border-4 border-current ${idx % 3 === 0 ? 'rounded-full' : idx % 2 === 0 ? 'rounded-none' : '[clip-path:polygon(50%_0%,0%_100%,100%_100%)]'} group-hover:border-white transition-colors`} />
              </div>
              <h3 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] group-hover:text-white transition-colors">{project.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
