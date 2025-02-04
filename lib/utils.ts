import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateMilestoneProgress = (tasks: any[]) => {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((acc, task) => acc + task.progress, 0);
  return totalProgress / tasks.length;
}

export const calculateDuration = (startDate: Date, endDate: Date) => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Add this function to generate random colors
export function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 95%)`; // Light pastel colors
}