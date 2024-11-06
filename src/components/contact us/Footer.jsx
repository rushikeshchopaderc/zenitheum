/**
 * This code was generated by Builder.io
 */
import React from "react";
import FooterLinks from "./FooterLinks";
import ContactCard from "./ContactCard";

function Footer() {
  return (
    <footer className="flex overflow-hidden items-start py-16 mt-32 min-h-[607px] max-md:mt-10">
      <div className="flex flex-col items-center min-h-[481px] w-[1920px] max-md:max-w-full">
        <div className="flex flex-wrap py-px w-full border-t border-b border-zinc-700 max-md:max-w-full">
          <div className="flex flex-col px-28 py-5 text-white border-r border-zinc-700 min-w-[240px] w-[649px] max-md:px-5 max-md:max-w-full">
            <div className="flex overflow-hidden gap-2.5 justify-center items-center self-start text-5xl whitespace-nowrap max-md:text-4xl">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/71deb2044f42ad1e40ace9ec8db65ee473e751f901ee4725876460c59b45fc7f?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
                alt="Zenitheum logo"
                className="object-contain shrink-0 self-stretch my-auto aspect-[0.98] w-[86px]"
              />
              <h2 className="self-stretch my-auto max-md:text-4xl">
                Zenitheum
              </h2>
            </div>
            <p className="mt-5 text-3xl font-medium tracking-widest">
              Zeniteum is a leading Blockchain Analytics and AI solutions firm,
              where we strive to empower businesses with tailored solutions that
              drive growth and efficiency.
            </p>
          </div>
          <FooterLinks />
          <div className="flex flex-wrap items-start w-full max-md:max-w-full">
            <ContactCard
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/755e65f35658c35f0bf56c0a583af86cb82869d550b926f2fe2656002afe4c59?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
              title="Our Head Office"
              content={
                <>
                  Prathamesh Park, <br /> Baner, Pune, 411045
                </>
              }
            />
            <ContactCard
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/a5cb232bbff8e9b412c32ae812f191f0619772453021d6fde198ac2fc059945c?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
              title="Our Hotline"
              content="+91 7066497023"
            />
            <ContactCard
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/a68bf82b82f5039ffdd7fb308b7f3437d33c1c0c1637fe1f16ab766bfb3502f1?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
              title="Mail Us"
              content={
                <>
                  support@zenitheum.com <br /> careers@zenitheum.com <br />{" "}
                  admin@zenitheum.com <br /> rushikesh@zenitheum.com
                </>
              }
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
