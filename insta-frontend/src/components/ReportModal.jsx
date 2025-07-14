import { useState } from "react";

export default function ReportModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");
  const isDisabled = message.trim() === "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Header */}
        <h2 className="text-lg font-semibold text-center mb-4">Report a Problem</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        {/* Textarea */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please include as much info as possible..."
          className="w-full h-32 border border-gray-300 p-3 rounded mb-4 resize-none"
        ></textarea>

        {/* Actions */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              alert("Report sent!");
              onClose();
              setMessage("");
            }}
            disabled={isDisabled}
            className={`px-4 py-2 rounded text-white ${
              isDisabled
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Send Report
          </button>

          <label className="px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-100">
            Add File
            <input type="file" className="hidden" />
          </label>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-gray-500">
          Your Instagram username and browser information will be automatically included in your report.
        </p>
      </div>
    </div>
  );
}
