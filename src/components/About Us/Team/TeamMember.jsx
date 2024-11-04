/**
 * This code was generated by Builder.io
 */
import React from "react";

const TeamMember = ({ name, position, imageSrc }) => {
  return (
    <div className="flex relative grow shrink items-start border border-solid border-zinc-700 min-h-[456px] min-w-[240px] w-[962px] max-md:max-w-full">
      <img
        loading="lazy"
        src={imageSrc}
        alt={`${name} - ${position}`}
        className="object-contain z-0 rounded-xl aspect-[1.32] min-w-[240px] w-[601px] max-md:max-w-full"
      />
      <div
        data-layername="divSCardBlock"
        className="flex absolute bottom-10 z-0 flex-col left-[23px] max-w-[300px] min-w-[240px] w-[300px]"
      >
        <div data-layername="divSCardText" className="flex flex-col">
          <h3
            data-layername={name.toLowerCase().replace(" ", "")}
            className="gap-2.5 self-start px-2.5 py-1.5 text-3xl font-medium leading-none bg-zinc-900"
          >
            {name}
          </h3>
          <p
            data-layername="pSCardParagraph"
            className="px-2.5 mt-2.5 text-lg leading-loose bg-zinc-900"
          >
            {position}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamMember;
