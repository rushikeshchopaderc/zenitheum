import React, { useState } from 'react';

const ContactForm = () => {
  // const [name, setName] = useState('');
  // const [email, setEmail] = useState('');
  // const [subject, setSubject] = useState('');
  // const [message, setMessage] = useState('');
  // const [showPopup, setShowPopup] = useState(false);

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   const mailOptions = {
  //     SecureToken: '77e79d9f-e9d5-4c52-b863-23438681efc5',
  //     To: 'zenitheumsolutions@gmail.com',
  //     From: email,
  //     Subject: subject,
  //     Body: 'Name: ' + name + '\nEmail: ' + email + '\nMessage: ' + message,
  //   };

  //   Email.send(mailOptions).then((message) => console.log(message));

  //   setShowPopup(true);
  //   setTimeout(() => {
  //     setShowPopup(false);
  //   }, 3000);
  // };

  return (
    <div className="flex overflow-hidden flex-col justify-center py-20 items-center self-stretch w-full max-md:max-w-full">
      <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdKHjHf7BMGaNejNM6il4OnuBO4ZIQ9TJciPtb9U29M4biaAQ/viewform?embedded=true" width="1024" height="1024">Loading…</iframe>
      {/* <form 
        className="flex overflow-hidden flex-col items-center p-16 max-w-full w-[916px] max-md:px-5"
        onSubmit={handleSubmit}>
        <div className="flex flex-col w-full text-2xl">
          <label htmlFor="name" className="text-white">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="overflow-hidden px-5 py-4 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700"
            placeholder="yourname@mail.com"
          />
        </div>
        <div className="flex flex-col mt-10 w-full text-2xl">
          <label htmlFor="subject" className="text-white">
            Subject
          </label>
          <textarea
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="overflow-hidden px-5 py-4 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700"
            placeholder="Regarding..."
          />
        </div>
        <div className="flex flex-col mt-10 w-full text-2xl">
          <label htmlFor="message" className="text-white">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="overflow-hidden px-5 py-4 mt-5 w-full border-2 border-solid border-zinc-700 text-zinc-700"
            placeholder="I want to..."
          />
        </div>
        <button
          data-layername="button"
          className="justify-center py-4 pr-8 pl-8 mt-10 text-base uppercase bg-blue-700 rounded-[65px] max-md:px-5 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
          onClick={handleSubmit}
          aria-label="Send Message"
        >
          Send Message
        </button>
      
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-zinc-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-10 text-zinc-900 text-2xl">
            Message sent successfully!
          </div>
        </div>
      )}
      </form> */}
    </div>
  );
};

export default ContactForm;