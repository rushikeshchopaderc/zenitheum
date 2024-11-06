/**
 * This code was generated by Builder.io
 */
import React from "react";

const FooterLink = ({ children }) => (
  <div className="gap-2.5 self-stretch whitespace-nowrap">{children}</div>
);

const SocialLink = ({ iconSrc, alt }) => (
  <div className="flex items-start w-6 max-w-[24px]">
    <div className="flex justify-center items-start w-6 max-w-[24px]">
      <div className="flex overflow-hidden items-start px-0.5 pt-0.5 pb-1 w-6">
        <img
          loading="lazy"
          src={iconSrc}
          alt={alt}
          className="object-contain w-5 aspect-square"
        />
      </div>
    </div>
  </div>
);

const Footer = () => {
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
  const socialLinks = [
    {
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/6f8347fa28e6c597a51142c106a5c91a112ca54bca0519a6156481fba08c0385?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
      alt: "Facebook icon",
    },
    {
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/28896cb0a659fd9af4e97666e55694f1937591a3ad64260d31c80782de576530?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
      alt: "Twitter icon",
    },
    {
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/c3223b85f47c7bf2e68fecf03b55564b9a609e051329cf465ab3258847705a83?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
      alt: "LinkedIn icon",
    },
    {
      iconSrc:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/700b286c489b51a633d94573ec13fffd24e41adfaf155aa6d8a91d032cb00143?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
      alt: "Instagram icon",
    },
  ];

  return (
    <footer className="flex flex-col mt-32 w-full max-w-[1920px] max-md:mt-10 max-md:max-w-full">
      <div className="flex overflow-hidden justify-center items-center pt-5 pb-12 w-full text-white min-h-[634px]">
        <div className="flex overflow-hidden flex-col justify-center items-center self-stretch my-auto min-h-[567px] min-w-[240px] w-[1920px] max-md:max-w-full">
          <h2 className="self-stretch text-9xl font-medium text-center leading-[144px] max-md:max-w-full max-md:text-4xl max-md:leading-[50px]">
            Get Blockchain Analytics service for your business...
          </h2>
          <p className="mt-9 text-2xl text-center w-[986px] max-md:max-w-full">
            Take the first step towards a transformative future by partnering
            with us today. Explore our cutting-edge solutions in Blockchain,
            Data Engineering, and AI, and experience the power of innovation and
            seamless connectivity. Contact us now for a personalized
            consultation, and together, let's build a brighter tomorrow. Your
            success awaits!
          </p>
          <button className="py-4 pr-8 pl-8 mt-9 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5">
            Book a service
          </button>
        </div>
      </div>
      <div className="flex overflow-hidden items-start pt-16 pb-7 w-full">
        <div className="flex flex-col items-center h-[427px] min-w-[240px] w-[1920px] max-md:max-w-full">
          <div className="flex flex-wrap py-px w-full border-t border-b border-zinc-700">
            <div className="flex flex-col px-28 py-5 text-white border-r border-zinc-700 min-w-[240px] w-[649px] max-md:px-5 max-md:max-w-full">
              <div className="flex overflow-hidden gap-2.5 justify-center items-center self-start text-5xl whitespace-nowrap max-md:text-4xl">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/71deb2044f42ad1e40ace9ec8db65ee473e751f901ee4725876460c59b45fc7f?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
                  alt="Zenitheum logo"
                  className="object-contain shrink-0 self-stretch my-auto aspect-[0.98] w-[86px]"
                />
                <div className="self-stretch my-auto max-md:text-4xl">
                  Zenitheum
                </div>
              </div>
              <p className="mt-5 text-3xl font-medium tracking-widest">
                Zeniteum is a leading Blockchain Analytics and AI solutions
                firm, where we strive to empower businesses with tailored
                solutions that drive growth and efficiency.
              </p>
            </div>
            <div className="flex flex-col flex-1 shrink self-start basis-[234px] min-w-[240px] max-md:max-w-full">
              <div className="flex flex-col justify-center px-12 py-6 w-full text-2xl leading-none text-white border-b border-zinc-700 max-md:px-5 max-md:max-w-full">
                <div className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
                  {footerLinks.map((link, index) => (
                    <FooterLink key={index}>{link}</FooterLink>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-start w-full max-md:max-w-full">
                {/* Contact information sections */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex z-10 flex-wrap gap-6 items-start self-end mt-0 mr-28 max-md:mr-2.5">
        {socialLinks.map((link, index) => (
          <SocialLink key={index} iconSrc={link.iconSrc} alt={link.alt} />
        ))}
      </div>
      <div className="flex items-end -mt-6 ml-28 w-full text-base text-white max-md:max-w-full">
        <div className="min-w-[240px]">
          Copyright © 2024. All rights reserved by Zenitheum
        </div>
      </div>
    </footer>
  );
};

export default Footer;
