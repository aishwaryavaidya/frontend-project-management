"use client";

import React, { useEffect } from "react";
import gantt from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import "./ProjectGanttChart.css"; // Add custom styles
import { Phase } from "./Data";
import projectData from "./Data";
import { configureGanttSettings } from "@/lib/ganttConfig";

const ProjectGanttChart = () => {
    useEffect(() => {
        // Configure Gantt chart settings
        configureGanttSettings();
        gantt.init("gantt_here");

        // Transform project data and load it into Gantt
        const taskData = transformToGanttData(projectData);
        gantt.parse(taskData);

        // Make the Gantt chart read-only
        gantt.config.readonly = true;

        // Clean up
        return () => {
            gantt.clearAll();
        };
    }, []);

    const transformToGanttData = (phases: Phase[]) => {
        const tasks: any[] = [];
        const links: any[] = [];

        phases.forEach((phase) => {
            const lastMilestone = phase.milestones[phase.milestones.length - 1];
            const phaseEndDate = lastMilestone.end_date.toISOString().split("T")[0];
            const phaseExpectedEndDate = lastMilestone.expected_end_date.toISOString().split("T")[0];

            tasks.push({
                id: `phase_${phase.id}`,
                text: phase.name,
                start_date: phase.milestones[0]?.start_date.toISOString().split("T")[0],
                end_date: phaseEndDate,
                expected_start_date: phase.milestones[0]?.expected_start_date.toISOString().split("T")[0],
                expected_end_date: phaseExpectedEndDate,
                duration: 1,
                type: "project",
                open: true,
            });

            phase.milestones.forEach((milestone) => {
                tasks.push({
                    id: `milestone_${milestone.id}`,
                    text: milestone.name,
                    start_date: milestone.start_date.toISOString().split("T")[0],
                    end_date: milestone.end_date.toISOString().split("T")[0],
                    expected_start_date: milestone.expected_start_date.toISOString().split("T")[0],
                    expected_end_date: milestone.expected_end_date.toISOString().split("T")[0],
                    parent: `phase_${phase.id}`,
                    type: "milestone",
                    is_milestone: true,
                });

                milestone.tasks.forEach((task) => {
                    tasks.push({
                        id: task.id,
                        text: task.name,
                        start_date: task.start_date.toISOString().split("T")[0],
                        end_date: task.end_date.toISOString().split("T")[0],
                        expected_start_date: task.expected_start_date.toISOString().split("T")[0],
                        expected_end_date: task.expected_end_date.toISOString().split("T")[0],
                        parent: `milestone_${milestone.id}`,
                        progress: 0.5,
                    });

                    task.dependencies.forEach((dependency) => {
                        links.push({
                            id: `link_${task.id}_${dependency}`,
                            source: dependency,
                            target: task.id,
                            type: 0, // Finish-to-Start link
                        });
                    });
                });

                if (milestone.dependent_milestone_id) {
                    links.push({
                        id: `link_${milestone.id}_${milestone.dependent_milestone_id}`,
                        source: `milestone_${milestone.dependent_milestone_id}`,
                        target: `milestone_${milestone.id}`,
                        type: 0, // Finish-to-Start link
                    });
                }
            });
        });

        return { data: tasks, links };
    };

    return <div id="gantt_here" style={{ width: "100%", height: "400px" }}></div>;
};

export default ProjectGanttChart;
  