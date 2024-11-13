/**
 * This code was generated by Builder.io
 */
import React from "react";
import Image from "../../images/merge_with_web3.png";
import background from "../../images/homepage_bg.png";
const MergeWithWeb3 = () => {
  return (
    <section style ={{ backgroundImage: `url(${background})`, backgroundSize: "cover", backgroundPosition: "100% 100%", backgroundRepeat: "no-repeat", opacity: 1}} 
    className="flex flex-wrap gap-20 items-center justify-center px-20 py-40 font-medium tracking-widest text-white max-md:px-5 max-md:mr-2 max-md:max-w-full bg-opacity-20%">
      <p className="text-center text-4xl w-[25%] max-md:max-w-full">
        We ace into figuring out the scope of integration of Web3 into your
        business to increase customer engagement and optimize your internal
        business operations. Get in touch with us to figure out the scope.
      </p>
      <img
        loading="lazy"
        src={Image}
        alt="Web3 integration illustration"
        className="object-contain justify-center self-stretch aspect-[0.81] w-[35%] rounded-[100px] max-md:max-w-full"
      />
      <h2 className="text-center text-6xl w-[25%] max-md:max-w-full max-md:text-4xl">
        Stay ahead of your competitors with our Digital Transformation Services
        in web3...
      </h2>
    </section>
  );
};

export default MergeWithWeb3;
