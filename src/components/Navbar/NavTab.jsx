import React from "react";
const NavTab = ({ label, isActive }) => {
  const baseClasses = "flex gap-5 items-center justify-center text-xl w-32 px-4 py-2 md:py-6 border-b md:border-none";
  const activeClasses = "text-blue-700 bg-white";
  const inactiveClasses = "bg-zinc-900 text-white";

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </div>
  );
};

export default NavTab;