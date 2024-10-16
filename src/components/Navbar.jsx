import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className=" bg-gradient-to-r from-blue-400 to-purple-400 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <Link to="/" className="text-white hover:text-yellow-300 transition duration-300">
            ZENITHEUM
          </Link>
        </h1>
        <ul className="flex space-x-8 text-lg">
          <li><Link to="/" className="hover:text-yellow-300 transition duration-300">Home</Link></li>
          <li><Link to="/web2-solutions" className="hover:text-yellow-300 transition duration-300">Web2 Solutions</Link></li>
          <li><Link to="/web3-solutions" className="hover:text-yellow-300 transition duration-300">Web3 Solutions</Link></li>
          <li><Link to="/about-us" className="hover:text-yellow-300 transition duration-300">About Us</Link></li>
          <li><Link to="/career" className="hover:text-yellow-300 transition duration-300">Career</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;