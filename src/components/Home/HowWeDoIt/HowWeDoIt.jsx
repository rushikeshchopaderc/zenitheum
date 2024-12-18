/**
 * This code was generated by Rushikesh
 */
import React from "react";
import StepCard from "./StepCard";
import background from "../../../images/homepage_bg.png";

const steps = [
  {
    number: 1,
    title: "Scoping",
    description:
      "We connect with you to understand your business and figure out the scope of integration of AI and Web3 to your business. For your predefined requirements, we get familiar with your priorities and potential challenges, streamlining the existing and future strategies.",
  },
  {
    number: 2,
    title: "Design and Timeline",
    description:
      "We gather all the projects requirements in order to deliver the project. We gather the comprehensive list of tech-stack and prepare a prototype. We time the entire project into stages to develop superior preduct at a rapid pace.",
  },
  {
    number: 3,
    title: "Development",
    description:
      "Our team does all the coding and programming based on the design approved by the client. We prepare the product for alpha, beta and release phase.",
  },
  {
    number: 4,
    title: "Testing & optimization",
    description:
      "Once the development is done, we test all the features and algorithms thoroughly. We eliminate all the bugs in the code as well as platform in this phase.. Once it passes our rigorous training, then its ready for deployment.",
  },
  {
    number: 5,
    title: "Deployment",
    description:
      "Our experienced team deploys the modified and optimized solution to the production. Once deployed, the service is up and live.",
  },
  {
    number: 6,
    title: "Maintenance & Support",
    description:
      "After the service is successfully deployed, we provide extended maintenance and support in order to ensure the swift working of the service after development.",
  },
];

function HowWeDoIt() {
  return (
    <section 
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        opacity: 1,
      }}
      className="flex flex-col items-center px-20 py-24 border border-black border-solid max-md:px-5">
      <header className="flex flex-col justify-center items-center text-white min-h-[151px] max-md:max-w-full">
        <h1 className="text-6xl font-medium leading-none max-md:text-4xl">
          How we do it!
        </h1>
        <p className="mt-16 text-4xl leading-none text-center max-md:max-w-full">
          A detailed description of our practical approach to the problem
          statement
        </p>
      </header>
      <main className="flex flex-col mt-32 rounded-none w-[70%] max-md:mt-10">
        <div className="max-md:max-w-full">
          <div className="flex flex-wrap gap-5 max-md:flex-col">
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                isEven={index % 2 !== 0}
              />
            ))}
          </div>
        </div>
      </main>
    </section>
  );
}

export default HowWeDoIt;
