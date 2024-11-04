/**
 * This code was generated by Builder.io
 */
import React from 'react';

const footerLinks = ['Home', 'Products', 'Services', 'Trainings', 'Clients', 'About Us', 'Research', 'Careers'];

const socialIcons = [
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/6f8347fa28e6c597a51142c106a5c91a112ca54bca0519a6156481fba08c0385?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22", alt: "Facebook" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/28896cb0a659fd9af4e97666e55694f1937591a3ad64260d31c80782de576530?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22", alt: "Twitter" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/c3223b85f47c7bf2e68fecf03b55564b9a609e051329cf465ab3258847705a83?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22", alt: "Instagram" },
  { src: "https://cdn.builder.io/api/v1/image/assets/TEMP/700b286c489b51a633d94573ec13fffd24e41adfaf155aa6d8a91d032cb00143?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22", alt: "LinkedIn" }
];

function Footer() {
  return (
    <footer data-layername="footer" className="flex flex-col mt-32 w-full max-w-[1920px] max-md:mt-10 max-md:max-w-full">
      <div data-layername="letsWorkTogether" className="flex overflow-hidden justify-center items-center w-full text-white min-h-[553px]">
        <div data-layername="divCtaH1stLine" className="flex overflow-hidden flex-col justify-center items-center self-stretch my-auto min-h-[553px] w-[1920px] max-md:max-w-full">
          <h2 data-layername="bookAServiceToday" className="self-stretch text-9xl font-medium leading-none text-center max-md:max-w-full max-md:text-4xl">
            Book a service today...
          </h2>
          <p data-layername="takeTheFirstStepTowardsATransformativeFutureByPartneringWithUsTodayExploreOurCuttingEdgeSolutionsInBlockchainDataEngineeringAndAiAndExperienceThePowerOfInnovationAndSeamlessConnectivityContactUsNowForAPersonalizedConsultationAndTogetherLetsBuildABrighterTomorrowYourSuccessAwaits" className="mt-16 text-2xl text-center w-[986px] max-md:mt-10 max-md:max-w-full">
            Take the first step towards a transformative future by partnering with us today. Explore our cutting-edge solutions in Blockchain, Data Engineering, and AI, and experience the power of innovation and seamless connectivity. Contact us now for a personalized consultation, and together, let's build a brighter tomorrow. Your success awaits!
          </p>
          <button data-layername="button" className="py-4 pr-8 pl-8 mt-16 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 max-md:mt-10">
            Book a service
          </button>
        </div>
      </div>
      <div data-layername="footer" className="flex overflow-hidden items-start pt-16 pb-7 w-full">
        <div data-layername="divFooterContainer" className="flex flex-col items-center h-[427px] w-[1920px] max-md:max-w-full">
          <div data-layername="divFooterLinkBlock" className="flex flex-wrap py-px w-full border-t border-b border-zinc-700 max-md:max-w-full">
            <div className="flex flex-col px-28 py-5 text-white border-r border-zinc-700 min-w-[240px] w-[649px] max-md:px-5 max-md:max-w-full">
              <div data-layername="isolationMode" className="flex overflow-hidden gap-2.5 justify-center items-center self-start text-5xl whitespace-nowrap max-md:text-4xl">
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/71deb2044f42ad1e40ace9ec8db65ee473e751f901ee4725876460c59b45fc7f?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22" alt="Zenitheum Logo" className="object-contain shrink-0 self-stretch my-auto aspect-[0.98] w-[86px]" />
                <div data-layername="zenitheum" className="self-stretch my-auto max-md:text-4xl">
                  Zenitheum
                </div>
              </div>
              <p data-layername="zeniteumIsALeadingBlockchainAnalyticsAndAiSolutionsFirmWhereWeStriveToEmpowerBusinessesWithTailoredSolutionsThatDriveGrowthAndEfficiency" className="mt-5 text-3xl font-medium tracking-widest">
                Zeniteum is a leading Blockchain Analytics and AI solutions firm, where we strive to empower businesses with tailored solutions that drive growth and efficiency.
              </p>
            </div>
            <div data-layername="divWNodeEa35C4Ee7A8203Fd1856Fadec6D71926C6D71913" className="flex flex-col flex-1 shrink self-start basis-[234px] min-w-[240px] max-md:max-w-full">
              <div data-layername="divFooterLinkWrapper" className="flex flex-col justify-center px-12 py-6 w-full text-2xl leading-none text-white border-b border-zinc-700 max-md:px-5 max-md:max-w-full">
                <div className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
                  {footerLinks.map((link, index) => (
                    <div key={index} data-layername="footerList" className="gap-2.5 self-stretch whitespace-nowrap">
                      {link}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-start w-full max-md:max-w-full">
                <ContactInfo
                  icon="https://cdn.builder.io/api/v1/image/assets/TEMP/755e65f35658c35f0bf56c0a583af86cb82869d550b926f2fe2656002afe4c59?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
                  title="Our Head Office"
                  content={<>Prathamesh Park, <br /> Baner, Pune, 411045</>}
                />
                <ContactInfo
                  icon="https://cdn.builder.io/api/v1/image/assets/TEMP/34c358124b8700bb73ce38e5bcab9f6dc254392d515b9597e1cdcb107207cf63?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
                  title="Our Hotline"
                  content="+91 7066497023"
                />
                <ContactInfo
                  icon="https://cdn.builder.io/api/v1/image/assets/TEMP/ab6aa0161bbe3dba0ed7f5909b4a77551ff26582f908980b62cf40b423bed39e?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
                  title="Mail Us"
                  content={<>support@zenitheum.com <br /> careers@zenitheum.com <br /> admin@zenitheum.com <br /> rushikesh@zenitheum.com</>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div data-layername="divSocialLinkWrapper" className="flex z-10 flex-wrap gap-6 items-start self-end mt-0 mr-28 max-md:mt-0 max-md:mr-2.5">
        {socialIcons.map((icon, index) => (
          <div key={index} data-layername="link" className="flex items-start w-6 max-w-[24px]">
            <div className="flex justify-center items-start w-6 max-w-[24px]">
              <div className="flex overflow-hidden items-start pt-0.5 pb-1 px-0.5 w-6">
              <img loading="lazy" src={icon.src} alt={icon.alt} className="object-contain w-5 aspect-square" />
            </div>
          </div>
        ))}
      </div>
      <div data-layername="divFooterRightsWrapper" className="flex items-end -mt-6 ml-28 w-full text-base text-white max-md:max-w-full">
        <div data-layername="div" className="min-w-[240px]">
          Copyright © 2024. All rights reserved by Zenitheum
        </div>
      </div>
    </footer>
  );
}

function ContactInfo({ icon, title, content }) {
  return (
    <div data-layername="divSCardBlock" className="flex flex-col flex-1 shrink px-5 pt-5 pb-10 border-r basis-0 border-zinc-700 min-h-[304px] min-w-[240px] max-md:max-w-full">
      <div data-layername="divSCardIcon" className="flex overflow-hidden justify-center items-center px-5 w-16 h-16 bg-neutral-800 rounded-[32px]">
        <img loading="lazy" src={icon} alt={`${title} icon`} className="object-contain self-stretch my-auto w-7 aspect-square" />
      </div>
      <div data-layername="divSCardText" className="flex flex-col mt-4 w-full">
        <div data-layername={title.toLowerCase().replace(/\s+/g, '-')} className="text-3xl font-medium leading-none text-zinc-300">
          {title}
        </div>
        <div data-layername="pSCardParagraph" className="flex-1 shrink pr-5 mt-3.5 w-full text-lg leading-7 text-white">
          {content}
        </div>
      </div>
    </div>
  );
}

export default Footer;