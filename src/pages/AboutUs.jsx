import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-white p-8 min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">About Us</h2>

      <div className="max-w-4xl mx-auto bg-gray-100 shadow-md rounded-lg p-6 text-center">
        <img
          src="https://via.placeholder.com/150"
          alt="Rushikesh Chopade"
          className="w-40 h-40 rounded-full mx-auto mb-6"
        />
        <h3 className="text-2xl font-bold">Rushikesh Chopade</h3>
        <p className="text-blue-600 font-semibold">Data Scientist, IIT KGP'22</p>
        <p className="text-gray-700 mt-4">
          I have worked extensively on Data Science and Web3 domains, collaborating with clients in Singapore, USA, Italy, and India. I hold expertise in Blockchain Data Analytics, GenAI algorithms, Computer Vision, and Teaching. My experience spans across Healthcare, Banking, Blockchain, and more.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;