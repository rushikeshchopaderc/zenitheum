/**
 * This code was generated by Builder.io
 */
import React from "react";

const TestimonialCard = ({
  logoSrc,
  content,
  name,
  title,
  imageSrc,
  imageAlt,
  shadowColor,
}) => {
  return (
    <article
      className={`flex relative flex-col grow shrink justify-center self-stretch py-14 pr-5 pl-11 my-auto bg-white min-h-[437px] min-w-[240px] rounded-[41px_12px_12px_12px] shadow-[15px_22px_0px_${shadowColor}] max-md:pl-5 max-md:max-w-full`}
    >
      <header className="flex z-0 flex-col items-start w-full">
        <img
          loading="lazy"
          src={logoSrc}
          alt="Company logo"
          className="object-contain aspect-[5.08] shadow-[0px_26px_55px_rgba(21,21,21,0.15)] w-[76px]"
        />
      </header>
      <p className="z-0 mt-3.5 text-base leading-6 text-black">{content}</p>
      <footer className="flex z-0 flex-col justify-center self-start mt-3.5">
        <h3 className="text-xs font-extrabold text-black">{name}</h3>
        <p className="mt-1.5 text-xs text-neutral-600">{title}</p>
      </footer>
      <img
        loading="lazy"
        src={imageSrc}
        alt={imageAlt}
        className="object-contain absolute bottom-3.5 z-0 max-w-full rounded-full aspect-square h-[114px] right-[11px] w-[114px]"
      />
    </article>
  );
};

export default TestimonialCard;