/**
 * This code was generated by Builder.io
 */
import React from "react";
import ServiceCard from "./ServiceCard";
import background from "../../images/homepage_bg2.png";

const serviceData = [
  {
    title: "Inhouse Products",
    description:
      "Our Inhouse web3 products like Portfolio Management Toolkit containing tokens of low-moderate risk, offer a well calculated return of atleast 5X returns from the bottom to top of the bull cycle.",
  },
  {
    title: "Blockchain Analytics Services",
    description:
      "Services like Business Migration to Web3's decentralised architecture reduces the operating cost by 70%. With services like Data Analytics and Data Modelling in Web3, your businesses can stand out of the crowd with superior decision making.",
  },
  {
    title: "AI Services",
    description:
      "With out expertise in Artificial Intelligence and Machine learning, You can extract astonishing insights from the data. Save your operating costs by 25%-45% and explore new business opportunities by collaborating with us. GenAI integration into your existing products will increase the employrr productivity and help in optimised workforce management.",
  },
  {
    title: "Corporate Trainings",
    description:
      "Employee Upskilling is now optimised with Zenitheum. Our corporate training services have tailored courses for a pleothrea of audiences. We offer customised trainings across various sectors, various departments, various skill levels and for various job roles to make best use of the fast evolving AI and web3 space.",
  },
];


const BusinessBenefits = () => {
  return (
    <main style ={{ backgroundImage: `url(${background})`, backgroundSize: "cover", backgroundPosition: "center 50%", backgroundRepeat: "no-repeat", opacity: 1}} 
    className="flex gap-10 py-24 items-center px-16 border-t border-b border-zinc-700 max-md:pl-5">
      <h2 className="grow shrink w-[20%] my-auto text-6xl font-medium text-white leading-[76px] max-md:text-4xl max-md:leading-[52px]">
        What's in it for your business?
      </h2>
      <div className="flex flex-wrap w-[70%]">
        <div className="flex w-full grow shrink justify-center items-start">
          {serviceData.slice(0, 2).map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
        <div className="flex grow shrink justify-center items-start">
          {serviceData.slice(2).map((service, index) => (
            <ServiceCard
              key={index + 2}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default BusinessBenefits;
