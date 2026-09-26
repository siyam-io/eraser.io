import Header from "../_components/Header";

export default function Careers() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      <Header />
      
      {/* Color Block Header */}
      <div className="bg-[#D02020] border-b-4 border-[#121212] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9]">
            Join <br/>The <br/>Movement
          </h1>
          <div className="w-40 h-40 mt-12 md:mt-0 bg-white border-4 border-[#121212] rounded-full flex items-center justify-center shadow-[8px_8px_0px_0px_#121212] rotate-12 hover:rotate-90 transition-transform duration-500">
            <span className="font-black text-2xl uppercase tracking-widest text-[#121212]">Hiring</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-black uppercase mb-12 flex items-center gap-4">
          <div className="w-8 h-8 bg-[#1040C0] border-4 border-[#121212] rounded-none" />
          Open Positions
        </h2>
        
        <div className="grid gap-8">
          {[
            { title: "Senior Frontend Engineer", dept: "Engineering", tag: "Remote" },
            { title: "Product Designer", dept: "Design", tag: "Berlin" },
            { title: "Developer Advocate", dept: "Marketing", tag: "Remote" },
          ].map((job, idx) => (
            <div key={idx} className="bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-200 flex flex-col md:flex-row items-start md:items-center justify-between group cursor-pointer">
              <div className="mb-6 md:mb-0">
                <h3 className="text-3xl font-black uppercase tracking-tight group-hover:text-[#D02020] transition-colors mb-4">{job.title}</h3>
                <div className="flex flex-wrap gap-4">
                  <span className="font-bold uppercase text-sm tracking-widest px-3 py-1 bg-[#F0C020] border-2 border-[#121212]">{job.dept}</span>
                  <span className="font-bold uppercase text-sm tracking-widest px-3 py-1 bg-[#E0E0E0] border-2 border-[#121212]">{job.tag}</span>
                </div>
              </div>
              <button className="font-bold uppercase tracking-widest bg-[#121212] text-white border-4 border-[#121212] px-8 py-4 shadow-[4px_4px_0px_0px_#F0C020] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
