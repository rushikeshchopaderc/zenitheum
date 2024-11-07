/**
 * This code was generated by Builder.io
 */
import React from "react";
import background from "../../images/zenitheum.png";

const Header = () => {
  return (
    <header style ={{ backgroundImage: `url(${background})`, backgroundSize: "cover", backgroundPosition: "10% center", backgroundRepeat: "no-repeat", opacity: 1}} 
    className="flex flex-col px-14 pt-80 pb-28 tracking-widest text-white max-md:px-5 max-md:py-24 max-md:mr-2 max-md:max-w-full">
      <div className="flex flex-col self-end max-w-full w-[794px] max-md:mr-2.5">
        <h1 className="mr-7 font-bold text-[156px] max-md:mr-2.5 max-md:max-w-full max-md:text-4xl">
          Zenitheum
        </h1>
        <p className="mt-28 text-5xl max-md:mt-10 max-md:max-w-full max-md:text-4xl">
          Delivering Web3 and AI-ML solutions to help businessess grow...
        </p>
      </div>
      <div className="flex flex-col mt-72 mb-0 w-full max-w-[1749px] max-md:mt-10 max-md:mb-2.5 max-md:max-w-full">
        <h2 className="self-end text-6xl font-bold text-center max-md:max-w-full max-md:text-4xl">
          Revolutionize your business by unleashing the power of Blockchain and
          AI.
        </h2>
        <p className="self-start text-5xl font-medium mt-[760px] max-md:mt-10 max-md:max-w-full max-md:text-4xl">
          Zeniteum is a leading Blockchain Analytics and AI solutions company,
          where we strive to empower businesses with tailored solutions that
          drive growth and efficiency.
        </p>
      </div>
    </header>
  );
};

export default Header;
