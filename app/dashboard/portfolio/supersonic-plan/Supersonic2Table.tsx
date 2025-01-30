"use client";
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { initialPhases } from '@/data/initial-project-data';
import { employees } from '@/data/employee';
import Link from 'next/link';
import { TaskRow } from './task-row';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2, Download, Upload, Undo2, Redo2, Edit2, UserPlus } from 'lucide-react';
import { calculateDuration } from '@/lib/utils/utils';
import { AddMilestoneDialog } from './add-milestone-dialog';
import { useHistory } from '@/hooks/use-history';
import { Phase, Milestone, Task, Assignment } from '@/types/types';
import * as XLSX from 'xlsx';
import { generateRandomColor } from '@/lib/utils/utils';
import { AddTaskDialog } from './add-task-dialog';
import { BulkOperationsDialog } from './bulk-operations/bulk-operations-dialog';
import { AssignTaskDialog } from './assign-task-dialog';
import { useTheme } from "next-themes"

export function Supersonic2Table() {
  const { theme } = useTheme();
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const { canUndo, canRedo, undo, redo, addToHistory } = useHistory(phases, setPhases);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([]);
  const [assignTaskDialogOpen, setAssignTaskDialogOpen] = useState(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] = useState<Task | null>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  // Custom cell renderer for the expand/collapse button
  const ExpandButtonRenderer = (props: any) => {
    if (props.data.type !== 'milestone') return null;
    
    const isExpanded = expandedMilestones.includes(props.data.id);
    const Icon = isExpanded ? ChevronDown : ChevronRight;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleMilestone(props.data.phaseId, props.data.id)}
        className="p-1 h-6 w-6"
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  };

  // Custom cell renderer for actions
  const ActionsRenderer = (props: any) => {
    if (props.data.type === 'task') {
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTaskForAssignment(props.data);
              setAssignTaskDialogOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteTask(props.data.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    if (props.data.type === 'milestone') {
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedMilestoneId(props.data.id);
              setAddTaskDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Task
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteMilestone(props.data.phaseId, props.data.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  // Custom cell renderer for assignments
  const AssignmentsRenderer = (props: any) => {
    if (!props.value || !Array.isArray(props.value)) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {props.value.map((assignment: Assignment, index: number) => (
          <div
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
          >
            {assignment.employeeName} ({assignment.role})
          </div>
        ))}
      </div>
    );
  };

  const columnDefs = useMemo(() => [
    {
      headerName: '',
      field: 'checkbox',
      width: 50,
      headerCheckboxSelection: true,
      checkboxSelection: (params: any) => params.data.type === 'task',
      hide: !isSelectionMode,
    },
    {
      headerName: '',
      field: 'expand',
      width: 50,
      cellRenderer: ExpandButtonRenderer,
    },
    { headerName: 'Index', field: 'index', width: 100 },
    { headerName: 'Name', field: 'name', width: 200, flex: 1 },
    { 
      headerName: 'Baseline Start',
      field: 'startDate',
      width: 130,
      valueFormatter: (params: any) => params.value?.toLocaleDateString()
    },
    { 
      headerName: 'Baseline End',
      field: 'endDate',
      width: 130,
      valueFormatter: (params: any) => params.value?.toLocaleDateString()
    },
    { 
      headerName: 'Duration',
      field: 'duration',
      width: 100,
      valueGetter: (params: any) => {
        if (params.data.startDate && params.data.endDate) {
          return calculateDuration(params.data.startDate, params.data.endDate);
        }
        return '';
      },
      valueFormatter: (params: any) => params.value ? `${params.value} days` : ''
    },
    { 
      headerName: 'Actual Start',
      field: 'actualStart',
      width: 130,
      valueFormatter: (params: any) => params.value?.toLocaleDateString() || '-'
    },
    { 
      headerName: 'Actual End',
      field: 'actualEnd',
      width: 130,
      valueFormatter: (params: any) => params.value?.toLocaleDateString() || '-'
    },
    { 
      headerName: 'Progress',
      field: 'progress',
      width: 100,
      valueFormatter: (params: any) => `${params.value || 0}%`
    },
    { headerName: 'Client SPOC', field: 'clientSpoc', width: 130 },
    { headerName: 'AP SPOC', field: 'apSpoc', width: 130 },
    { headerName: 'PM', field: 'projectManager', width: 130 },
    { 
      headerName: 'Assigned To',
      field: 'assignments',
      width: 200,
      cellRenderer: AssignmentsRenderer,
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 150,
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
    }
  ], [isSelectionMode, expandedMilestones]);

  // const defaultColDef = useMemo(() => ({
  //   sortable: true,
  //   resizable: true,
  //   filter: true,
  // }), []);

  // const getRowData = useCallback(() => {
  //   const rows: any[] = [];
  //   phases.forEach(phase => {
  //     phase.milestones.forEach(milestone => {
  //       // Add milestone row
  //       rows.push({
  //         id: milestone.id,
  //         phaseId: phase.id,
  //         type: 'milestone',
  //         index: `M${milestone.index}`,
  //         name: milestone.name,
  //         startDate: milestone.startDate,
  //         endDate: milestone.endDate,
  //         progress: milestone.progress,
  //         clientSpoc: milestone.clientSpoc,
  //         apSpoc: milestone.apSpoc,
  //       });

  //       // Add task rows if milestone is expanded
  //       if (expandedMilestones.includes(milestone.id)) {
  //         milestone.tasks.forEach(task => {
  //           rows.push({
  //             ...task,
  //             type: 'task',
  //             milestoneId: milestone.id,
  //           });
  //         });
  //       }
  //     });
  //   });
  //   return rows;
  // }, [phases, expandedMilestones]);

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
  }, []);

  // const onSelectionChanged = () => {
  //   if (!gridApi) return;
  //   const selectedRows = gridApi.getSelectedRows();
  //   const selectedIds = selectedRows
  //     .filter((row: any) => row.type === 'task')
  //     .map((row: any) => row.id);
  //   setSelectedTaskIds(selectedIds);
  // };

  const toggleMilestone = useCallback((phaseId: number, milestoneId: number) => {
    setExpandedMilestones(prev => 
      prev.includes(milestoneId)
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: number) => {
    const newPhases = phases.map(phase => ({
      ...phase,
      milestones: phase.milestones.map(m => ({
        ...m,
        tasks: m.tasks.filter(t => t.id !== taskId)
      }))
    }));
    setPhases(newPhases);
    addToHistory(newPhases);
  }, []);

  const handleDeleteMilestone = useCallback((phaseId: number, milestoneId: number) => {
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
  }, []);

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
    setBulkOperationsOpen(false);
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
          Progress: `${task.progress}%`,
          ClientSPOC: task.clientSpoc,
          APSPOC: task.apSpoc,
          Assignments: task.assignments.map(a => `${a.employeeName} (${a.role})`).join(', ')
        }));
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, `${phase.name} - ${milestone.name}`);
      });
    });
    XLSX.writeFile(workbook, 'ProjectPlan.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        console.log('Imported data:', data);
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Project Supersonic</h1>
        <div className="space-x-2">
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
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) {
                setSelectedTaskIds([]);
              }
            }}
          >
            {isSelectionMode ? "Cancel Selection" : "Select Tasks"}
          </Button>

          {isSelectionMode && selectedTaskIds.length > 0 && (
            <Button
              onClick={() => {
                setBulkOperationsOpen(true);
                setIsSelectionMode(false);
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

      <div 
        className={theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'} 
        style={{ height: 'calc(100vh - 200px)', width: '100%' }}
      >
        <AgGridReact
        rowData={phases.flatMap((phase) =>
          phase.milestones.flatMap((milestone) => [
            { ...milestone, type: 'milestone' },
            ...milestone.tasks.map((task) => ({ ...task, type: 'task', phaseId: phase.id })),
          ])
        )}
        columnDefs={columnDefs}
        rowSelection="multiple"
        onGridReady={onGridReady}
        frameworkComponents={{ TaskRow: TaskRow }}
        defaultColDef={{ resizable: true, sortable: true, filter: true }}
        groupUseEntireRow={true}
      />
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

      <BulkOperationsDialog
        selectedTasks={phases
          .flatMap(p => p.milestones)
          .flatMap(m => m.tasks)
          .filter(t => selectedTaskIds.includes(t.id))}
        open={bulkOperationsOpen}
        onOpenChange={setBulkOperationsOpen}
        onBulkUpdate={handleBulkUpdate}
      />

      {selectedTaskForAssignment && (
        <AssignTaskDialog
          task={selectedTaskForAssignment}
          open={assignTaskDialogOpen}
          onOpenChange={setAssignTaskDialogOpen}
          onAssign={(assignments) => {
            handleTaskAssign(selectedTaskForAssignment.id, assignments);
            setSelectedTaskForAssignment(null);
          }}
        />
      )}
    </div>
  );
}