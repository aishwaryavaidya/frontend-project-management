import React from "react";
import Marquee from "react-fast-marquee";
import SummaryTable from "./SummaryTable";
import UpscrollingFeed from "./UpscrollingFeed";
import PhaseChart from "./PhaseChart";
import EffortEstimation from "./EffortEstimation";
import InvoicePending from "./InvoicePending";
import Delays from "./Delays";

const page = () => {

  const headerCards = [
    { category: "Active Customers", count: "114", color: "bg-blue-500" },
    { category: "Active Projects", count: "114", color: "bg-green-500" },
    { category: "Delayed Projects", count: "114", color: "bg-red-500" },
    { category: "Sign-offs Pending", count: "114", color: "bg-yellow-500" },
    { category: "Sign-offs Received", count: "114", color: "bg-purple-500" },
    { category: "Go-lives", count: "114 this month", color: "bg-indigo-500" },
    { category: "R  Y  G Projects", count: "1 10 238", color: "bg-pink-500" },
    { category: "Total Go-lives", count: "214", color: "bg-orange-500" },
  ];

  return (
    <>
    <div className="flex justify-start items-center flex-wrap gap-2 mt-2 px-1 pt-3 pb-2">
      {headerCards.map((card, index) => (
        <div
          key={index}
          className={`flex flex-col justify-center items-center w-32 h-12 p-2 text-sm font-light rounded-md shadow-lg 
                      ${card.color} text-white bg-gradient-to-r from-${card.color.split('-')[1]}-300 via-${card.color.split('-')[1]}-500 to-${card.color.split('-')[1]}-700`}>
          <p className="text-xs font-semibold">{card.category}</p>
          <p className="text-[12px]">{card.count}</p>
        </div>
      ))}
    </div>
    {/* Scrolling ribbon */}
    <div className="flex justify-between text-center bg-blue-950 h-5.5 space-x-1 overflow-hidden">
      
    <div className="flex items-center h-5.6">
    <span className="ml-2 text-white bg-orange-500 pl-2 text-m ">Latest News: </span>
    <span className="w-0 h-0 border-t-[11px] border-b-[11px] border-l-[5.5px] border-t-transparent border-b-transparent border-l-orange-500"></span>
  
    </div>
      <div className="flex-1">
      <Marquee speed={80}>
        <span className="text-white text-xs font-semibold space-x-4">
          Congratulations!!! Go Live for project XYZ successfully done by Project Manager on 25th Jan 2025
        </span>
        <span className="text-white text-xs font-semibold">
          .     Up-coming GO-live for ABC project in next 7 days by PM Name!!!
        </span>
      </Marquee>
      </div>
    </div>

  <div>
    <div className="flex justify-between pl-2 w-full bg-white rounded-lg p-1 dark:bg-black border-b " style={{height: "360px"}}>
            <div className="flex"> <SummaryTable /> </div>
            <div className="flex w-full h-80 mt-2 ml-2.5"> <UpscrollingFeed/> </div>
    </div>

    <div className="flex mt-4 justify-center gap-2 items-start rounded-lg shadow-md dark:bg-black h-" >
        {/* Project Phases Overview */}
        <div className="flex flex-col items-center w-1/2 z-30">
            <h2 className="text-base font-semibold text-center mb-2">Project Phases Overview</h2>
            <PhaseChart />
        </div>

        {/* Effort Estimation by Customer */}
        <div className="flex flex-col items-center w-1/2 z-50 overflow-visible ">
            <h2 className="text-base font-semibold text-center">Effort Estimation by Customer</h2>
            <EffortEstimation />
        </div>
  </div>

        {/* Invoices Pending */}
        <div className="flex flex-col items-center w-1/2 mt-2">
            <h2 className="text-base font-semibold text-center mb-2">Invoices Pending</h2>
            <InvoicePending />
            {/* <Delays/> */}

        </div>


  </div>

    </>
  );
};

export default page;
