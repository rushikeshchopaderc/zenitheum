/**
 * This code was generated by Rushikesh
 */
import React from "react";

function ResearchPaper({ title,PaperUrl }) {
  return (
    <div
      data-layername="PaperContainer"
      className="flex flex-row gap-10 justify-center items-center mt-24 w-[100%] max-md:mt-10"
    >
      <div
        data-layername="paperTitle"
        className="grow shrink text-lg font-medium leading-[76px]"
      >
        {title}
      </div>
      <a
        href={PaperUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-layername="button"
        className="self-start py-4 pr-8 pl-8 mt-4 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 max-md:mt-10 ml-5"
      >
        View Publication
      </a>
    </div>
  );
}

export default ResearchPaper;
