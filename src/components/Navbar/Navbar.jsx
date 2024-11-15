import React, { useState, useEffect } from "react";
import NavTab from "./NavTab";
import Logo from "../../images/Zenitheum_removebg.png";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const navItems = [
  { label: "Home", to: "/", isActive: true },
  { label: "Products", to: "/products", isActive: false },
  { label: "Services", to: "/services", isActive: false },
  { label: "Trainings", to: "/trainings", isActive: false },
  { type: "logo" },
  { label: "Clients", to: "/clients", isActive: false },
  { label: "About Us", to: "/about-us", isActive: false },
  { label: "Research", to: "/research", isActive: false },
  { label: "Careers", to: "/careers", isActive: false },
];

const Navbar = () => {
  const [currentPage, setCurrentPage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCurrentPage(location.pathname);
    setMenuOpen(false); // Close menu on page change
  }, [location.pathname]);

  return (
    <header
      className={`${
        currentPage === "/" ? "bg-white" : "bg-zinc-900"
      } border-b border-zinc-700 max-w-full`}
    >
      <div className="flex justify-center items-center w-[100%] bg-zinc-900 text-white md:flex md:justify-around">
        <div className="flex gap-8 md:gap-4">
          {navItems.slice(0, 4).map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="hover:text-blue-700 transition duration-300 ease-in-out block md:inline-block"
            >
              <NavTab label={item.label} isActive={currentPage === item.to} />
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-center md:flex md:items-center md:justify-center">
          <Link to="/" className="flex items-center justify-center">
            <img src={Logo} alt="Company logo" className="object-cover md:w-12 items-center h-auto scale-150" />
          </Link>
        </div>
        <div className="flex gap-8 md:gap-4">
          {navItems.slice(5).map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="hover:text-blue-700 transition duration-300 ease-in-out block md:inline-block"
            >
              <NavTab label={item.label} isActive={currentPage === item.to} />
            </Link>
          ))}
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden focus:outline-none"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;