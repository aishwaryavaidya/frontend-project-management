"use client";
import React from "react";

interface ProgressBarProps {
  value: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  return (
    <div className="relative w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
      <div
        className={`h-4 rounded-full transition-all duration-300 ease-in-out ${
          value >= 100 ? "rounded-full" : "rounded-l-full" // Keep the left side rounded
        }`}
        style={{
          width: `${value}%`,
          backgroundColor: value >= 100 ? "green" : "#3b82f6", // Blue when not completed, green when completed
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center font-semibold text-black dark:text-white">
          {`${value}%`}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
