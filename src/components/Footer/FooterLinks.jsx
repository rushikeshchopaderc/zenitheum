/**
 * This code was generated by Builder.io
 */
import React from "react";

const footerLinks = [
  "Home",
  "Products",
  "Services",
  "Trainings",
  "Clients",
  "About Us",
  "Research",
  "Careers",
];

const FooterLinks = () => {
  return (
    <div className="flex flex-col self-center py-px w-full border-t border-b border-zinc-700 max-md:max-w-full">
      <div className="flex flex-col px-28 py-5 text-white border-r border-zinc-700 min-w-[240px] w-[649px] max-md:px-5 max-md:max-w-full">
        <div className="flex overflow-hidden gap-2.5 justify-center items-center self-start text-5xl whitespace-nowrap max-md:text-4xl">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/71deb2044f42ad1e40ace9ec8db65ee473e751f901ee4725876460c59b45fc7f?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
            alt="Zenitheum logo"
            className="object-contain shrink-0 self-stretch my-auto aspect-[0.98] w-[86px]"
          />
          <h2 className="self-stretch my-auto max-md:text-4xl">Zenitheum</h2>
        </div>
        <p className="mt-5 text-3xl font-medium tracking-widest">
          Zeniteum is a leading Blockchain Analytics and AI solutions firm,
          where we strive to empower businesses with tailored solutions that
          drive growth and efficiency.
        </p>
      </div>
      <nav className="flex flex-col flex-1 shrink self-start basis-[234px] min-w-[240px] max-md:max-w-full">
        <div className="flex flex-col justify-center px-12 py-6 w-full text-2xl leading-none text-white border-b border-zinc-700 max-md:px-5 max-md:max-w-full">
          <ul className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
            {footerLinks.map((link, index) => (
              <li
                key={index}
                className="gap-2.5 self-stretch whitespace-nowrap"
              >
                <a href={`#${link.toLowerCase()}`}>{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default FooterLinks;