/**
 * This code was generated by Builder.io
 */
import React from "react";
import ServiceSection from "./ServiceSection";
import SmartImage from "../../images/smart_contract.png";
import DataMineImage from "../../images/block_analytics.png";
import DataVisImage from "../../images/dashboard.png";
import DataIndImage from "../../images/data_indexing.png";
import Web3Image from "../../images/web3_merge.png";


const BlockchainAnalyticsServices = () => {
  return (
    <div
      data-layername="blockchainAnalyticsServices"
      className="flex overflow-hidden flex-col bg-zinc-900 max-md:pb-24"
    >
      <main
        data-layername="main"
        className="flex flex-col w-full max-md:max-w-full"
      >
        <header
          data-layername="header"
          className="flex flex-col items-center text-center text-white w-full py-20 max-md:max-w-full"
        >
          <div
            data-layername="TextAndServiceSectionContainer"
            className="flex overflow-hidden justify-center items-center w-full max-md:px-5"
          >
            <div
              data-layername="TextContainer"
              className="flex overflow-hidden flex-col flex-1 shrink justify-center self-stretch basis-0  max-md:max-w-full"
            >
              <h1
                data-layername="BlockchainHeader"
                className="text-9xl font-medium leading-none max-md:max-w-full max-md:text-4xl"
              >
                Blockchain Analytics Services
              </h1>
              <p
                data-layername="Description"
                className="self-center mt-16 text-2xl w-[75%] max-md:mt-10 max-md:max-w-full"
              >
                Blockchain Analytics services at Zenitheum offer innovative
                solutions tailored to meet the evolving demands of the digital
                landscape. Our advanced offerings include customizable smart
                contracts that empower your business with enhanced data
                insights. With a focus on blockchain data visualization and
                custom analytics solutions, we ensure that your organization can
                make informed decisions backed by robust data analysis.
              </p>
            </div>
          </div>
        </header>

        <ServiceSection
          title="Smart Contracts for Blockchain Data Analytics"
          description="By designing smart contracts for Data sharing agreements, tracking the origin of your assets/products, And automating of complex data analytics tasks, we provide state-of-the-art support to our clients."
          buttonText="Explore the scope"
          imageSrc={SmartImage}
          imageAlt="Smart Contracts visualization"
        />

        <ServiceSection
          title="Blockchain Data Mining and AI Modelling"
          description="Make smarter business decisions with well-informed decisions based on blockchain data. We do the in-depth analysis empowering you to make smart decisions faster."
          buttonText="Explore the scope"
          imageSrc={DataMineImage}
          imageAlt="Data Mining and AI Modelling illustration"
          reverse={true}
        />

        <ServiceSection
          title="Blockchain Data Visualization"
          description="Streamline your operations and gain a competitive edge by visualizing blockchain data effectively."
          buttonText="request a Demo"
          imageSrc={DataVisImage}
          imageAlt="Blockchain Data Visualization example"
        />

        <ServiceSection
          title="Data Indexing Solutions"
          description="Our data indexing solutions are a heaven for developers to build their custom APIs and faster data retrieval from blockchain."
          buttonText="request a Demo"
          imageSrc={DataIndImage}
          imageAlt="Data Indexing Solutions illustration"
          reverse={true}
        />

        <ServiceSection
          title="Merge Web3 into your business to..."
          description="Increase Brand Engagement by building your own NFT collection
                and adopt revenue sharing model instead of traditional marketing
                models. 
                Expand businesses to regions facing restricted limited internet
                access.
                Give your customers power over their data offering enhanced
                brand trust and greater engagement.
                Optimize business operations like budgeting, supply chain
                management, manufacturing, and auditing with Web3 integration"
          buttonText="Explore the scope"
          imageSrc={Web3Image}
          imageAlt="Merge Web3 into your business to illustration"
        />
      </main>
    </div>
  );
};

export default BlockchainAnalyticsServices;
