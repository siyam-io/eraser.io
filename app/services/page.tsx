import Header from "../_components/Header";

export default function Services() {
  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212]">
      <Header />
      
      <div className="bg-[#1040C0] border-b-4 border-[#121212] py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Shapes */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-4 border-[#121212] opacity-50 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-48 h-48 border-4 border-[#121212] rotate-45 opacity-50 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter leading-[0.9]">
            Enterprise <br/>Systems
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-8">
          {[
            { title: "Custom Deployments", iconColor: "bg-[#D02020]", shape: "rounded-full" },
            { title: "Security Layers", iconColor: "bg-[#F0C020]", shape: "rounded-none rotate-45" },
            { title: "API Modules", iconColor: "bg-[#1040C0]", shape: "[clip-path:polygon(50%_0%,0%_100%,100%_100%)]" },
            { title: "24/7 Support", iconColor: "bg-white", shape: "rounded-none" }
          ].map((service, idx) => (
            <div key={idx} className="bg-white border-4 border-[#121212] p-8 md:p-12 shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-2 transition-transform duration-300 flex flex-col md:flex-row items-start gap-8">
              <div className={`w-20 h-20 ${service.iconColor} ${service.shape} border-4 border-[#121212] shrink-0 flex-none shadow-[4px_4px_0px_0px_#121212]`} />
              <div>
                <h3 className="text-3xl font-black uppercase mb-4">{service.title}</h3>
                <p className="font-medium text-lg leading-relaxed text-[#121212]/80">
                  Strict geometric precision applied to enterprise architecture. Scalable, secure, and purely functional design.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
