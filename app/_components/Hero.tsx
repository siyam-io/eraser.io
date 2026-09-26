import React from 'react'
import Link from 'next/link'

const Hero = () => {
  return (
    <section className="bg-[#F0F0F0] border-b-4 border-[#121212] overflow-hidden">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-2 lg:min-h-[calc(100vh-96px)]">
        {/* Left Content */}
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-12 lg:py-24 border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] bg-white">
          <div className="w-12 h-12 bg-[#F0C020] border-4 border-[#121212] rounded-full mb-8 shadow-[4px_4px_0px_0px_#121212]" />
          <h1 className="text-6xl sm:text-8xl font-black text-[#121212] uppercase tracking-tighter leading-[0.9] mb-8">
            Build <br/>
            The <br/>
            <span className="text-[#D02020] inline-block -rotate-2 hover:rotate-0 transition-transform duration-300">Future</span>
          </h1>
          <p className="text-xl font-medium text-[#121212] max-w-md border-l-4 border-[#1040C0] pl-6 mb-12">
            A collaborative workspace where pure geometry meets functional design. Organize thoughts, draw systems, and work together.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="font-bold uppercase tracking-widest bg-[#1040C0] text-white border-4 border-[#121212] px-8 py-4 shadow-[8px_8px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out"
            >
              Start Creating
            </Link>
            <Link
              href="/about"
              className="font-bold uppercase tracking-widest bg-[#F0F0F0] text-[#121212] border-4 border-[#121212] px-8 py-4 shadow-[8px_8px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out hover:bg-[#E0E0E0]"
            >
              Discover How
            </Link>
          </div>
        </div>

        {/* Right Composition */}
        <div className="bg-[#1040C0] relative min-h-[500px] lg:min-h-full flex items-center justify-center overflow-hidden">
          {/* Bauhaus Abstract Composition */}
          <div className="relative w-full max-w-md aspect-square z-10">
            <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-[#D02020] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] hover:-translate-y-4 transition-transform duration-300 ease-out" />
            
            <div className="absolute bottom-10 right-10 w-56 h-56 rounded-none bg-[#F0C020] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] rotate-45 hover:rotate-90 transition-transform duration-500 ease-out origin-center" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#F0F0F0] border-4 border-[#121212] shadow-[12px_12px_0px_0px_#121212] z-20 flex items-center justify-center">
              <div className="w-20 h-20 bg-[#121212] [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
            </div>
          </div>
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#121212 3px, transparent 3px)', backgroundSize: '32px 32px' }} />
        </div>
      </div>
    </section>
  )
}

export default Hero