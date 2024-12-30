import React from 'react';
import ProjectGanttChart from './ProjectGanttChart';
import ProjectTimeline from '../proj-timeline/ProjectTimeline';
import TeamTable from './TeamTable';
import TeamEffortChart from './TeamEffortChart';


const page = () => {
  return (
    <>
      <div className='flex space-x-4 mt-4 ml-4'>
        <ProjectGanttChart/>
        
      </div>
      <div className='flex mt-4 ml-4'>
        <TeamTable/>
        <TeamEffortChart/>
      </div>
    </>
  )
}

export default page
