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
import Link from 'next/link' 
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Plus, Trash2, Download, Upload, Undo2, Redo2, Edit2, Minus } from 'lucide-react';
import { calculateMilestoneProgress, calculateDuration } from '@/lib/utils/utils';
import { TaskRow } from './task-row';
import { AddMilestoneDialog } from './add-milestone-dialog';
import { useHistory } from '@/hooks/use-history';
import {Phase, Milestone, Task, Assignment} from '@/types/types';
import * as XLSX from 'xlsx';
import { types } from 'node:util';
import { UserPlus } from 'lucide-react';
import { generateRandomColor } from '@/lib/utils/utils';
import { AddTaskDialog } from './add-task-dialog';
import { BulkOperationsDialog } from './bulk-operations/bulk-operations-dialog';
// import { RaidDialog } from '../../project/RAID/raid-dialog';



// ... (interfaces remain the same, add actualDuration to Task and Milestone)

export function SupersonicTable() {

  const [raidDialogOpen, setRaidDialogOpen] = useState(false); ///raid

  const [phases, setPhases] = useState<Phase[]>(initialPhases);

  const { canUndo, canRedo, undo, redo, addToHistory } = useHistory(phases, setPhases);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([]);
  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };





  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  
  
  const [phaseColors] = useState(() => 
    Object.fromEntries(initialPhases.map(phase => [phase.id, generateRandomColor()]))
  );
  const toggleCheckboxes = () => setShowCheckboxes(prev => !prev);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedTaskIds([]); // Clear selections when exiting selection mode
    }
  };

  const handleTaskSelection = (taskId: number) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };



  const handleBulkUpdate = (updates: Partial<Task>[]) => {
    const newPhases = phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => {
          const update = updates.find(u => u.id === task.id);
          return update ? { ...task, ...update } : task;
        })
      }))
    }));
    setPhases(newPhases);
    addToHistory(newPhases);
    setSelectedTaskIds([]);
    setBulkAssignOpen(false);
  };
  
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
              assignments: assignments.map((assignment, index) => ({
                  ...assignment,
                  id: Date.now() + index
                }))
            };
          }
          return task;
        })
      }))
    }));

    setPhases(newPhases);
    addToHistory(newPhases);
  };


  const handleBulkAssign = (taskIds: number[],newAssignments: Omit<Assignment, 'id'>[]) => {
    const updatedPhases = phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => {
          if (selectedTaskIds.includes(task.id)) {
            return {
              ...task,
              assignments: [
                ...task.assignments,
                ...newAssignments.map((assignment, index) => ({
                  ...assignment,
                  id: Date.now() + index,
                })),
              ],
            };
          }
          return task;
        }),
      })),
    }));
    setPhases(updatedPhases);
    setSelectedTaskIds([]);
    setBulkAssignOpen(false);
    setShowCheckboxes(false);
  };

  const toggleMilestone = (phaseId: number, milestoneId: number) => {
    setExpandedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
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
// ********************************************************
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold mb-25">Project Supersonic</h1>
        <div className="space-x-2 mt-20">
          <Button 
            variant={"outline"} 
            className="px-2 bg-red-500 text-white font-semibold"
            size="sm">
              <Link href="/../../dashboard/project/RAID">RAID Log</Link>
            </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="w-3 h-3" />
          </Button>
  
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="w-3 h-3" />
          </Button>
  
          <Button
            variant={isSelectionMode ? "secondary" : "outline"}
            onClick={toggleSelectionMode}
          >
            {isSelectionMode ? "Cancel Selection" : "Select Tasks"}
          </Button>
  
          {isSelectionMode && selectedTaskIds.length > 0 && (
            <Button
              onClick={() => {
                setBulkOperationsOpen(true); // Open bulk assign dialog
                setIsSelectionMode(false); // Exit selection mode
              }}
            >
              <Edit2 className="w-3 h-3 mr-2" />
              Modify Selected ({selectedTaskIds.length})
            </Button>
          )}
  
          <AddMilestoneDialog phases={phases} onAdd={handleAddMilestone} />
          <Button onClick={exportToExcel}>
            <Download className="w-3 h-3 mr-2" />
            Export
          </Button>
          <Button>
            <Upload className="w-3 h-3 mr-2" />
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

  
      {/* Table */}
      <div className="border rounded-lg">
        <table>
          <thead>
            <tr className="bg-muted/50 text-sm font-[300]">
              {isSelectionMode && <th className="w-8"></th>}
              <th className="w-5"></th>
              <th className="w-5">Index</th>
              <th className="min-w-[200px]">Name</th>
              <th className="w-32">Baseline Start</th>
              <th className="w-32">Baseline End</th>
              <th className="w-">Duration</th>
              <th className="w-32">Actual Start</th>
              <th className="w-32">Actual End</th>
              <th className="w-24">Actual Duration</th>
              <th className="w-24">Progress</th>
              <th className="w-32">Client SPOC</th>
              <th className="w-32">AP SPOC</th>
              <th className="w-32">PM</th>
              <th className="w-40">Assigned To</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {phases.map(phase =>
              phase.milestones.map(milestone => (
                <React.Fragment key={milestone.id}>
                  <tr className="bg-white h-8">
                    {isSelectionMode && <td></td>}
                    <td>
                    <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMilestone(phase.id, milestone.id)}
                          className="p-0 h-8 w-8"
                        >
                          <Minus className="bg-white border border-black" />
                        </Button>
                    </td>

                    <td className="text-sm font-semibold">{`M-${milestone.id}`}</td>
                    <td className="text-sm truncate font-semibold">{milestone.name}</td>
                    {Array(10).fill(null).map((_, i) => (
                      <td key={i}></td>
                    ))}
                    <td>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setSelectedMilestoneId(milestone.id);
                            setAddTaskDialogOpen(true);}}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-0" />
                          Task
                        </Button>
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => handleDeleteMilestone(phase.id, milestone.id)}
                          className="h-6 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedMilestones.includes(milestone.id) &&
                    milestone.tasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedTaskIds.includes(task.id)}
                        onSelect={() => handleTaskSelection(task.id)}
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
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
  
      {/* Dialogs */}
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
      <BulkOperationsDialog
        selectedTasks={phases
          .flatMap(p => p.milestones)
          .flatMap(m => m.tasks)
          .filter(t => selectedTaskIds.includes(t.id))}
        open={bulkOperationsOpen}
        onOpenChange={setBulkOperationsOpen}
        onBulkUpdate={handleBulkUpdate}
      />
    </div>
  );

  
}