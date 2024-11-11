import React from "react";
import { useNavigate } from "react-router-dom";


function ResearchTeamHero(){
  const navigate = useNavigate();

  const handleViewServices = () => {
    navigate('/contactus'); 
  };

  return(
    
    <section className="flex overflow-hidden my-20 flex-col justify-center items-center text-white">
      <h1 className="self-stretch text-9xl font-medium text-center leading-[144px] max-md:max-w-full max-md:text-4xl max-md:leading-[50px]">
        Join our Research Team...
      </h1>
      <p className="mt-16 text-2xl text-center w-[986px] max-md:mt-10 max-md:max-w-full">
        Passionate about research? Love to dive deep into this ever expanding ocean
        of AI and web3? You are most welcome to join our research team at Zenitheum.
        Get your hands dirty to get to the roots of the complex technology
      </p>
      <button
          data-layername="button"
          className="flex py-4 pr-8 justify-center pl-8 mt-10 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          onClick={handleViewServices}
          aria-label="Connect with us"
        >
          Connect with us
      </button>
    </section>
  );
}
export default ResearchTeamHero;