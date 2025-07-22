import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main
        className={`transition-all duration-300 flex-1 ${
          isOpen ? "tablet:ml-64 ml-0" : "tablet:ml-20 ml-0"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
