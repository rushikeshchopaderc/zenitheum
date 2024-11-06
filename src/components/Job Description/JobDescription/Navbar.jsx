/**
 * This code was generated by Builder.io
 */
import React from "react";

const navItems = [
  { label: "Home", className: "pr-20 pl-20" },
  { label: "Products", className: "pr-12 pl-12 basis-[46px]" },
  { label: "services", className: "pr-14 pl-14 basis-8" },
  { label: "trainings", className: "px-12 basis-[45px]" },
];

const rightNavItems = [
  { label: "our clients", className: "px-10 basis-11" },
  { label: "about us", className: "px-14 basis-3.5" },
  { label: "research", className: "px-14 basis-3.5" },
  { label: "careers", className: "px-16" },
];

function Navbar() {
  return (
    <nav
      data-layername="navbar"
      className="flex z-10 flex-wrap items-start w-full border-b border-zinc-700 max-md:max-w-full"
    >
      <div className="flex flex-wrap flex-1 shrink items-start text-xl tracking-widest leading-none text-white uppercase whitespace-nowrap basis-[140px] min-w-[240px] max-md:max-w-full">
        {navItems.map((item, index) => (
          <div
            key={index}
            data-layername="tab"
            className={`overflow-hidden flex-1 shrink gap-2.5 self-stretch py-10 border-r border-b bg-zinc-900 border-zinc-700 min-h-[100px] max-md:px-5 ${item.className}`}
          >
            {item.label}
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
          alt="Zenitheum logo"
          className="object-contain aspect-[1.04] w-[99px]"
        />
      </div>
      <div className="flex flex-wrap flex-1 shrink items-start text-xl tracking-widest leading-none text-white uppercase basis-[140px] min-w-[240px] max-md:max-w-full">
        {rightNavItems.map((item, index) => (
          <div
            key={index}
            data-layername="tab"
            className={`overflow-hidden flex-1 shrink gap-2.5 self-stretch py-10 border-r border-b bg-zinc-900 border-zinc-700 min-h-[100px] max-md:px-5 ${item.className}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
