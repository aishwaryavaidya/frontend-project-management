import React from 'react';
import ProjectGanttChart from './ProjectGanttChart';
import TeamTable from './TeamTable';
import TeamEffortChart from './TeamEffortChart';

const headerCards = [
  { category: "Delayed By", count: "32 days", color: "bg-blue-500" },
  { category: "Risks", count: "15", color: "bg-green-500" },
  { category: "RYG", count: "Red", color: "bg-red-500" },
  { category: "Status", count: "Haulted", color: "bg-yellow-500" },
  { category: "Escalations", count: "2", color: "bg-purple-500" },
  { category: "Stage", count: "In Dev", color: "bg-indigo-500" },
];


const page = () => {
  return (
    <>
        <div className="flex justify-start items-center flex-wrap gap-2 mt-2 px-1 pt-3 pb-2">
        <h1 className='text-bold'>ABG: Vilayat (Cement)</h1>
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
      
      <div className='flex space-x-2 mt-4 ml-2' style={{ width: "100%", height: "300px" }}>
      <div className="overflow-y-auto h-full w-full">
        <ProjectGanttChart />
      </div>
      <TeamTable/>
      </div>

      <div className='flex mt-4 ml-4'>
        <TeamEffortChart/>
      </div>
    </>
  )
}

export default page
