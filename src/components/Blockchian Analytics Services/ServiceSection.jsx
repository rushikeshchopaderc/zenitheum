/**
 * This code was generated by Builder.io
 */
import React from "react";

const ServiceSection = ({
  title,
  description,
  buttonText,
  imageSrc,
  imageAlt,
  reverse = false,
}) => {
  const contentClass = reverse ? "order-2" : "order-1";
  const imageClass = reverse ? "order-1" : "order-2";

  return (
    <div
      className={`flex flex-wrap gap-10 items-center pr-16 pl-32 mt-32 max-w-full text-white border-t border-b border-zinc-700 w-[1920px] max-md:px-5 max-md:mt-10`}
    >
      <div
        className={`flex flex-col grow shrink justify-center self-stretch my-auto min-w-[240px] w-[389px] max-md:max-w-full ${contentClass}`}
      >
        <h2 className="text-6xl font-medium leading-[76px] max-md:max-w-full max-md:text-4xl max-md:leading-[52px]">
          {title}
        </h2>
        <p className="mt-10 text-2xl max-md:max-w-full">{description}</p>
        <button className="self-start py-4 pr-8 pl-8 mt-10 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5">
          {buttonText}
        </button>
      </div>
      <img
        loading="lazy"
        src={imageSrc}
        alt={imageAlt}
        className={`object-contain grow shrink self-stretch my-auto aspect-[1.04] min-w-[240px] rounded-[100px] w-[1029px] max-md:max-w-full ${imageClass}`}
      />
    </div>
  );
};

export default ServiceSection;