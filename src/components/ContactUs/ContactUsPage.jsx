/**
 * This code was generated by Builder.io
 */
import React from "react";
import ContactForm from "./ContactForm";
import Footer from "./Footer";
import { useEffect } from 'react';

function ContactUs() {
  useEffect(() => {
    window.scrollTo(0,0);
  }, []);

  return (
    <main className="flex overflow-hidden flex-col py-20 bg-zinc-900 max-md:pb-24">
      <section className="flex flex-col items-center w-full max-md:max-w-full">
        <div className="flex overflow-hidden justify-center items-center w-full text-center text-white">
          <div className="flex overflow-hidden flex-col justify-center self-stretch w-full max-md:max-w-full">
            <h2 className="text-9xl font-medium leading-none max-md:max-w-full max-md:text-4xl">
              Get in Touch
            </h2>
            <p className="self-center mt-16 text-2xl w-[75%] max-md:mt-10 max-md:max-w-full">
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
    </main>
  );
}

export default ContactUs;
