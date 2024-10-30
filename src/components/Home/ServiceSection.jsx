/**
 * This code was generated by Builder.io
 */
import React from "react";
import ServiceCard from "./ServiceCard";

const services = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7ea88abe015b9878080fd11950796758ef5e7500db32c3a6e959943b1a627a84?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "Inhouse Products",
    description:
      "State-of-the-art Products in Web3 domain like Algorithmic trading bots for price prediction and Crypto Portfolio Management Toolkit",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/345610a6eaafcad1af341f8af213574610bca02e4b9bce870cb8e41837179778?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "Blockchain Analytics Services",
    description:
      "We offer services in everything related to Data in web3. Our expertise includes but not limited to Designing and Auditing Smart Contracts, Blockchain Data Acquisition and AI Modelling, Blockchain Data Indexing solutions, Business Migration from Web2 to Web3",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b6b7643fadf06ca409c4b100b4217749df266ba930aa58f2dd5e96515e5e7309?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "AI Services",
    description:
      "We craft magic using AI... From insightful data analytics to development of complex AI-ML algorithms, and integrating GenAI to your business... we are the experts in this field.",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/93433ce0d201a03e51571ce2c97a5591535905046294ba67b7c964ad9d061dcd?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
    title: "Corporate Trainings",
    description:
      "WE offer Corporate Trainings for all roles throughout any organization to stay up-to-date with the ever evolving space of Web3 and AI",
  },
];

const ServiceSection = () => {
  return (
    <section className="flex flex-wrap gap-10 items-center pl-32 mt-3.5 w-full border-t border-b border-zinc-700 min-h-[1048px] max-md:pl-5 max-md:mr-2 max-md:max-w-full">
      <h2 className="grow shrink self-stretch my-auto text-6xl font-medium text-white leading-[76px] min-w-[240px] w-[389px] max-md:max-w-full max-md:text-4xl max-md:leading-[52px]">
        We help businesses grow by offering...
      </h2>
      <div className="flex flex-wrap grow shrink items-center self-stretch my-auto min-w-[240px] w-[1106px] max-md:max-w-full">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </section>
  );
};

export default ServiceSection;
