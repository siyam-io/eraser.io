import Header from "../_components/Header";
import Link from "next/link";

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] border-b-8 border-[#121212] pb-8 mb-16">
          Manifesto
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1040C0] border-4 border-[#121212] shadow-[12px_12px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-300 cursor-pointer flex flex-col">
            <div className="h-80 border-b-4 border-[#121212] bg-[#F0C020] relative overflow-hidden flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-[#D02020] border-4 border-[#121212] mix-blend-multiply" />
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#121212 3px, transparent 3px)', backgroundSize: '24px 24px', opacity: 0.2 }} />
            </div>
            <div className="p-8 md:p-12 text-white flex-1 flex flex-col">
              <span className="font-bold uppercase tracking-widest mb-6 inline-block bg-white text-[#121212] px-3 py-1 border-2 border-[#121212] w-fit shadow-[4px_4px_0px_0px_#121212]">Theory</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] mb-8">Form Follows Function in React</h2>
              <p className="font-medium text-xl leading-relaxed opacity-90 mb-12 max-w-2xl">
                Building interfaces without unnecessary ornament. Applying the core principles of constructivism to modern web components.
              </p>
              <div className="mt-auto font-black uppercase tracking-widest text-2xl flex items-center gap-4 group">
                Read
                <div className="w-6 h-6 bg-[#F0C020] border-4 border-[#121212] group-hover:translate-x-4 transition-transform duration-300 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-8">
            {[
              { title: "Primary Colors in UI", cat: "Design", color: "bg-[#D02020]" },
              { title: "Hard Shadows Guide", cat: "CSS", color: "bg-white" },
              { title: "Grid Asymmetry", cat: "Layout", color: "bg-[#F0C020]" }
            ].map((post, idx) => (
              <div key={idx} className={`${post.color} border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-200 cursor-pointer flex-1 flex flex-col group`}>
                <span className="font-bold uppercase tracking-widest text-sm border-2 border-[#121212] px-2 py-1 w-fit mb-6 bg-white text-[#121212] shadow-[4px_4px_0px_0px_#121212]">{post.cat}</span>
                <h3 className={`text-3xl font-black uppercase leading-[0.9] ${post.color === 'bg-[#D02020]' ? 'text-white' : 'text-[#121212]'}`}>{post.title}</h3>
                <div className="mt-auto pt-8 flex justify-end">
                   <div className={`w-8 h-8 border-4 border-[#121212] ${idx === 1 ? 'rounded-full' : idx === 2 ? '[clip-path:polygon(50%_0%,0%_100%,100%_100%)] bg-[#1040C0]' : 'bg-white rounded-none'} group-hover:rotate-90 transition-transform duration-300`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
