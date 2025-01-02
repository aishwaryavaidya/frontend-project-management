"use client";
import { initialPhases } from '@/data/initial-project-data';
import { employees } from '@/data/employee';
import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Plus, Trash2, Download, Upload, Undo2, Redo2, Edit2 } from 'lucide-react';
import { calculateMilestoneProgress, calculateDuration } from '@/lib/utils';
import { TaskRow } from './task-row';
import { AddMilestoneDialog } from './add-milestone-dialog';
import { useHistory } from '@/hooks/use-history';
import {Phase, Milestone, Task, Assignment} from '@/types/types';
import * as XLSX from 'xlsx';
import { types } from 'node:util';
import { UserPlus } from 'lucide-react';
import { BulkAssignDialog } from './bulk-assign-dialog';
import { generateRandomColor } from '@/lib/utils';
import { AddTaskDialog } from './add-task-dialog';




// ... (interfaces remain the same, add actualDuration to Task and Milestone)

export function SupersonicTable() {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const { canUndo, canRedo, undo, redo, addToHistory } = useHistory(phases, setPhases);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [phaseColors] = useState(() => 
    Object.fromEntries(initialPhases.map(phase => [phase.id, generateRandomColor()]))
  );


  const handleAddTask = (milestoneId: number, taskData: Partial<Task>) => {
    const newPhases = phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const newTask: Task = {
            ...taskData,
            id: Date.now(),
            index: `${milestone.index}.${milestone.tasks.length + 1}`,
          } as Task;
          return {
            ...milestone,
            tasks: [...milestone.tasks, newTask]
          };
        }
        return milestone;
      })
    }));
    setPhases(newPhases);
    addToHistory(newPhases);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        // Process the workbook data and update the state
        // This is a simplified example - you'll need to adapt it to your data structure
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        console.log('Imported data:', data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleDeleteMilestone = (phaseId: number, milestoneId: number) => {
    const newPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          milestones: phase.milestones.filter(m => m.id !== milestoneId)
        };
      }
      return phase;
    });
    setPhases(newPhases);
    addToHistory(newPhases);
  };


  const handleTaskAssign = (taskId: number, assignments: Omit<Assignment, 'id'>[]) => {
    const newPhases = phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              assignments: [
                ...task.assignments,
                ...assignments.map((assignment, index) => ({
                  ...assignment,
                  id: Date.now() + index
                }))
              ]
            };
          }
          return task;
        })
      }))
    }));

    setPhases(newPhases);
    addToHistory(newPhases);
  };

  const handleTaskSelection = (task: Task, isSelected: boolean) => {
    setSelectedTasks(prev => 
      isSelected 
        ? [...prev, task]
        : prev.filter(t => t.id !== task.id)
    );
  };

  const handleBulkAssign = (taskIds: number[], newAssignments: Omit<Assignment, 'id'>[]) => {
    const newPhases = phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => {
          if (taskIds.includes(task.id)) {
            return {
              ...task,
              assignments: [
                ...task.assignments,
                ...newAssignments.map((assignment, index) => ({
                  ...assignment,
                  id: Date.now() + index
                }))
              ]
            };
          }
          return task;
        })
      }))
    }));

    setPhases(newPhases);
    addToHistory(newPhases);
    setSelectedTasks([]);
  };

  const toggleMilestone = (phaseId: number, milestoneId: number) => {
    setPhases(prevPhases => {
      const newPhases = prevPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            milestones: phase.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return { ...milestone, isExpanded: !milestone.isExpanded };
              }
              return milestone;
            }),
          };
        }
        return phase;
      });
      return newPhases;
    });
  };

  const handleAddMilestone = useCallback((phaseId: number, milestoneData: Partial<Milestone>) => {
    setPhases(prevPhases => {
      const newPhases = prevPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            milestones: [...phase.milestones, {
              ...milestoneData,
              id: Date.now(),
              index: phase.milestones.length + 1,
              tasks: [],
            } as Milestone],
          };
        }
        return phase;
      });
      addToHistory(newPhases);
      return newPhases;
    });
  }, [addToHistory]);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
  
    // Convert phases and milestones to worksheet data
    phases.forEach(phase => {
      phase.milestones.forEach(milestone => {
        const sheetData = milestone.tasks.map(task => ({
          Index: task.index,
          TaskName: task.name,
          StartDate: task.startDate.toLocaleDateString(),
          EndDate: task.endDate.toLocaleDateString(),
          Duration: calculateDuration(task.startDate, task.endDate),
          ActualStart: task.actualStart?.toLocaleDateString() || '-',
          ActualEnd: task.actualEnd?.toLocaleDateString() || '-',
          ActualDuration: task.actualStart && task.actualEnd
            ? calculateDuration(task.actualStart, task.actualEnd)
            : '-',
          Progress: `${task.progress}%`,
          ClientSPOC: task.clientSpoc,
          APSPOC: task.apSpoc,
        }));
  
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `${phase.name} - ${milestone.name}`);
      });
    });

    

    
  
    // Export workbook
    XLSX.writeFile(workbook, 'ProjectPlan.xlsx');
  };
  

  // ... (other functions remain the same)

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Project Plan</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => setBulkAssignOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Bulk Assign
          </Button>

          <AddMilestoneDialog phases={phases} onAdd={handleAddMilestone} />
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Import
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
        </div>
      </div>
  
      <div className="grid grid-cols-[50px,1fr] gap-4">
        {phases.map(phase => (
          <React.Fragment key={phase.id}>
            <div className="bg-blue-100 p-1 rounded-lg h-full flex items-center justify-center" style={{ backgroundColor: phaseColors[phase.id] }}>
              <div className="font-semibold transform -rotate-90 whitespace-nowrap text-gray-700 ">
                {phase.name}
              </div>
            </div>
            <div className="space-y-4">
              {phase.milestones.map(milestone => (
                <div key={milestone.id} className="bg-card rounded-lg shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleMilestone(phase.id, milestone.id)}
                          className="p-1 hover:bg-accent rounded"
                        >
                          {milestone.isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-medium">{milestone.name}</span>
                      </div>
                      {/* Milestone actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMilestoneId(milestone.id);
                            setAddTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
  
                  {milestone.isExpanded && milestone.tasks && milestone.tasks.length > 0 && (
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Index</TableHead>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Actual Start</TableHead>
                            <TableHead>Actual End</TableHead>
                            <TableHead>Actual Duration</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Client SPOC</TableHead>
                            <TableHead>AP SPOC</TableHead>
                            <TableHead>PM</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {milestone.tasks.map(task => (
                            <TaskRow 
                              key={task.id}
                              task={task}
                              onUpdate={(updatedTask) => {
                                const newPhases = phases.map(phase => ({
                                  ...phase,
                                  milestones: phase.milestones.map(m => ({
                                    ...m,
                                    tasks: m.tasks.map(t =>
                                      t.id === updatedTask.id ? { ...t, ...updatedTask } : t
                                    ),
                                  })),
                                }));
                                setPhases(newPhases);
                                addToHistory(newPhases);
                              }}
                              onDelete={(taskId) => {
                                const newPhases = phases.map(phase => ({
                                  ...phase,
                                  milestones: phase.milestones.map(m => ({
                                    ...m,
                                    tasks: m.tasks.filter(t => t.id !== taskId),
                                  })),
                                }));
                                setPhases(newPhases);
                                addToHistory(newPhases);
                              }}
                              onAssign={(taskId, assignments) => handleTaskAssign(taskId, assignments)}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>

      <AddTaskDialog
        milestoneId={selectedMilestoneId!}
        open={addTaskDialogOpen}
        onOpenChange={setAddTaskDialogOpen}
        onAdd={(taskData) => {
          if (selectedMilestoneId) {
            handleAddTask(selectedMilestoneId, taskData);
          }
        }}
      />

      <BulkAssignDialog
        selectedTasks={selectedTasks}
        open={bulkAssignOpen}
        onOpenChange={setBulkAssignOpen}
        onAssign={handleBulkAssign}
      />

    </div>
  );
  
}