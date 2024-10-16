import React from 'react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
      <h1 className="text-6xl font-extrabold mb-6 animate-bounce">Welcome to AI Web Solutions</h1>
      <p className="text-2xl max-w-lg">
        Offering advanced AI and Web3 solutions for businesses around the globe.
      </p>
    </div>
  );
};

export default Home;