"use client";

import React from "react";
import { Chrono } from "react-chrono";
import projectData, { Task, Milestone, Phase } from "../plan/Data";

type TimelineItem = {
  title: string;
  cardTitle: string;
  cardSubtitle?: string;
  cardDetailedText?: string;
};

const formatTimelineItems = (phases: Phase[]): TimelineItem[] => {
  const timelineItems: TimelineItem[] = [];
  phases.forEach((phase) => {
    phase.milestones.forEach((milestone) => {
      timelineItems.push({
        title: `${milestone.name}`,
        cardTitle: milestone.name,
        cardSubtitle: `${phase.name}`,
        cardDetailedText: milestone.tasks
          .map(
            (task) =>
              `${task.name} (Start: ${task.start_date.toLocaleDateString()}, End: ${task.end_date.toLocaleDateString()})`
          )
          .join("\n"),
      });
    });
  });
  return timelineItems;
};

const ProjectTimeline: React.FC = () => {
  const timelineItems = formatTimelineItems(projectData);

  return (
    <div className="justify-between items-center" style={{ width: "100%", height: "100vh" }}>
      <h1 className="text-xl font-bold mb-4 ml-4">Project Timeline</h1>
      <Chrono
        items={timelineItems}
        mode="VERTICAL"  
        theme={{
          primary: "#2196f3",
          secondary: "#ff9800",
          cardBgColor: "#f4f4f4",
          cardForeColor: "#333",
        }}
        slideShow
        scrollable={{ scrollbar: true }}
      />
    </div>
  );
};

export default ProjectTimeline;
