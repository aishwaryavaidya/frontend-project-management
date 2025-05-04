import { create } from 'zustand';
import { Task } from '../types/task';

interface TaskState {
  // Task data
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  addTaskAfter: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  bulkDeleteTasks: (taskIds: string[]) => void;
  
  // Selection state
  isSelecting: boolean;
  setSelecting: (isSelecting: boolean) => void;
  selectedIds: Set<string>;
  toggleSelection: (taskId: string) => void;
  clearSelection: () => void;
  
  // Active task
  activeTaskId: string | null;
  setActiveTask: (taskId: string | null) => void;
  
  // Task actions
  toggleGoLive: (taskId: string) => void;
  toggleFinancialMilestone: (taskId: string) => void;
  moveUp: (taskId: string) => void;
  moveDown: (taskId: string) => void;
  assignStage: (taskId: string, stageId: string) => void;
  assignProduct: (taskId: string, productId: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  history: Task[][];
  currentHistoryIndex: number;
}

const useTaskStore = create<TaskState>((set) => {
  // Helper function to save a snapshot of tasks to history
  const saveHistory = (tasks: Task[], state: any) => {
    const newHistory = [...state.history.slice(0, state.currentHistoryIndex + 1), JSON.parse(JSON.stringify(tasks))];
    return {
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1
    };
  };

  return {
    // Task data
    tasks: [],
    history: [[]],
    currentHistoryIndex: 0,
    
    setTasks: (tasks) => set((state) => ({
      tasks,
      ...saveHistory(tasks, state)
    })),
    
    addTask: (task) => set((state) => {
      const newTasks = [...state.tasks, task];
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    addTaskAfter: (taskId) => set((state) => {
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return state;
      
      const task = state.tasks[taskIndex];
      const siNo = task.siNo + 1;
      
      // Adjust siNo of all tasks after the current one
      const tasksToAdjust = state.tasks.filter(t => t.siNo >= siNo);
      tasksToAdjust.forEach(t => t.siNo += 1);
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        siNo,
        wbsNo: String(siNo),
        taskName: `Task ${siNo}`,
        predecessorIds: String(task.siNo),
        level: task.level,
        goLive: false,
        financialMilestone: false,
        startDate: task.endDate || new Date(),
        endDate: null,
        duration: 5,
        actualStartDate: null,
        actualEndDate: null,
        actualDuration: null,
        progress: 0,
        view: 'External',
        remarks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const newTasks = [
        ...state.tasks.slice(0, taskIndex + 1),
        newTask,
        ...state.tasks.slice(taskIndex + 1)
      ];
      
      return {
        tasks: newTasks,
        activeTaskId: newTask.id,
        ...saveHistory(newTasks, state)
      };
    }),
    
    updateTask: (taskId, updates) => set((state) => {
      const newTasks = state.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
      );
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    deleteTask: (taskId) => set((state) => {
      const newTasks = state.tasks.map(task => 
        task.id === taskId ? { ...task, isDeleted: true } : task
      );
      return {
        tasks: newTasks,
        activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
        selectedIds: new Set([...state.selectedIds].filter(id => id !== taskId)),
        ...saveHistory(newTasks, state)
      };
    }),
    
    bulkDeleteTasks: (taskIds) => set((state) => {
      const taskIdSet = new Set(taskIds);
      const newTasks = state.tasks.map(task => 
        taskIdSet.has(task.id) ? { ...task, isDeleted: true } : task
      );
      return {
        tasks: newTasks,
        activeTaskId: state.activeTaskId && taskIdSet.has(state.activeTaskId) ? null : state.activeTaskId,
        selectedIds: new Set(),
        isSelecting: false,
        ...saveHistory(newTasks, state)
      };
    }),
    
    // Selection state
    isSelecting: false,
    setSelecting: (isSelecting) => set({ isSelecting, selectedIds: isSelecting ? new Set() : new Set() }),
    selectedIds: new Set(),
    toggleSelection: (taskId) => set((state) => {
      const newSelectedIds = new Set(state.selectedIds);
      if (newSelectedIds.has(taskId)) {
        newSelectedIds.delete(taskId);
      } else {
        newSelectedIds.add(taskId);
      }
      return { selectedIds: newSelectedIds };
    }),
    clearSelection: () => set({ selectedIds: new Set() }),
    
    // Active task
    activeTaskId: null,
    setActiveTask: (taskId) => set({ activeTaskId: taskId }),
    
    // Task actions
    toggleGoLive: (taskId) => set((state) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;
      
      const newTasks = state.tasks.map(t => 
        t.id === taskId ? { ...t, goLive: !t.goLive } : t
      );
      
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    toggleFinancialMilestone: (taskId) => set((state) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;
      
      const newTasks = state.tasks.map(t => 
        t.id === taskId ? { ...t, financialMilestone: !t.financialMilestone } : t
      );
      
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    moveUp: (taskId) => set((state) => {
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex <= 0 || state.tasks[taskIndex].isDeleted) return state;
      
      const currentSiNo = state.tasks[taskIndex].siNo;
      const prevSiNo = state.tasks[taskIndex - 1].siNo;
      
      const newTasks = [...state.tasks];
      newTasks[taskIndex] = { ...newTasks[taskIndex], siNo: prevSiNo };
      newTasks[taskIndex - 1] = { ...newTasks[taskIndex - 1], siNo: currentSiNo };
      
      // Sort tasks by siNo
      newTasks.sort((a, b) => a.siNo - b.siNo);
      
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    moveDown: (taskId) => set((state) => {
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1 || taskIndex >= state.tasks.length - 1 || state.tasks[taskIndex].isDeleted) return state;
      
      const currentSiNo = state.tasks[taskIndex].siNo;
      const nextSiNo = state.tasks[taskIndex + 1].siNo;
      
      const newTasks = [...state.tasks];
      newTasks[taskIndex] = { ...newTasks[taskIndex], siNo: nextSiNo };
      newTasks[taskIndex + 1] = { ...newTasks[taskIndex + 1], siNo: currentSiNo };
      
      // Sort tasks by siNo
      newTasks.sort((a, b) => a.siNo - b.siNo);
      
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    assignStage: (taskId, stageId) => set((state) => {
      const newTasks = state.tasks.map(task => 
        task.id === taskId ? { ...task, stageId } : task
      );
      
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    assignProduct: (taskId, productId) => set((state) => {
      const newTasks = state.tasks.map(task => 
        task.id === taskId ? { ...task, productId } : task
      );
      
      return {
        tasks: newTasks,
        ...saveHistory(newTasks, state)
      };
    }),
    
    // History
    undo: () => set((state) => {
      if (state.currentHistoryIndex <= 0) return state;
      
      const newIndex = state.currentHistoryIndex - 1;
      return {
        tasks: JSON.parse(JSON.stringify(state.history[newIndex])),
        currentHistoryIndex: newIndex
      };
    }),
    
    redo: () => set((state) => {
      if (state.currentHistoryIndex >= state.history.length - 1) return state;
      
      const newIndex = state.currentHistoryIndex + 1;
      return {
        tasks: JSON.parse(JSON.stringify(state.history[newIndex])),
        currentHistoryIndex: newIndex
      };
    })
  };
});

export default useTaskStore; 