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
      <div className="flex justify-between items-center h-16 px-4 bg-zinc-900 text-white">
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="Company logo" className="w-12 h-auto" />
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden focus:outline-none"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <nav
          className={`${
            menuOpen ? "block" : "hidden"
          } md:flex md:items-center w-full md:w-auto md:space-x-6`}
        >
          {navItems.map((item, index) => {
            const isActive = currentPage === item.to;
            const navTabClass = isActive ? 'bg-white' : '';

            // if (item.type === "logo") return null; // Skip logo in nav items

            return (
              <Link
                key={index}
                to={item.to}
                className="hover:text-blue-700 transition duration-300 ease-in-out block md:inline-block"
              >
                <NavTab label={item.label} isActive={isActive} className={navTabClass} />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;