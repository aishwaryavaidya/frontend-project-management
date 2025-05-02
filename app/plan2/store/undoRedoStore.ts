import {create} from 'zustand';
import { Task } from '@/app/plan2/types/task';

interface UndoRedoState {
  past: Task[][];
  future: Task[][];
  setTasks: (tasks: Task[]) => void;
  undo: () => Task[] | null;
  redo: () => Task[] | null;
}

export const useUndoRedo = create<UndoRedoState>((set, get) => ({
  past: [],
  future: [],
  setTasks: (tasks) => {
    set({ past: [...get().past, tasks], future: [] });
  },
  undo: () => {
    const past = get().past;
    if (past.length > 1) {
      const previous = past.pop();
      set({ past: past.slice(0, -1), future: [past[past.length - 1], ...get().future] });
      return previous || null;
    }
    return null;
  },
  redo: () => {
    const future = get().future;
    if (future.length > 0) {
      const next = future.shift();
      set({ past: [...get().past, next!], future });
      return next || null;
    }
    return null;
  },
}));