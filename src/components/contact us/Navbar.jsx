/**
 * This code was generated by Builder.io
 */
import React from "react";

const navItems = [
  "home",
  "products",
  "services",
  "trainings",
  "our clients",
  "about us",
  "research",
  "Careers",
];

function Navbar() {
  return (
    <nav
      data-layername="navbar"
      className="flex flex-wrap items-start w-full border-b border-zinc-700 max-md:max-w-full"
    >
      <div className="flex flex-wrap items-start border-b border-zinc-700 w-[1920px] max-md:max-w-full">
        <div className="flex flex-wrap flex-1 shrink items-start text-xl tracking-widest leading-none text-white uppercase whitespace-nowrap basis-[140px] min-w-[240px] max-md:max-w-full">
          {navItems.slice(0, 4).map((item, index) => (
            <div
              key={index}
              data-layername="tab"
              className="overflow-hidden flex-1 shrink gap-2.5 self-stretch py-10 px-12 border-r border-b bg-zinc-900 border-zinc-700 min-h-[100px] max-md:px-5"
            >
              {item}
            </div>
          ))}
        </div>
        <div
          data-layername="logoFrame"
          className="flex overflow-hidden flex-col px-16 border border-solid bg-zinc-900 border-neutral-700 min-h-[100px] min-w-[240px] w-[245px] max-md:px-5"
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/1c1eb17052800bf7be78ee46d52fbd3fd696e928834eda3f8990dd805c0e7ab4?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
            alt="Company logo"
            className="object-contain aspect-[1.04] w-[99px]"
          />
        </div>
        <div className="flex flex-wrap flex-1 shrink items-start text-xl tracking-widest leading-none text-white uppercase basis-[140px] min-w-[240px] max-md:max-w-full">
          {navItems.slice(4).map((item, index) => (
            <div
              key={index}
              data-layername="tab"
              className="overflow-hidden flex-1 shrink gap-2.5 self-stretch py-10 px-14 border-r border-b bg-zinc-900 border-zinc-700 min-h-[100px] max-md:px-5"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 shrink items-start text-xl tracking-widest leading-none text-white uppercase whitespace-nowrap basis-0">
        <div
          data-layername="tab"
          className="overflow-hidden flex-1 shrink gap-2.5 self-stretch py-10 w-full border-r border-b bg-zinc-900 border-zinc-700 min-h-[100px]"
        >
          Home
        </div>
      </div>
    </nav>
  );
}

export default Navbar;