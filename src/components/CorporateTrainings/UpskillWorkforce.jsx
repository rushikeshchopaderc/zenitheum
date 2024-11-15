/**
 * This code was generated by Builder.io
 */
import React from "react";
import UpskillImage from "../../images/training1.jpg"

function UpskillWorkforce() {
  return (
    <section
      data-layername="TextImageContainer"
      className="flex gap-10 items-center px-10 py-20 w-full text-white border-t border-b border-zinc-700 max-md:px-5 max-md:mt-10"
    >
      <div
        data-layername="UpskillContainer"
        className="flex flex-col grow shrink justify-center w-[60%]"
      >
        <h2
          data-layername="UpskillHeader"
          className="self-start text-6xl font-medium text-center leading-[76px] max-md:text-4xl max-md:leading-[52px]"
        >
          Upskill workforce with Sessions about...
        </h2>
        <div
          data-layername="Description"
          className="mt-7 text-2xl"
        >
          <ul>
            <li>
              1. Latest GenAI developments like Claude, Gemini, ChatGPT and their
              integration into your daily life for enhanced productivity.
            </li>
          </ul>
          <ul>
            <li>
              2. Use of Machine Learning and Deep Learning techniques to automate
              Standard operating procedures.
            </li>
          </ul>
          
          <ul>
            <li>
              3. Latest Web3 developments with familarity to its concepts, its
              application in various domains and its scope into your work.
            </li>
          </ul>
          <br />
        </div>
      </div>
      <img
        loading="lazy"
        src={UpskillImage}
        alt="Upskill your workforce illustration"
        className="object-cover grow shrink w-[40%] aspect-[1.04] rounded-[100px]"
      />
    </section>
  );
}

export default UpskillWorkforce;
