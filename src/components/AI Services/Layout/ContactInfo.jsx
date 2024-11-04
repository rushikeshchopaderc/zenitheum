/**
 * This code was generated by Builder.io
 */
import React from 'react';

const contactInfo = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/755e65f35658c35f0bf56c0a583af86cb82869d550b926f2fe2656002afe4c59?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "Our Head Office",
    content: "Prathamesh Park, \nBaner, Pune, 411045"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/6ccfc97970f635ed1591531be685df39219c89c6f7594237aadc0a8e0f9353bf?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "Our Hotline",
    content: "+91 7066497023"
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/f049b2cee5d0e723a53fe43a58dad1fa9b6a936900cf451fa0380de03c8b16a7?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "Mail Us",
    content: "support@zenitheum.com \ncareers@zenitheum.com \nadmin@zenitheum.com \nrushikesh@zenitheum.com"
  }
];

function ContactInfo() {
  return (
    <div className="flex flex-wrap items-start w-full max-md:max-w-full">
      {contactInfo.map((info, index) => (
        Continuing from where we left off:

        <div key={index} data-layername="divSCardBlock" className="flex flex-col flex-1 shrink self-stretch p-5 border-r basis-0 border-zinc-700 min-w-[240px] max-md:max-w-full">
          <div data-layername="divSCardIcon" className="flex overflow-hidden justify-center items-center px-5 w-16 h-16 bg-neutral-800 rounded-[32px]">
            <img loading="lazy" src={info.icon} alt="" className="object-contain self-stretch my-auto w-7 aspect-square" />
          </div>
          <div data-layername="divSCardText" className="flex flex-col mt-4 w-full">
            <div data-layername={info.title.toLowerCase().replace(/\s+/g, '')} className="text-3xl font-medium leading-none text-zinc-300">
              {info.title}
            </div>
            <div data-layername="pSCardParagraph" className="flex-1 shrink pr-5 mt-3.5 w-full text-lg leading-7 text-white whitespace-pre-line">
              {info.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactInfo;