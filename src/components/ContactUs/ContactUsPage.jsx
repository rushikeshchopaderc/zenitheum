/**
 * This code was generated by Builder.io
 */
import React from "react";
import ContactForm from "./ContactForm";
import Footer from "./Footer";
import SocialLinks from "./SocialLinks";

function ContactUs() {
  return (
    <main className="flex overflow-hidden flex-col pb-52 bg-zinc-900 max-md:pb-24">
      <section className="flex z-10 flex-col self-end pb-5 -mt-20 max-w-full text-white w-[125px]">
        <h1 className="overflow-hidden z-10 gap-2.5 self-stretch text-3xl">
          Your Logo Here
        </h1>
        <h2 className="self-end mt-0 text-xl tracking-widest leading-none uppercase">
          About Us
        </h2>
      </section>
      <section className="flex flex-col items-center mt-5 w-full max-md:max-w-full">
        <div className="flex overflow-hidden justify-center items-center max-w-full text-center text-white min-h-[553px] w-[1920px]">
          <div className="flex overflow-hidden flex-col justify-center self-stretch my-auto min-h-[553px] w-[1920px] max-md:max-w-full">
            <h2 className="text-9xl font-medium leading-none max-md:max-w-full max-md:text-4xl">
              Get a Product/Service
            </h2>
            <p className="self-center mt-16 text-2xl w-[986px] max-md:mt-10 max-md:max-w-full">
              We're just one step away from connecting with you! Whether you
              have questions about our services, want to discuss a potential
              collaboration, or need personalized technology solutions, our team
              is here to assist you. Reach out to us via phone, email, or the
              contact form, and let's start a conversation that leads to
              transformative outcomes for your business. We look forward to
              hearing from you and exploring the boundless opportunities
              together.
            </p>
          </div>
        </div>
        <ContactForm />
      </section>
      <Footer />
      <SocialLinks className="flex z-10 flex-wrap gap-6 items-start self-end mt-0 mr-28 max-md:mr-2.5" />
      <div className="flex items-end -mt-6 ml-32 w-full text-base text-white max-md:max-w-full">
        <p className="min-w-[240px]">
          Copyright © 2024. All rights reserved by Zenitheum
        </p>
      </div>
    </main>
  );
}

export default ContactUs;