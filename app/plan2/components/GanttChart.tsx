'use client';

import { useEffect } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import gantt from 'dhtmlx-gantt';
import { Task } from '@/app/plan2/types/task';

interface GanttChartProps {
  tasks: Task[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
  useEffect(() => {
    gantt.init('gantt_container');
    gantt.parse({
      data: tasks.map((t) => ({
        id: t.id,
        text: t.taskName,
        start_date: t.startDate,
        duration: t.duration,
        progress: t.actualEndDate ? 1 : t.actualStartDate ? 0.5 : 0,
        parent: t.level > 0 ? tasks.find((p) => p.level < t.level && p.siNo < t.siNo)?.id : null,
        type: t.isMilestone ? 'milestone' : 'task',
      })),
      links: tasks
        .filter((t) => t.predecessorIds)
        .flatMap((t) =>
          t.predecessorIds!.split(',').map((siNo) => ({
            id: `${t.id}-${siNo}`,
            source: tasks.find((p) => p.siNo === Number(siNo))?.id,
            target: t.id,
            type: '0', // Finish-to-Start
          }))
        ),
    });

    gantt.config.columns = [
      { name: 'text', label: 'Task Name', width: '*', tree: true },
      { name: 'start_date', label: 'Start Date', align: 'center' },
      { name: 'duration', label: 'Duration', align: 'center' },
    ];
  }, [tasks]);

  return <div id="gantt_container" style={{ width: '100%', height: '500px' }} />;
}