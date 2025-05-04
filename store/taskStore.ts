import { create } from 'zustand';
import { Task, TaskUpdate } from '@/app/dashboard/project-plan/types/task';
import { addDays } from 'date-fns';
import { 
  updateWbsNumbers,
  updateTaskLevelsForIndent,
  updateTaskLevelsForOutdent
} from '@/lib/taskUtils';
import { calculateDuration, calculateEndDate } from '@/lib/dateUtils';

interface TaskState {
  tasks: Task[];
  selectedIds: Set<string>;
  isSelecting: boolean;
  undoStack: Task[][];
  redoStack: Task[][];
  activeTaskId: string | null;
  
  // Methods
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  addTaskAfter: (afterTaskId: string) => void;
  updateTask: (id: string, update: TaskUpdate) => void;
  deleteTask: (id: string) => void;
  bulkDeleteTasks: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  setSelecting: (isSelecting: boolean) => void;
  clearSelection: () => void;
  setActiveTask: (id: string | null) => void;
  toggleGoLive: (id: string) => void;
  toggleFinancialMilestone: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  assignStage: (taskId: string, stageId: string) => void;
  assignProduct: (taskId: string, productId: string) => void;
  undo: () => void;
  redo: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedIds: new Set(),
  isSelecting: false,
  undoStack: [],
  redoStack: [],
  activeTaskId: null,

  setTasks: (tasks) => {
    // Initialize default values for new fields
    const updatedTasks = tasks.map(task => ({
      ...task,
      progress: task.progress ?? (task.actualEndDate ? 100 : task.actualStartDate ? 50 : 0),
      view: task.view ?? 'External',
      actualDuration: task.actualDuration ?? (
        task.actualStartDate && task.actualEndDate 
          ? calculateDuration(task.actualStartDate, task.actualEndDate)
          : null
      ),
      predecessorIds: task.predecessorIds === '' ? '0' : task.predecessorIds
    }));
    
    set({ tasks: updateWbsNumbers(updatedTasks) });
  },

  addTask: (task) => {
    const { tasks, undoStack } = get();
    const newTasks = [...tasks, { 
      ...task, 
      goLive: false, 
      financialMilestone: false,
      isParent: false,
      predecessorIds: task.predecessorIds || '0' // Default to 0 if no predecessors
    }];
    
    set({
      tasks: updateWbsNumbers(newTasks),
      undoStack: [...undoStack, tasks],
      redoStack: [],
      activeTaskId: task.id
    });
  },

  addTaskAfter: (afterTaskId) => {
    const { tasks, undoStack } = get();
    const afterTaskIndex = tasks.findIndex(t => t.id === afterTaskId);
    
    if (afterTaskIndex === -1) return;
    
    const afterTask = tasks[afterTaskIndex];
    const newSiNo = afterTask.siNo + 1;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      siNo: newSiNo,
      wbsNo: String(newSiNo),
      taskName: `Task ${newSiNo}`,
      predecessorIds: afterTask.siNo.toString(),
      level: afterTask.level,
      goLive: false,
      financialMilestone: false,
      startDate: new Date(),
      endDate: addDays(new Date(), 5),
      duration: 5,
      actualStartDate: null,
      actualEndDate: null,
      actualDuration: null,
      progress: 0,
      view: 'External',
      remarks: [],
      isParent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      stageId: afterTask.stageId,
      productId: undefined,
      isDeleted: false
    };
    
    // Update SI numbers for all tasks after the insertion point
    const updatedTasksAfter = tasks.slice(afterTaskIndex + 1).map(task => ({
      ...task,
      siNo: task.siNo + 1,
      // Update predecessorIds to reflect new SI numbers
      predecessorIds: task.predecessorIds 
        ? task.predecessorIds === '0' 
          ? '0' 
          : task.predecessorIds
              .split(',')
              .map(id => {
                const predSiNo = parseInt(id.trim());
                return predSiNo >= newSiNo ? String(predSiNo + 1) : id;
              })
              .join(',')
        : '0'
    }));
    
    // Combine all tasks with the new one inserted
    const newTasks = [
      ...tasks.slice(0, afterTaskIndex + 1),
      newTask,
      ...updatedTasksAfter
    ];
    
    set({
      tasks: updateWbsNumbers(newTasks),
      undoStack: [...undoStack, tasks],
      redoStack: [],
      activeTaskId: newTask.id // Set the new task as active
    });
  },

  updateTask: (id, update) => {
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const updatedTask = { ...tasks[taskIndex], ...update, updatedAt: new Date() };
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    
    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  deleteTask: (id) => {
    const { tasks, undoStack, activeTaskId } = get();
    const newTasks = tasks.map(task => 
      task.id === id ? { ...task, isDeleted: true } : task
    );
    
    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: [],
      activeTaskId: activeTaskId === id ? null : activeTaskId
    });
  },

  bulkDeleteTasks: (ids) => {
    const { tasks, undoStack, activeTaskId } = get();
    const newTasks = tasks.map(task => 
      ids.includes(task.id) ? { ...task, isDeleted: true } : task
    );
    
    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: [],
      activeTaskId: ids.includes(activeTaskId || '') ? null : activeTaskId
    });
  },

  toggleSelection: (id) => {
    set(state => {
      const newSelection = new Set(state.selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedIds: newSelection };
    });
  },

  setSelecting: (isSelecting) => {
    set({ isSelecting });
  },

  clearSelection: () => {
    set({ selectedIds: new Set() });
  },

  setActiveTask: (id) => {
    set({ activeTaskId: id });
  },

  toggleGoLive: (id) => {
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    newTasks[taskIndex] = { 
      ...tasks[taskIndex], 
      goLive: !tasks[taskIndex].goLive,
      updatedAt: new Date()
    };

    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  toggleFinancialMilestone: (id) => {
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    newTasks[taskIndex] = { 
      ...tasks[taskIndex], 
      financialMilestone: !tasks[taskIndex].financialMilestone,
      updatedAt: new Date()
    };

    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  moveUp: (id) => {
    // Simple implementation - more complex logic would be in the actual code
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex <= 0) return; // Already at top
    
    const newTasks = [...tasks];
    const temp = newTasks[taskIndex];
    newTasks[taskIndex] = newTasks[taskIndex - 1];
    newTasks[taskIndex - 1] = temp;
    
    // Swap SI numbers
    const siNo = newTasks[taskIndex].siNo;
    newTasks[taskIndex].siNo = newTasks[taskIndex - 1].siNo;
    newTasks[taskIndex - 1].siNo = siNo;
    
    set({
      tasks: updateWbsNumbers(newTasks),
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  moveDown: (id) => {
    // Simple implementation - more complex logic would be in the actual code
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1 || taskIndex >= tasks.length - 1) return; // Already at bottom
    
    const newTasks = [...tasks];
    const temp = newTasks[taskIndex];
    newTasks[taskIndex] = newTasks[taskIndex + 1];
    newTasks[taskIndex + 1] = temp;
    
    // Swap SI numbers
    const siNo = newTasks[taskIndex].siNo;
    newTasks[taskIndex].siNo = newTasks[taskIndex + 1].siNo;
    newTasks[taskIndex + 1].siNo = siNo;
    
    set({
      tasks: updateWbsNumbers(newTasks),
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  assignStage: (taskId, stageId) => {
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Only level 0 tasks can have a stage assigned
    if (task.level !== 0) return;
    
    // Find all child tasks of this task
    const childTasks = tasks.filter(t => 
      !t.isDeleted && 
      t.level > task.level && 
      tasks.indexOf(t) > taskIndex && 
      !tasks.some(intermediate => 
        intermediate.level <= task.level && 
        tasks.indexOf(intermediate) > taskIndex && 
        tasks.indexOf(intermediate) < tasks.indexOf(t)
      )
    );
    
    const newTasks = [...tasks];
    
    // Update the parent task
    newTasks[taskIndex] = { ...task, stageId, updatedAt: new Date() };
    
    // Update all child tasks
    childTasks.forEach(childTask => {
      const childIndex = newTasks.findIndex(t => t.id === childTask.id);
      if (childIndex !== -1) {
        newTasks[childIndex] = { ...childTask, stageId, updatedAt: new Date() };
      }
    });
    
    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  assignProduct: (taskId, productId) => {
    const { tasks, undoStack } = get();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Don't assign product to parent tasks
    if (task.isParent) return;
    
    const newTasks = [...tasks];
    newTasks[taskIndex] = { ...task, productId, updatedAt: new Date() };
    
    set({
      tasks: newTasks,
      undoStack: [...undoStack, tasks],
      redoStack: []
    });
  },

  undo: () => {
    const { undoStack, redoStack, tasks } = get();
    if (undoStack.length === 0) return;
    
    const prevState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    set({
      tasks: prevState,
      undoStack: newUndoStack,
      redoStack: [tasks, ...redoStack]
    });
  },

  redo: () => {
    const { redoStack, undoStack, tasks } = get();
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    
    set({
      tasks: nextState,
      redoStack: newRedoStack,
      undoStack: [...undoStack, tasks]
    });
  }
})); 