import React from "react";

export function App() {
  return (
    <div className="w-[300px] p-5">
      <h2 className="text-lg font-semibold">Spoiler Blocker</h2>
      <p className="mt-2 text-sm text-gray-600">Ready to protect you from spoilers!</p>
      <button
        type="button"
        className="mt-4 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        onClick={() => alert("Extension is working!")}
      >
        Test Extension
      </button>
    </div>
  );
}
