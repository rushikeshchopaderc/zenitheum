/**
 * This code was generated by Builder.io
 */
import React from "react";

const Projects = () => {
  return (
    <section className="flex flex-wrap gap-10 items-center pr-12 mt-32 w-full text-white border-t border-b border-zinc-700 min-h-[990px] max-md:pr-5 max-md:mt-10 max-md:max-w-full">
      <div className="flex flex-wrap grow shrink items-start self-stretch pl-14 my-auto min-h-[990px] min-w-[240px] w-[550px] max-md:max-w-full">
        <div className="flex grow shrink gap-10 items-center pr-16 pb-0.5 pl-16 border-t border-b border-zinc-700 min-h-[990px] min-w-[240px] w-[1476px] max-md:px-5">
          <div className="flex flex-col justify-center self-stretch my-auto min-h-[988px] min-w-[240px] w-[588px]">
            <h2 className="text-6xl font-medium leading-[76px] max-md:max-w-full max-md:text-4xl max-md:leading-[52px]">
              Our Noteworthy Deliveries..
            </h2>
            <ul className="mt-16 text-2xl max-md:mt-10 max-md:max-w-full">
              <li>
                Hands-on Training Session about Google Gemini's optimal usage
                techniques and limitations of GenAI models.
                <br />
                -In collaboration with: TechHalo, Singapore.
              </li>
              <li>
                Development of Computer Vision algorithms for Image
                classification and localization of 18 diseases from Chest-Xray
                Images
                <br />- In collaboration with: ChestAI, USA.
              </li>
              <li>
                Developing Image GenAI algorithms for COVID-19 classification
                <br />- In collaboration with: UNIRC, Italy.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/8c0408cae051e3fe8a112a74a0b589f4543c156da02ad9b6a424b0ec99f6ac2b?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22"
        alt="Project visualization"
        className="object-contain grow shrink self-stretch my-auto aspect-[1.44] min-w-[240px] rounded-[100px] w-[943px] max-md:max-w-full"
      />
    </section>
  );
};

export default Projects;