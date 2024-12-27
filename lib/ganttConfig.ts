import gantt from 'dhtmlx-gantt';

export function configureGanttSettings() {
  // Basic configuration
  gantt.config.date_format = "%Y-%m-%d";
  gantt.config.work_time = true;
  gantt.config.skip_off_time = true;
  gantt.config.duration_unit = "day";
  gantt.config.row_height = 35;
  gantt.config.min_column_width = 40;
  gantt.config.scale_height = 60;
  gantt.config.show_links = true;
  gantt.config.open_tree_initially = true;

  // Configure time scale
  gantt.config.scales = [
    { unit: "month", step: 1, format: "%F, %Y" },
    { unit: "day", step: 1, format: "%j" }
  ];

  // Task styling
  gantt.templates.task_class = (start: Date, end: Date, task: any) => {
    if (task.type === "project") return "phase";
    if (task.is_milestone) return "milestone";

    const now = new Date();
    const plannedEnd = task.planned_end ? new Date(task.planned_end) : null;
    
    if (!plannedEnd) return "";
    
    if (end <= plannedEnd) return "task-on-time";
    if (now <= plannedEnd) return "task-delayed";
    return "task-overdue";
  };

  // Grid columns configuration
  gantt.config.columns = [
    { name: "text", label: "Task Name", tree: true, width: 250 },
    { 
      name: "start_date", 
      label: "Start Date", 
      align: "center", 
      width: 100 
    },
    { 
      name: "end_date", 
      label: "End Date", 
      align: "center", 
      width: 100 
    }
  ];
}