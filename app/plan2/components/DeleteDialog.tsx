'use client';

import { useState } from 'react';
import { Task } from '@/app/plan2/types/task';
import { getDependents, updateTask } from '@/app/plan2/services/taskService';

interface DeleteDialogProps {
  task: Task;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({ task, onClose, onConfirm }: DeleteDialogProps) {
  const [dependents, setDependents] = useState<Task[]>([]);
  const [updatedPredecessors, setUpdatedPredecessors] = useState<Record<string, string>>({});

  useState(() => {
    getDependents(task.id).then(setDependents);
  }, [task.id]);

  const handleConfirm = async () => {
    await Promise.all(
      dependents.map((dep) =>
        updateTask(dep.id, { predecessorIds: updatedPredecessors[dep.id] || dep.predecessorIds })
      )
    );
    onConfirm();
  };

  return (
    <div className="modal">
      <h2>Delete Task: {task.taskName}</h2>
      <p>Predecessors: {task.predecessorIds || 'None'}</p>
      {dependents.length > 0 && (
        <>
          <h3>Dependent Tasks:</h3>
          <ul>
            {dependents.map((dep) => (
              <li key={dep.id}>
                {dep.taskName}
                <input
                  defaultValue={dep.predecessorIds || ''}
                  onChange={(e) => setUpdatedPredecessors((prev) => ({
                    ...prev,
                    [dep.id]: e.target.value,
                  }))}
                />
              </li>
            ))}
          </ul>
        </>
      )}
      <button onClick={handleConfirm}>Check Deletion</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}