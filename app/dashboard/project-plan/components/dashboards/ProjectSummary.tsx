'use client';

import { FC, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTaskContext } from './TaskProvider';
import { STAGES, PRODUCTS } from '@/types/task';
import { calculateSchedulePercentage } from '@/lib/taskUtils';

const ProjectSummary: FC = () => {
  const { tasks, loading } = useTaskContext();
  const [overallProgress, setOverallProgress] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksInProgress, setTasksInProgress] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [nextMilestone, setNextMilestone] = useState<{name: string, date: Date} | null>(null);
  const [projectTimeline, setProjectTimeline] = useState({start: new Date(), end: new Date()});
  
  useEffect(() => {
    if (loading || tasks.length === 0) return;
    
    // Filter active tasks
    const activeTasks = tasks.filter(task => !task.isDeleted);
    setTotalTasks(activeTasks.length);
    
    // Count completed and in-progress tasks
    const completed = activeTasks.filter(t => t.progress === 100 || t.actualEndDate).length;
    const inProgress = activeTasks.filter(t => (t.progress > 0 && t.progress < 100) || (t.actualStartDate && !t.actualEndDate)).length;
    
    setTasksCompleted(completed);
    setTasksInProgress(inProgress);
    
    // Calculate overall progress
    const avgProgress = activeTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / activeTasks.length;
    setOverallProgress(Math.round(avgProgress));
    
    // Find next upcoming milestone (level 0 task that's not completed)
    const milestones = activeTasks
      .filter(t => t.level === 0 && t.progress < 100 && !t.actualEndDate && t.endDate)
      .sort((a, b) => (a.endDate?.getTime() || 0) - (b.endDate?.getTime() || 0));
    
    if (milestones.length > 0) {
      setNextMilestone({
        name: milestones[0].taskName,
        date: milestones[0].endDate as Date
      });
    }
    
    // Calculate overall project timeline
    const allDates = activeTasks
      .filter(t => t.startDate || t.endDate)
      .flatMap(t => [t.startDate, t.endDate])
      .filter(Boolean) as Date[];
    
    if (allDates.length > 0) {
      const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      
      setProjectTimeline({start: minDate, end: maxDate});
    }
  }, [tasks, loading]);
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-24">
            <p className="text-gray-500">Loading project summary...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const getStatusColor = () => {
    if (overallProgress >= 90) return 'bg-green-100 text-green-800';
    if (overallProgress >= 60) return 'bg-blue-100 text-blue-800';
    if (overallProgress >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getProjectStatus = () => {
    if (overallProgress >= 90) return 'Near Completion';
    if (overallProgress >= 60) return 'On Track';
    if (overallProgress >= 30) return 'In Progress';
    return 'Just Started';
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Project Timeline</h3>
            <p className="text-2xl font-bold">
              {formatDate(projectTimeline.start)} - {formatDate(projectTimeline.end)}
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{overallProgress}%</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getProjectStatus()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Tasks Status</h3>
            <p className="text-2xl font-bold">
              {tasksCompleted} / {totalTasks}
              <span className="text-sm font-normal text-gray-500 ml-2">Completed</span>
            </p>
            <p className="text-md">
              <span className="font-medium text-blue-600">{tasksInProgress}</span> in progress,
              <span className="font-medium text-gray-500 ml-1">{totalTasks - tasksCompleted - tasksInProgress}</span> not started
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Next Milestone</h3>
            {nextMilestone ? (
              <>
                <p className="text-lg font-bold">{nextMilestone.name}</p>
                <p className="text-md">Due: {formatDate(nextMilestone.date)}</p>
              </>
            ) : (
              <p className="text-lg">No upcoming milestones</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSummary; 