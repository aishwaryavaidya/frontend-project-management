import { Phase, Milestone, Task } from '../../app/dashboard/project/plan/Data';

interface GanttTask {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  parent?: string;
  type?: string;
  progress?: number;
  planned_start?: Date;
  planned_end?: Date;
  open?: boolean;
  render?: string;
}

interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

export function formatGanttData(phases: Phase[]): GanttData {
  const tasks: GanttTask[] = [];
  const links: GanttLink[] = [];

  phases.forEach(phase => {
    // Add phase
    tasks.push({
      id: phase.id,
      text: phase.name,
      start_date: phase.milestones[0]?.start_date || new Date(),
      end_date: phase.milestones[phase.milestones.length - 1]?.end_date || new Date(),
      type: "project",
      open: true,
      render: "split"
    });

    // Add milestones
    phase.milestones.forEach(milestone => {
      tasks.push(formatMilestone(milestone, phase.id));

      // Add milestone dependency
      if (milestone.dependent_milestone_id) {
        links.push({
          id: `link_${milestone.dependent_milestone_id}_${milestone.id}`,
          source: milestone.dependent_milestone_id,
          target: milestone.id,
          type: "0"
        });
      }

      // Add tasks
      milestone.tasks.forEach(task => {
        tasks.push(formatTask(task, milestone.id));

        // Add task dependencies
        task.dependencies.forEach(depId => {
          links.push({
            id: `link_${depId}_${task.id}`,
            source: depId,
            target: task.id,
            type: "0"
          });
        });
      });
    });
  });

  return { data: tasks, links };
}

function formatMilestone(milestone: Milestone, phaseId: string): GanttTask {
  return {
    id: milestone.id,
    text: milestone.name,
    start_date: milestone.start_date,
    end_date: milestone.end_date,
    parent: phaseId,
    planned_start: milestone.expected_start_date,
    planned_end: milestone.expected_end_date,
    type: "project",
    open: true
  };
}

function formatTask(task: Task, milestoneId: string): GanttTask {
  return {
    id: task.id,
    text: task.name,
    start_date: task.start_date,
    end_date: task.end_date,
    parent: milestoneId,
    planned_start: task.expected_start_date,
    planned_end: task.expected_end_date
  };
}