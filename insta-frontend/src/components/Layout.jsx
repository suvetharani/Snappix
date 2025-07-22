import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import ReportModal from "./ReportModal";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} onReportOpen={() => setShowReportModal(true)} />

      <main
        className={`transition-all duration-300 flex-1 ${
          isOpen ? "tablet:ml-64 ml-0" : "tablet:ml-20 ml-0"
        }`}
      >
        <Outlet />
      </main>
      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
    </div>
  );
}
