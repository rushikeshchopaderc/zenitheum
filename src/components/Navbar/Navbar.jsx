import React, { useState, useEffect } from "react";
import NavTab from "./NavTab";
import Logo from "../../images/Zenitheum_removebg.png";
import { Link, useLocation } from "react-router-dom";

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
  const location = useLocation();

  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  return (
    <header
      className={`${
        currentPage === "/" ? "bg-white" : "bg-zinc-900"
      } border-b border-zinc-700 max-w-full`}
    >
      <nav
        className={"flex items-center justify-around w-[100%] text-center text-md tracking-widest leading-none uppercase whitespace-nowrap border-b bg-zinc-900 border-zinc-700 max-md:max-w-full text-white"}
      >
        {navItems.map((item, index) => {
            const isActive = currentPage === item.to;
            const navTabClass = isActive ? 'bg-white' : '';

            if (item.type === "logo") {
                return (
                    <div
                        data-layername="logoFrame"
                        className="flex flex-col px-20 border justfy-around border-solid bg-zinc-900 border-neutral-700 max-md:px-5"
                    >
                        <img
                            loading="lazy"
                            src={Logo}
                            alt="Company logo"
                            className="object-cover aspect-[2.5]"
                        />
                    </div>
                );
            }
            return (
                <Link key={index} to={item.to} className="hover:text-blue-700 transition duration-300 ease-in-out">
                    <NavTab label={item.label} isActive={isActive} className={navTabClass} />
                </Link>
            );
        })}
      </nav>
    </header>
  );
};

export default Navbar;