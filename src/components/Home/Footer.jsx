/**
 * This code was generated by Rushikesh
 */
import React from "react";
import logoImage from "../../images/locationicon.png";
import LocationIcon from "../../images/locationicon.png";
import ContactIcon from "../../images/contacticon.png";
import MailIcon from "../../images/mailicon.png";


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
    src: "https://cdn.builder.io/api/v1/image/assets/TEMP/6f8347fa28e6c597a51142c106a5c91a112ca54bca0519a6156481fba08c0385?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    alt: "Facebook",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets/TEMP/9645fbe951416489c3946599f9a4880e5e04f844b6317c3a9d89b9becf558a41?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    alt: "Twitter",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets/TEMP/c3223b85f47c7bf2e68fecf03b55564b9a609e051329cf465ab3258847705a83?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    alt: "Instagram",
  },
  {
    src: "https://cdn.builder.io/api/v1/image/assets/TEMP/0b92c1b5d24a4ac2cb2eaf6260a93a8a0fca4d8f0fdc0dbafd494f700b5efbf5?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    alt: "LinkedIn",
  },
];

function Footer() {
  return (
    <footer
      data-layername="footer"
      className="flex flex-col mt-32 w-full max-md:mt-10 max-md:max-w-full"
    >
      <div
        data-layername="divFooterContainer"
        className="flex flex-col h-[427px] w-[1920px] max-md:max-w-full"
      >
        <div
          data-layername="divFooterLinkBlock"
          className="flex flex-wrap self-center py-px w-full border-t border-b border-zinc-700 max-md:max-w-full"
        >
          <div className="flex flex-col px-28 py-5 text-white border-r border-zinc-700 min-w-[240px] w-[649px] max-md:px-5 max-md:max-w-full">
            <div
              data-layername="isolationMode"
              className="flex overflow-hidden gap-x-10 justify-center items-center self-start text-5xl whitespace-nowrap max-md:text-4xl"
            >
              <img
                loading="lazy"
                src={logoImage}
                alt="Zenitheum logo"
                className="object-contain shrink-0 self-stretch my-auto aspect-[0.98] w-[86px]"
              />
              <div
                data-layername="zenitheum"
                className="self-stretch my-auto max-xl:text-6xl font-bold italic "
              >
                Zenitheum...
              </div>
            </div>
            <p
              data-layername="zeniteumIsALeadingBlockchainAnalyticsAndAiSolutionsFirmWhereWeStriveToEmpowerBusinessesWithTailoredSolutionsThatDriveGrowthAndEfficiency"
              className="mt-5 text-3xl font-medium tracking-widest"
            >
              A Leading Blockchain Analytics and AI solutions company,
              where we strive to empower businesses with tailored solutions that
              drive growth and efficiency.
            </p>
          </div>
          <div
            data-layername="divWNodeEa35C4Ee7A8203Fd1856Fadec6D71926C6D71913"
            className="flex flex-col flex-1 shrink self-start basis-[234px] min-w-[240px] max-md:max-w-full"
          >
            <nav
              data-layername="divFooterLinkWrapper"
              className="flex flex-col justify-center px-12 py-6 w-full text-2xl leading-none text-white border-b border-zinc-700 max-md:px-5 max-md:max-w-full"
            >
            <ul className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
              {footerLinks.map((link, index) => (
                <li
                  key={index}
                  data-layername="footerList"
                  className="gap-2.5 self-stretch whitespace-nowrap"
                >
                  {/* Change the part in between for every footer */}
                  <a
                    href={link.toLowerCase().replace(" ", "-") === "home" ? "" : `/${link.toLowerCase().replace(" ", "-")}`}
                    onClick={(e) => {
                      if (link.toLowerCase().replace(" ", "-") === "home") {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    {link}
                  </a>
                  {/* Change the part in between for every footer */}
                </li>
              ))}
            </ul>
            </nav>
            <div className="flex flex-wrap items-start w-full max-md:max-w-full">
              <address
                data-layername="divSCardBlock"
                className="flex flex-col flex-1 shrink self-stretch p-5 border-r basis-0 border-zinc-700 min-w-[240px] max-md:max-w-full"
              >
                <div
                  data-layername="divSCardIcon"
                  className="flex overflow-hidden justify-center items-center px-0 w-36 h-36 bg-neutral-800 rounded-[32px]"
                >
                  <img
                    loading="lazy"
                    src={LocationIcon}
                    alt="Location icon"
                    className="object-contain self-stretch my-auto scale-125 aspect-square"
                  />
                </div>
                <div
                  data-layername="divSCardText"
                  className="flex flex-col mt-4 w-full"
                >
                  <h3
                    data-layername="ourHeadOffice"
                    className="text-3xl font-medium leading-none text-zinc-300 not-italic"
                  >
                    Our Head Office...
                  </h3>
                  <p
                    data-layername="pSCardParagraph"
                    className="flex-1 shrink pr-5 mt-3.5 w-full text-lg leading-7 text-white italic"
                  >
                    Prathamesh Park,
                    <br />
                    Baner, Pune, 411045
                  </p>
                </div>
              </address>
              <div
                data-layername="divSCardBlock"
                className="flex flex-col flex-1 shrink px-5 pt-5 pb-32 border-r basis-0 border-zinc-700 min-h-[304px] min-w-[240px] max-md:pb-24 max-md:max-w-full"
              >
                <div
                  data-layername="divSCardIcon"
                  className="flex overflow-hidden justify-center items-center px-0 w-36 h-36 bg-neutral-800 rounded-[32px]"
                >
                  <img
                    loading="lazy"
                    src={ContactIcon}
                    alt="Phone icon"
                    className="object-contain self-stretch my-auto scale-125 aspect-square"
                  />
                </div>
                <div
                  data-layername="divSCardText"
                  className="flex flex-col mt-4 w-full"
                >
                  <h3
                    data-layername="ourHotline"
                    className="text-3xl font-medium leading-none text-zinc-300"
                  >
                    Our Hotline...
                  </h3>
                  <p
                    data-layername="pSCardParagraph"
                    className="flex-1 shrink pr-5 mt-3.5 w-full text-lg leading-loose text-white italic"
                  >
                    <a href="tel:+917066497023">+91 7066497023</a>
                  </p>
                </div>
              </div>
              <div
                data-layername="divSCardBlock"
                className="flex flex-col flex-1 shrink px-5 pt-5 pb-10 border-r basis-0 border-zinc-700 min-h-[304px] min-w-[240px] max-md:max-w-full"
              >
                <div
                  data-layername="divSCardIcon"
                  className="flex overflow-hidden justify-center items-center px-0 w-36 h-36 bg-neutral-800 rounded-[32px]"
                >
                  <img
                    loading="lazy"
                    src={MailIcon}
                    alt="Email icon"
                    className="object-contain self-stretch my-auto scale-125 aspect-square"
                  />
                </div>
                <div
                  data-layername="divSCardText"
                  className="flex flex-col mt-4 w-full"
                >
                  <h3
                    data-layername="mailUs"
                    className="text-3xl font-medium leading-none text-zinc-300"
                  >
                    Mail Us...
                  </h3>
                  <p
                    data-layername="pSCardParagraph"
                    className="flex-1 shrink pr-5 mt-3.5 w-full text-lg leading-7 text-white whitespace-nowrap italic"
                  >
                    <a href="mailto:support@zenitheum.com">
                      support@zenitheum.com
                    </a>
                    <br />
                    <a href="mailto:careers@zenitheum.com">
                      careers@zenitheum.com
                    </a>
                    <br />
                    <a href="mailto:admin@zenitheum.com">admin@zenitheum.com</a>
                    <br />
                    <a href="mailto:rushikesh@zenitheum.com">
                      rushikesh@zenitheum.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          data-layername="divFppterRightsBox"
          className="flex flex-wrap flex-1 gap-5 justify-center items-end px-28 mt-2.5 size-full max-md:px-5 max-md:max-w-full"
        >
          <div
            data-layername="divFooterRightsWrapper"
            className="flex flex-1 shrink items-end text-base text-white basis-0 min-w-[240px] max-md:max-w-full"
          >
            <p data-layername="div" className="min-w-[240px]">
              Copyright © 2024. All rights reserved by Zenitheum
            </p>
          </div>
          <div
            data-layername="divSocialLinkWrapper"
            className="flex flex-wrap gap-6 items-start"
          >
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href="#"
                data-layername="link"
                className="flex items-start w-6 max-w-[24px]"
                aria-label={`Visit our ${link.alt} page`}
              >
                <div className="flex justify-center items-start w-6 max-w-[24px]">
                  <div className="flex overflow-hidden items-start px-0.5 pt-0.5 pb-1 w-6">
                    <img
                      loading="lazy"
                      src={link.src}
                      alt={link.alt}
                      className="object-contain w-5 aspect-square"
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
