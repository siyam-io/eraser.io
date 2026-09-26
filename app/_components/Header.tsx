"use client";

import React, { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { name: "About", path: "/about" },
  { name: "Careers", path: "/careers" },
  { name: "Changelog", path: "/history" },
  { name: "Features", path: "/services" },
  { name: "Templates", path: "/projects" },
  { name: "Blog", path: "/blog" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <header className="border-b-4 border-foreground bg-background">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 md:px-8 lg:px-12">
          {/* Wordmark: black square, white core — inversion, not color */}
          <Link
            className="group flex items-center gap-3"
            href="/"
            aria-label="Erasior — home"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center bg-foreground"
              aria-hidden="true"
            >
              <span className="size-2.5 bg-background transition-colors duration-100 group-hover:bg-foreground" />
            </span>
            <span className="font-display text-2xl font-black tracking-tighter uppercase">
              Erasior
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <nav aria-label="Global" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      className="font-mono text-[11px] tracking-[0.15em] uppercase hover:underline decoration-2 underline-offset-[6px]"
                      href={link.path}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/login"
                className="border-2 border-foreground px-5 py-2.5 font-mono text-[11px] font-medium tracking-widest uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="border-2 border-foreground bg-foreground px-5 py-2.5 font-mono text-[11px] font-medium tracking-widest text-background transition-colors duration-100 hover:bg-background hover:text-foreground"
              >
                Register
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="border-2 border-foreground p-2 transition-colors duration-100 hover:bg-foreground hover:text-background lg:hidden"
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="butt"
                  strokeLinejoin="miter"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile disclosure — instant, no easing */}
        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="border-t-2 border-foreground lg:hidden"
          >
            <ul className="mx-auto w-full max-w-6xl px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.name} className="border-b border-border-light last:border-b-0">
                  <Link
                    className="block py-3 font-mono text-xs tracking-[0.15em] uppercase hover:underline decoration-2 underline-offset-4"
                    href={link.path}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="flex gap-3 pt-4 sm:hidden">
                <Link
                  href="/login"
                  className="flex-1 border-2 border-foreground px-5 py-3 text-center font-mono text-[11px] font-medium tracking-widest uppercase"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 border-2 border-foreground bg-foreground px-5 py-3 text-center font-mono text-[11px] font-medium tracking-widest text-background"
                >
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
