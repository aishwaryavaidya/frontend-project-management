"use client";

import { useState } from 'react';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GanttChart } from './components/Gantt-chart';
import { Task, TaskFormData, Predecessor } from './_lib/types';
import {
  updateTaskDates,
  calculateEndDate,
  generateWBS,
  getPredecessorDisplay
} from './_lib/utils';
import { format } from 'date-fns';

export default function Home() {
  // Main task state and selection/editing state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingPredecessorId, setEditingPredecessorId] = useState<string | null>(null);
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [editingStartDateId, setEditingStartDateId] = useState<string | null>(null);

  // ----- Inline Empty Task Creation -----

  const addEmptyTask = () => {
    // Determine outline level based on the selected task (if any)
    const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
    const newTask: Task = {
        id: Date.now().toString(),
        wbs: '1',
        name: '', // empty task name to be filled later
        duration: 1,
        startDate: new Date(),
        endDate: calculateEndDate(new Date(), 1),
        outlineLevel: selectedTask ? selectedTask.outlineLevel : 0,
        progress: 0,
        expanded: true,
        subtasks: [],
        isMilestone: false,
        predecessors: [],
        sino: 0,
        module: [],
        isFinancialMilestone: false
    };

    let newTasks: Task[];
    if (selectedTaskId) {
      const index = tasks.findIndex(t => t.id === selectedTaskId);
      newTasks = [...tasks];
      newTasks.splice(index + 1, 0, newTask);
    } else {
      newTasks = [...tasks, newTask];
    }
    setTasks(generateWBS(newTasks));
    // Optionally, immediately enable inline editing for the task name.
    setEditingTaskId(newTask.id);
  };

  // ----- Update Functions for Task Fields -----

  const toggleMilestone = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const isMilestone = !task.isMilestone;
        return {
          ...task,
          isMilestone,
          duration: isMilestone ? 0 : 1,
          endDate: isMilestone ? task.startDate : calculateEndDate(task.startDate, 1)
        };
      }
      return task;
    }));
  };

  // Now predecessor edit accepts just comma-separated numbers (e.g. "1,2")
  const handlePredecessorEdit = (taskId: string, predecessorStr: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const predecessors: Predecessor[] = predecessorStr.split(',')
      .map(p => p.trim())
      .filter(p => p)
      .map(p => {
         const siNo = parseInt(p);
         return {
           siNo,
           type: "FS", // default type
           taskId: tasks[siNo - 1]?.id || ''
         };
      });

    setTasks(prevTasks => {
      return prevTasks.map(t => {
        if (t.id === taskId) {
          const updatedTask = { ...t, predecessors };
          return updateTaskDates(updatedTask, prevTasks);
        }
        return t;
      });
    });
    setEditingPredecessorId(null);
  };

  const promoteTask = (taskId: string) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === taskId);
      if (taskIndex <= 0) return prevTasks;

      const newTasks = [...prevTasks];
      const currentTask = newTasks[taskIndex];
      
      if (currentTask.outlineLevel < prevTasks[taskIndex - 1].outlineLevel + 1) {
        currentTask.outlineLevel += 1;
      }

      return generateWBS(newTasks);
    });
  };

  const demoteTask = (taskId: string) => {
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === taskId);
      if (taskIndex < 0) return prevTasks;

      const newTasks = [...prevTasks];
      const currentTask = newTasks[taskIndex];
      
      if (currentTask.outlineLevel > 0) {
        currentTask.outlineLevel -= 1;
      }

      return generateWBS(newTasks);
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.filter(task => task.id !== taskId);
      return generateWBS(newTasks);
    });
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const toggleExpanded = (taskId: string) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, expanded: !task.expanded };
        }
        return task;
      });
    });
  };

  const handleTaskNameEdit = (taskId: string, newName: string) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, name: newName };
        }
        return task;
      });
    });
    setEditingTaskId(null);
  };

  const handleTaskDurationEdit = (taskId: string, newDuration: number) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          duration: newDuration,
          endDate: calculateEndDate(task.startDate, newDuration)
        };
        return updateTaskDates(updatedTask, prevTasks);
      }
      return task;
    }));
    setEditingDurationId(null);
  };

  const handleTaskStartDateEdit = (taskId: string, newStartDate: Date) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = {
          ...task,
          startDate: newStartDate,
          endDate: calculateEndDate(newStartDate, task.duration)
        };
        return updateTaskDates(updatedTask, prevTasks);
      }
      return task;
    }));
    setEditingStartDateId(null);
  };

  // ----- Rendering Each Task Row with Inline Editing -----

  const renderTask = (task: Task, index: number) => {
    const paddingLeft = task.outlineLevel * 24;
    return (
      <div key={task.id}>
        <div 
          className={`flex items-center p-2 hover:bg-gray-100 ${selectedTaskId === task.id ? 'bg-blue-50' : ''}`}
          onClick={() => setSelectedTaskId(task.id)}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {task.subtasks && task.subtasks.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(task.id);
              }}
              className="mr-2"
            >
              {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}
          <div className="grid grid-cols-12 gap-4 flex-1 items-center">
            <div className="col-span-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">{index + 1}</span>
              <span className="text-sm text-gray-500 w-16">{task.wbs}</span>
              {task.isMilestone && (
                <Diamond className="w-4 h-4 text-blue-500 mr-1" />
              )}
              {editingTaskId === task.id ? (
                <Input
                  value={task.name}
                  onChange={(e) => handleTaskNameEdit(task.id, e.target.value)}
                  onBlur={() => setEditingTaskId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTaskNameEdit(task.id, (e.target as HTMLInputElement).value);
                    }
                  }}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <span
                  onDoubleClick={() => setEditingTaskId(task.id)}
                  className="flex-1 cursor-text"
                >
                  {task.name || "Click to edit"}
                </span>
              )}
            </div>
            <div className="col-span-2">
              {editingPredecessorId === task.id ? (
                <Input
                  value={task.predecessors.map(p => getPredecessorDisplay(p, tasks)).join(',')}
                  onChange={(e) => handlePredecessorEdit(task.id, e.target.value)}
                  onBlur={() => setEditingPredecessorId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePredecessorEdit(task.id, (e.target as HTMLInputElement).value);
                    }
                  }}
                  placeholder="e.g., 1,2"
                  className="h-8"
                />
              ) : (
                <span
                  onDoubleClick={() => setEditingPredecessorId(task.id)}
                  className="text-sm text-gray-500 cursor-text"
                >
                  {task.predecessors.length > 0
                    ? task.predecessors.map(p => getPredecessorDisplay(p, tasks)).join(', ')
                    : "Click to add"}
                </span>
              )}
            </div>
            <div className="col-span-2 text-sm text-gray-500">
              {editingDurationId === task.id ? (
                <Input
                  type="number"
                  value={task.duration}
                  onChange={(e) => handleTaskDurationEdit(task.id, parseInt(e.target.value))}
                  onBlur={() => setEditingDurationId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTaskDurationEdit(task.id, parseInt((e.target as HTMLInputElement).value));
                    }
                  }}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <span onDoubleClick={() => setEditingDurationId(task.id)}>
                  {task.duration} {task.duration === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>
            <div className="col-span-2 text-sm text-gray-500">
              {editingStartDateId === task.id ? (
                <Input
                  type="date"
                  value={format(task.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => handleTaskStartDateEdit(task.id, new Date(e.target.value))}
                  onBlur={() => setEditingStartDateId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTaskStartDateEdit(task.id, new Date((e.target as HTMLInputElement).value));
                    }
                  }}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <span onDoubleClick={() => setEditingStartDateId(task.id)}>
                  {format(task.startDate, 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <span className="col-span-2 text-sm text-gray-500">
              {format(task.endDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        {task.expanded && task.subtasks && task.subtasks.map((subtask, subIndex) => 
          renderTask(subtask, index + subIndex + 1)
        )}
      </div>
    );
  };

  // ----- Main Render -----

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
          <div className="space-x-2">
            <Button
              onClick={addEmptyTask}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button
              onClick={() => selectedTaskId && toggleMilestone(selectedTaskId)}
              disabled={!selectedTaskId}
              variant="outline"
              className="border-gray-300"
            >
              <Diamond className="w-4 h-4 mr-2" />
              Mark Milestone
            </Button>
            <Button
              onClick={() => selectedTaskId && promoteTask(selectedTaskId)}
              disabled={!selectedTaskId}
              variant="outline"
              className="border-gray-300"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Promote
            </Button>
            <Button
              onClick={() => selectedTaskId && demoteTask(selectedTaskId)}
              disabled={!selectedTaskId}
              variant="outline"
              className="border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Demote
            </Button>
            <Button
              onClick={() => selectedTaskId && deleteTask(selectedTaskId)}
              disabled={!selectedTaskId}
              variant="outline"
              className="border-gray-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-4 py-3 grid grid-cols-12 gap-4 items-center font-medium text-sm text-gray-500">
              <div className="col-span-4 flex items-center space-x-2">
                <span className="w-8">SI No</span>
                <span className="w-16">WBS</span>
                <span>Task Name</span>
              </div>
              <div className="col-span-2">Predecessors</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Start Date</div>
              <div className="col-span-2">End Date</div>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.map((task, index) => renderTask(task, index))}
            </div>
          </div>

          <div>
            <GanttChart
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onTaskSelect={setSelectedTaskId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
