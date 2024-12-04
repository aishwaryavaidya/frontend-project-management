import Link from "next/link";
import React from "react";

const PromoBanner: React.FC = () => {
  return (
    <Link
      href="https://autotime.autoplant.in/"
      target="_blank"
      className="bg-black text-white py-2 flex justify-center items-center sticky top-0 h-10 inset-0 z-[999] text-sm  dark:bg-white dark:text-black"
    >
      <div className="flex items-center space-x-2 hover:text-yellow-400 transition duration-200">
        <span className="text-yellow-400">✨</span>
        <p className=" font-semibold">
          Get your <span className="text-red-600" > Timesheet</span> updated and start the Project management journey!! 🚀
        </p>
        <span className="hidden lg:inline-block ml-2 text-white hover:text-yellow-400 transition duration-200">
          &rarr;
        </span>
      </div>
    </Link>
  );
};

export default PromoBanner;
