import React, { useState } from 'react';

function ContactForm() {
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  return (
    <div>
      <form
        className="flex overflow-hidden flex-col items-center p-16 max-w-full w-[916px] max-md:px-5"
        action="https://script.google.com/macros/d/AKfycbzlYYJWwKn28smF5S-hetrJ-2G0Ss8fzORR3bcyZ-VFaCjdLii4qCSc_G07IiRVsk7Q/exec"
        method="post"
      >
        <div className="flex flex-col w-full text-2xl">
          <label htmlFor="name" className="text-white">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="overflow-hidden px-5 py-4 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700"
            placeholder="Jhon Doe"
          />
        </div>
        <div className="flex flex-col mt-10 w-full text-2xl whitespace-nowrap">
          <label htmlFor="email" className="text-white">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="overflow-hidden px-5 py-4 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700"
            placeholder="yourname@mail.com"
          />
        </div>
        <div className="flex flex-col mt-10 w-full text-2xl">
          <label htmlFor="subject" className="text-white">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            className="overflow-hidden px-5 py-4 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700"
            placeholder="I want to..."
          />
        </div>
        <div className="flex flex-col mt-10 w-full text-2xl whitespace-nowrap">
          <label htmlFor="message" className="text-white">
            Message
          </label>
          <textarea
            id="message"
            className="overflow-hidden px-8 pt-6 pb-60 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700 max-md:px-5 max-md:pb-28"
            placeholder="Hello,...."
          ></textarea>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          className="justify-center text-center py-4 w-fit pr-8 pl-8 mt-10 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          Submit
        </button>
        {showPopup && (
          <div className="bg-white py-20 px-20 border border-gray-300 rounded-md shadow-md">
            <p>Thanks for connecting with us! Our team will get in touch with you shortly.</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default ContactForm;