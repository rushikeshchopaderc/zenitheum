/**
 * This code was generated by Builder.io
 */
import React from "react";
import Header from "./Header";
import MeetTheFounder from "./MeetTheFounder";
import OurTeam from "./OurTeam";
import CoreValues from "./CoreValues";
import Footer from "./Footer";

function AboutUs() {
  return (
    <div
      data-layername="aboutUs"
      className="flex overflow-hidden flex-col pb-40 bg-zinc-900 max-md:pb-24"
    >
      <main className="flex flex-col w-full max-md:max-w-full">
        <Header />
        <MeetTheFounder />
        <OurTeam />
        <CoreValues />
      </main>
      <Footer />
    </div>
  );
}

export default AboutUs;