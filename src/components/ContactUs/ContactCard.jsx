/**
 * This code was generated by Builder.io
 */
import React from "react";

function ContactCard({ icon, title, content }) {
  return (
    <div className="flex flex-col flex-1 shrink self-stretch p-5 border-r basis-0 border-zinc-700 min-w-[240px] max-md:max-w-full">
      <div className="flex overflow-hidden justify-center items-center px-5 w-16 h-16 bg-neutral-800 rounded-[32px]">
        <img
          loading="lazy"
          src={icon}
          alt={`${title} icon`}
          className="object-contain self-stretch my-auto w-7 aspect-square"
        />
      </div>
      <div className="flex flex-col mt-4 w-full">
        <h3 className="text-3xl font-medium leading-none text-zinc-300">
          {title}
        </h3>
        <p className="flex-1 shrink pr-5 mt-3.5 w-full text-lg leading-7 text-white">
          {content}
        </p>
      </div>
    </div>
  );
}

export default ContactCard;
