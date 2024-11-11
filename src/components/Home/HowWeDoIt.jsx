import React from "react";
// import ProcessStep from "./ProcessStep";
import background from "../../images/block_analytics2.png";

const steps = [
  {
    title: "Scoping",
    description:
      "We connect with you to understand your business and figure out the scope of integration of AI and Web3 to your business. For your predefined requirements, we get familiar with your priorities and potential challenges, streamlining the existing and future strategies.",
    order: 1,
  },
  {
    title: "Design and Timeline",
    description:
      "We gather all the projects requirements in order to deliver the project. We gather the comprehensive list of tech-stack and prepare a prototype. We time the entire project into stages to develop superior preduct at a rapid pace.",
    order: 2,
  },
  {
    title: "Development",
    description:
      "Our team does all the coding and programming based on the design approved by the client. We prepare the product for alpha, beta and release phase.",
    order: 3,
  },
  {
    title: "Testing and optimization",
    description:
      "Once the development is done, we test all the features and algorithms thoroughly. We eliminate all the bugs in the code as well as platform in this phase.. Once it passes our rigorous training, then its ready for deployment.",
    order: 4,
  },
  {
    title: "Deployment",
    description:
      "Our experienced team deploys the modified and optimized solution to the production. Once deployed, the service is up and live.",
    order: 5,
  },
  {
    title: "Maintenance and Support",
    description:
      "After the service is successfully deployed, we provide extended maintenance and support in order to ensure the swift working of the service after development.",
    order: 6,
  },
];

const ProcessStep = ({ title, description, order, steps }) => {
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
      {order < steps.length && (
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

const HowWeDoIt = () => {
  return (
    <section
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        opacity: 1,
      }}
      className="flex flex-col items-center px-36 mt-8 w-full border border-black border-solid min-h-[1396px] max-md:px-5 max-md:max-w-full"
    >
      <div className="flex flex-col justify-center items-center text-white min-h-[151px] max-md:max-w-full">
        <h2 className="text-6xl font-medium leading-none max-md:text-4xl">
          How we do it!
        </h2>
        <p className="mt-4 text-2xl leading-none text-center max-md:max-w-full">
          A detailed description of our practical approach to the problem
          statement
        </p>
      </div>
      <div className="flex flex-col py-3.5 mt-16 max-w-full rounded-none w-[1200px] max-md:mt-10">
        {steps.map((step, index) => (
          <ProcessStep
            key={index}
            title={step.title}
            description={step.description}
            order={index + 1}
            steps={steps}
          />
        ))}
      </div>
    </section>
  );
};

export default HowWeDoIt;