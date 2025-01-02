import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T, setState: (state: T) => void) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToHistory = useCallback((newState: T) => {
    setHistory(prev => [...prev.slice(0, currentIndex + 1), newState]);
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setState(history[currentIndex - 1]);
    }
  }, [currentIndex, history, setState]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setState(history[currentIndex + 1]);
    }
  }, [currentIndex, history, setState]);

  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
    addToHistory,
  };
}