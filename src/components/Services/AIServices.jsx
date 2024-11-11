import React from "react";
import { useNavigate } from "react-router-dom";
import AiImage from "../../images/ML_main.png";

const AIServicesSection = () => {
  const navigate = useNavigate();

  const handleViewServices = () => {
    navigate("/services/aiservices");
  };

  return (
    <section className="flex flex-wrap gap-20 items-center px-20 py-28 w-full text-white border-t border-b border-zinc-700 max-md:px-5">
      <img
        loading="lazy"
        src={AiImage}
        alt="AI Services illustration"
        className="object-cover grow shrink self-stretch my-auto aspect-[1.47] w-[55%] rounded-[100px] max-md:max-w-full"
      />
      <div className="flex flex-col grow shrink justify-center self-stretch w-[25%] max-md:max-w-full">
        <h2 className="text-6xl font-medium leading-none max-md:max-w-full max-md:text-4xl">
          AI Services
        </h2>
        <p className="mt-10 text-2xl max-md:max-w-full">
          We delve into the intricacies of devising advanced Machine Learning
          and Deep Learning algorithms tailored for various business
          applications. Our offerings are designed to enhance operational
          efficiency and provide actionable insights, propelling companies
          towards their strategic objectives.
        </p>
        <button
          className="self-start py-4 pr-8 pl-8 mt-10 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          onClick={handleViewServices}
          aria-label="View Services"
        >
          View Services
        </button>
      </div>
    </section>
  );
};

export default AIServicesSection;