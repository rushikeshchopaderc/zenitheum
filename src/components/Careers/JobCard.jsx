/**
 * This code was generated by Rushikesh
 */
import React from "react";
import { useNavigate } from "react-router-dom";


function JobCard({ title, type, location, buttonlinkpage }) {
  const navigate = useNavigate();

  const handleViewServices = () => {
    navigate(buttonlinkpage); 
  };

  return (
    <div className="flex flex-wrap grow shrink gap-2.5 justify-center items-center self-stretch py px-10 my-auto border-b border-zinc-700 min-w-[240px] w-[962px] max-md:max-w-full">
      <div
        data-layername="divServiceCard"
        className="flex overflow-hidden flex-1 shrink items-start self-stretch px-10 py-5 my-auto basis-0 min-w-[240px] max-md:px-5 max-md:max-w-full"
      >
        <div
          data-layername="divSCardBlock"
          className="flex flex-col min-w-[240px] max-md:max-w-full"
        >
          <div
            data-layername="divSCardText"
            className="flex flex-col max-md:max-w-full"
          >
            <h3
              data-layername="jobTitle"
              className="text-5xl leading-none text-zinc-300 max-md:max-w-full max-md:text-4xl"
            >
              {title}
            </h3>
            <div className="flex gap-3.5 items-start self-start mt-5 text-sm leading-6 text-white whitespace-nowrap">
              <div
                data-layername="chip"
                className="px-5 py-2.5 border-2 border-solid border-zinc-700 rounded-[65px]"
              >
                {type}
              </div>
              <div
                data-layername="chip"
                className="px-5 py-2.5 border-2 border-solid border-zinc-700 rounded-[65px]"
              >
                {location}
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
          data-layername="button"
          className="self-start py-4 pr-8 pl-8 mt-10 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          onClick={handleViewServices}
          aria-label="Job Description"
        >
          Job Description
        </button>
    </div>
  );
}

export default JobCard;
