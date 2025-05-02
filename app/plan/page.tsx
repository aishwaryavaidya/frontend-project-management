"use client";

import { useState, useEffect } from 'react';
import { Plus, ArrowRight, ArrowLeft, Diamond, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskFormDialog } from './components/task-form-dialog';
import { DeleteTaskModal } from './components/delete-task-modal';
import { TaskTable } from './components/task-table';
import { GanttChart } from './components/gantt-chart';
import { Task, TaskFormData, Predecessor } from './lib/types';
import { updateTaskDates, calculateEndDate, generateWBS, findDependentTasks } from './lib/utils';
import { toast } from 'sonner';


export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      fetchTasks();
    }, []);
  
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleAddTask = async (formData: TaskFormData, afterTaskId?: string) => {
      try {
        const selectedTask = afterTaskId ? tasks.find(t => t.id === afterTaskId) : null;
        
        const newTask: Task = {
          id: Date.now().toString(),
          wbs: '1',
          name: formData.name,
          duration: formData.duration,
          startDate: formData.startDate,
          endDate: calculateEndDate(formData.startDate, formData.duration),
          actualStartDate: formData.actualStartDate,
          actualEndDate: formData.actualEndDate,
          predecessors: formData.predecessors,
          isMilestone: formData.isMilestone,
          outlineLevel: selectedTask ? selectedTask.outlineLevel : 0,
          progress: 0,
          expanded: true,
          subtasks: [],
        };
  
        const updatedTask = updateTaskDates(newTask, tasks);
        let newTasks: Task[];
  
        if (afterTaskId) {
          const index = tasks.findIndex(t => t.id === afterTaskId);
          newTasks = [...tasks];
          newTasks.splice(index + 1, 0, updatedTask);
        } else {
          newTasks = [...tasks, updatedTask];
        }
  
        const wbsUpdatedTasks = generateWBS(newTasks);
  
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
  
        if (!response.ok) {
          throw new Error('Failed to add task');
        }
  
        setTasks(wbsUpdatedTasks);
        toast.success('Task added successfully');
      } catch (error) {
        console.error('Error adding task:', error);
        toast.error('Failed to add task');
      }
    };
  
    const toggleMilestone = async (taskId: string) => {
      try {
        const updatedTasks = tasks.map(task => {
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
        });
  
        const taskToUpdate = updatedTasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;
  
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskToUpdate),
        });
  
        if (!response.ok) throw new Error('Failed to update task');
  
        setTasks(updatedTasks);
        toast.success('Task updated successfully');
      } catch (error) {
        console.error('Error updating task:', error);
        toast.error('Failed to update task');
      }
    };
  
    const handlePredecessorEdit = async (taskId: string, predecessorStr: string) => {
      try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
  
        const predecessors: Predecessor[] = predecessorStr.split(',')
          .map(p => p.trim())
          .filter(p => p)
          .map(p => {
            const siNo = parseInt(p);
            if (isNaN(siNo) || siNo < 1 || siNo > tasks.length) return null;
            return {
              siNo,
              type: 'FS',
              taskId: tasks[siNo - 1].id
            };
          })
          .filter((p): p is Predecessor => p !== null);
  
        const updatedTask = { ...task, predecessors };
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
  
        if (!response.ok) throw new Error('Failed to update task');
  
        setTasks(prevTasks => {
          return prevTasks.map(t => {
            if (t.id === taskId) {
              return updateTaskDates({ ...t, predecessors }, prevTasks);
            }
            return t;
          });
        });
  
        toast.success('Task dependencies updated');
      } catch (error) {
        console.error('Error updating task dependencies:', error);
        toast.error('Failed to update task dependencies');
      }
    };
  
    const promoteTask = async (taskId: string) => {
      try {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex <= 0) return;
  
        const updatedTasks = [...tasks];
        const currentTask = updatedTasks[taskIndex];
        
        if (currentTask.outlineLevel < tasks[taskIndex - 1].outlineLevel + 1) {
          currentTask.outlineLevel += 1;
        }
  
        const wbsUpdatedTasks = generateWBS(updatedTasks);
  
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentTask),
        });
  
        if (!response.ok) throw new Error('Failed to promote task');
  
        setTasks(wbsUpdatedTasks);
        toast.success('Task promoted successfully');
      } catch (error) {
        console.error('Error promoting task:', error);
        toast.error('Failed to promote task');
      }
    };
  
    const demoteTask = async (taskId: string) => {
      try {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex < 0) return;
  
        const updatedTasks = [...tasks];
        const currentTask = updatedTasks[taskIndex];
        
        if (currentTask.outlineLevel > 0) {
          currentTask.outlineLevel -= 1;
        }
  
        const wbsUpdatedTasks = generateWBS(updatedTasks);
  
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentTask),
        });
  
        if (!response.ok) throw new Error('Failed to demote task');
  
        setTasks(wbsUpdatedTasks);
        toast.success('Task demoted successfully');
      } catch (error) {
        console.error('Error demoting task:', error);
        toast.error('Failed to demote task');
      }
    };
  
    const handleTaskNameEdit = async (taskId: string, newName: string) => {
      try {
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, name: newName };
          }
          return task;
        });
  
        const taskToUpdate = updatedTasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;
  
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskToUpdate),
        });
  
        if (!response.ok) throw new Error('Failed to update task name');
  
        setTasks(updatedTasks);
        toast.success('Task name updated');
      } catch (error) {
        console.error('Error updating task name:', error);
        toast.error('Failed to update task name');
      }
    };
  
    const handleDeleteTasks = async () => {
      try {
        const dependentTasks = findDependentTasks(selectedTaskIds, tasks);
        if (dependentTasks.length > 0) {
          setShowDeleteModal(true);
          return;
        }
  
        for (const taskId of selectedTaskIds) {
          const response = await fetch(`/api/tasks?id=${taskId}`, {
            method: 'DELETE',
          });
  
          if (!response.ok) throw new Error('Failed to delete task');
        }
  
        setTasks(prevTasks => {
          const newTasks = prevTasks.filter(task => !selectedTaskIds.includes(task.id));
          return generateWBS(newTasks);
        });
  
        setSelectedTaskIds([]);
        toast.success(`${selectedTaskIds.length} task(s) deleted successfully`);
      } catch (error) {
        console.error('Error deleting tasks:', error);
        toast.error('Failed to delete tasks');
      }
    };
  
    const handleUpdateDependency = async (taskId: string, newPredecessors: Predecessor[]) => {
      try {
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, predecessors: newPredecessors };
          }
          return task;
        });
  
        const taskToUpdate = updatedTasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;
  
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskToUpdate),
        });
  
        if (!response.ok) throw new Error('Failed to update task dependencies');
  
        setTasks(updatedTasks);
        toast.success('Task dependencies updated');
      } catch (error) {
        console.error('Error updating task dependencies:', error);
        toast.error('Failed to update task dependencies');
      }
    };
  
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Project Manager</h1>
                <div className="space-x-2">
                  <TaskFormDialog
                    tasks={tasks}
                    onSubmit={(data) => handleAddTask(data, selectedTaskIds[0])}
                    trigger={
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    }
                  />
                  <Button
                    onClick={() => selectedTaskIds.length === 1 && toggleMilestone(selectedTaskIds[0])}
                    disabled={selectedTaskIds.length !== 1}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Diamond className="w-4 h-4 mr-2" />
                    Mark Milestone
                  </Button>
                  <Button
                    onClick={() => selectedTaskIds.length === 1 && promoteTask(selectedTaskIds[0])}
                    disabled={selectedTaskIds.length !== 1}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Promote
                  </Button>
                  <Button
                    onClick={() => selectedTaskIds.length === 1 && demoteTask(selectedTaskIds[0])}
                    disabled={selectedTaskIds.length !== 1}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Demote
                  </Button>
                  <Button
                    onClick={handleDeleteTasks}
                    disabled={selectedTaskIds.length === 0}
                    variant="outline"
                    className="border-gray-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                    Delete
                  </Button>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-6">
                <TaskTable
                                    tasks={tasks}
                                    selectedTaskIds={selectedTaskIds}
                                    onTaskSelect={(taskId) => setSelectedTaskIds([taskId])}
                                    onTaskSelectMultiple={setSelectedTaskIds}
                                    onTaskNameEdit={handleTaskNameEdit}
                                    onPredecessorEdit={handlePredecessorEdit} onProgressUpdate={function (taskId: string, progress: number, actualStartDate?: Date, actualEndDate?: Date): void {
                                        throw new Error('Function not implemented.');
                                    } }                />
  
                <GanttChart
                  tasks={tasks}
                  selectedTaskId={selectedTaskIds[0]}
                  onTaskSelect={(taskId) => setSelectedTaskIds([taskId])}
                />
              </div>
  
              {showDeleteModal && (
                <DeleteTaskModal
                  tasks={tasks}
                  tasksToDelete={selectedTaskIds}
                  dependentTasks={findDependentTasks(selectedTaskIds, tasks)}
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={() => {
                    setTasks(prevTasks => {
                      const newTasks = prevTasks.filter(task => !selectedTaskIds.includes(task.id));
                      return generateWBS(newTasks);
                    });
                    setSelectedTaskIds([]);
                    setShowDeleteModal(false);
                  }}
                  onUpdateDependency={handleUpdateDependency}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }