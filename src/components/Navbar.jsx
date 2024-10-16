import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to handle the mobile menu visibility

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-400 to-purple-400 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <Link to="/" className="text-white hover:text-yellow-300 transition duration-300">
            ZENITHEUM
          </Link>
        </h1>
        {/* Desktop menu */}
        <ul className="hidden md:flex space-x-8 text-lg">
          <li><Link to="/" className="hover:text-yellow-300 transition duration-300">Home</Link></li>
          <li><Link to="/web2-solutions" className="hover:text-yellow-300 transition duration-300">Web2 Solutions</Link></li>
          <li><Link to="/web3-solutions" className="hover:text-yellow-300 transition duration-300">Web3 Solutions</Link></li>
          <li><Link to="/about-us" className="hover:text-yellow-300 transition duration-300">About Us</Link></li>
          <li><Link to="/career" className="hover:text-yellow-300 transition duration-300">Career</Link></li>
        </ul>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {/* Burger icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - Conditional rendering based on isOpen */}
      {isOpen && (
        <div className="md:hidden">
          <ul className="flex flex-col space-y-4 text-lg mt-4">
            <li><Link to="/" onClick={toggleMenu} className="hover:text-yellow-300 transition duration-300">Home</Link></li>
            <li><Link to="/web2-solutions" onClick={toggleMenu} className="hover:text-yellow-300 transition duration-300">Web2 Solutions</Link></li>
            <li><Link to="/web3-solutions" onClick={toggleMenu} className="hover:text-yellow-300 transition duration-300">Web3 Solutions</Link></li>
            <li><Link to="/about-us" onClick={toggleMenu} className="hover:text-yellow-300 transition duration-300">About Us</Link></li>
            <li><Link to="/career" onClick={toggleMenu} className="hover:text-yellow-300 transition duration-300">Career</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;