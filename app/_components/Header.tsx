// Custom Auth used via NextAuth
import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-white border-b-4 border-[#121212]">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Geometric Logo */}
        <Link className="flex items-center gap-2 group" href="/">
          <div className="flex -space-x-3 mix-blend-multiply">
            <div className="w-8 h-8 rounded-full bg-[#D02020] border-2 border-[#121212] group-hover:-translate-y-1 transition-transform" />
            <div className="w-8 h-8 rounded-none bg-[#1040C0] border-2 border-[#121212] group-hover:-translate-y-1 delay-75 transition-transform" />
            <div className="w-8 h-8 bg-[#F0C020] border-2 border-[#121212] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] group-hover:-translate-y-1 delay-150 transition-transform" />
          </div>
          <span className="font-black text-3xl tracking-tighter uppercase text-[#121212] ml-4">
            ERASIOR
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between ml-12">
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm">
              {[
                { name: "About", path: "/about" },
                { name: "Careers", path: "/careers" },
                { name: "History", path: "/history" },
                { name: "Services", path: "/services" },
                { name: "Projects", path: "/projects" },
                { name: "Blog", path: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    className="font-bold text-[#121212] uppercase tracking-widest hover:text-[#D02020] transition-colors relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-1 after:bg-[#D02020] hover:after:w-full after:transition-all after:duration-300"
                    href={link.path}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4 hidden">
              <Link href="/login" className="font-bold uppercase tracking-widest bg-white text-[#121212] border-2 border-[#121212] px-6 py-2 shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out inline-block">
                Login
              </Link>

              <Link href="/register" className="font-bold uppercase tracking-widest bg-[#D02020] text-white border-2 border-[#121212] px-6 py-2 shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out inline-block">
                Register
              </Link>
            </div>

            <button className="block rounded-none border-2 border-[#121212] bg-white p-2 text-[#121212] md:hidden shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out">
              <span className="sr-only">Toggle menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="butt" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
