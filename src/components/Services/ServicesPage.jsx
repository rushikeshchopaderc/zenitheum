/**
 * This code was generated by Builder.io
 */
import React from "react";
import Header from "./Header";
import LetsWorkTogether from "./LetsWorkTogether";
import Footer from "./Footer";
import BlockchainAnalyticsServices from "./BlockchainAnalyticsServices"
import AIServices from "./AIServices";

function Services() {
  return (
    <div
      data-layername="services"
      className="flex overflow-hidden flex-col pb-40 bg-zinc-900 "
    >
      <main
        data-layername="main"
        className="flex flex-col w-full "
      >
        <Header />
        <BlockchainAnalyticsServices />
        <AIServices />
        <LetsWorkTogether />
        <Footer />
      </main>
    </div>
  );
}

export default Services;
