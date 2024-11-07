/**
 * This code was generated by Rushikesh
 */
import React from "react";

const ProcessStep = ({ title, description, order }) => {
  const isEven = order % 2 === 0;
  const containerClasses = `flex flex-col ${
    isEven ? "items-end" : "items-start"
  } w-full max-md:items-center`;
  const contentClasses = `flex flex-col px-6 py-7 rounded-lg border border-cyan-400 border-solid bg-white bg-opacity-10 w-[460px] max-md:w-full`;

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <h3 className="text-3xl font-semibold leading-none text-white">
          {title}
        </h3>
        <p className="mt-4 text-base font-medium leading-6 text-slate-300">
          {description}
        </p>
      </div>
      {order < 6 && (
        <div className="flex my-4">
          <div className="flex shrink-0 w-6 h-6 bg-cyan-400 rounded-full" />
          <img
            loading="lazy"
            src={`http://b.io/ext_${7 + order}-`}
            alt=""
            className="object-contain shrink-0 my-auto w-16 aspect-[10.64] stroke-[1px] stroke-cyan-400"
          />
        </div>
      )}
    </div>
  );
};

export default ProcessStep;
