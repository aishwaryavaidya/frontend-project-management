"use client";

import React, { useState, useEffect } from "react";
import { EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calendar.css";
import dayjs from "dayjs";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);

interface CustomEvent {
  id: string;
  title: string;
  start: string; // string type for date
  end: string;   // string type for date
  status: "Not Started" | "In Progress" | "Completed";
  assignedBy: string;
  description: string;
}

interface CustomEvent extends EventInput {
  status: "Not Started" | "In Progress" | "Completed";
  assignedBy: string;
  description: string;
}



const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<CustomEvent[]>([]);
  const [tasksThisWeek, setTasksThisWeek] = useState<number>(0);
  const [tasksThisMonth, setTasksThisMonth] = useState<number>(0);

  useEffect(() => {
    const dummyEvents: CustomEvent[] = [
      {
        id: "1",
        title: "Task A",
        start: "2024-12-01",
        end: "2024-12-01",
        status: "Not Started",
        assignedBy: "John Doe",
        description: "Initial design phase for the project.",
      },
      {
        id: "2",
        title: "Task B",
        start: "2024-12-01",
        end: "2024-12-01",
        status: "In Progress",
        assignedBy: "Jane Smith",
        description: "Development phase in progress.",
      },
      {
        id: "2",
        title: "Task B",
        start: "2024-12-11",
        end: "2024-12-15",
        allDay: true,
        status: "In Progress",
        assignedBy: "Jane Smith",
        description: "Developing key components of the application.",
      },
      {
        id: "3",
        title: "Task C",
        start: "2024-12-16",
        end: "2024-12-20",
        allDay: true,
        status: "Completed",
        assignedBy: "Alice Johnson",
        description: "Final testing and bug fixes.",
      },
      
        {
          "id": "4",
          "title": "Task D",
          "start": "2024-12-21",
          "end": "2024-12-25",
          "allDay": true,
          "status": "Not Started",
          "assignedBy": "Michael Brown",
          "description": "Research and analysis phase."
        },
        {
          "id": "5",
          "title": "Task E",
          "start": "2024-12-26",
          "end": "2024-12-30",
          "allDay": true,
          "status": "In Progress",
          "assignedBy": "Emma Wilson",
          "description": "Creating wireframes and prototypes."
        },
        {
          "id": "6",
          "title": "Task F",
          "start": "2025-01-01",
          "end": "2025-01-05",
          "allDay": true,
          "status": "Completed",
          "assignedBy": "Liam Martinez",
          "description": "Client feedback and adjustments."
        },
        {
          "id": "7",
          "title": "Task G",
          "start": "2025-01-06",
          "end": "2025-01-10",
          "allDay": true,
          "status": "Not Started",
          "assignedBy": "Sophia Garcia",
          "description": "Code optimization and refactoring."
        },
        {
          "id": "8",
          "title": "Task H",
          "start": "2025-01-11",
          "end": "2025-01-15",
          "allDay": true,
          "status": "In Progress",
          "assignedBy": "James Taylor",
          "description": "Database integration and testing."
        },
        {
          "id": "9",
          "title": "Task I",
          "start": "2025-01-16",
          "end": "2025-01-20",
          "allDay": true,
          "status": "Completed",
          "assignedBy": "Olivia Anderson",
          "description": "User interface enhancements."
        },
        {
          "id": "10",
          "title": "Task J",
          "start": "2025-01-21",
          "end": "2025-01-25",
          "allDay": true,
          "status": "Not Started",
          "assignedBy": "Benjamin Hernandez",
          "description": "API development and integration."
        },
        {
          "id": "11",
          "title": "Task K",
          "start": "2025-01-26",
          "end": "2025-01-30",
          "allDay": true,
          "status": "In Progress",
          "assignedBy": "Charlotte Moore",
          "description": "Quality assurance testing."
        },
        {
          "id": "12",
          "title": "Task L",
          "start": "2025-02-01",
          "end": "2025-02-05",
          "allDay": true,
          "status": "Completed",
          "assignedBy": "Lucas Thompson",
          "description": "Final deployment preparation."
        },
        {
          "id": "13",
          "title": "Task M",
          "start": "2025-02-06",
          "end": "2025-02-10",
          "allDay": true,
          "status": "Not Started",
          "assignedBy": "Amelia White",
          "description": "Creating marketing materials."
        },
        {
          "id": "14",
          "title": "Task N",
          "start": "2025-02-11",
          "end": "2025-02-15",
          "allDay": true,
          "status": "In Progress",
          "assignedBy": "Ethan Harris",
          "description": "Customer onboarding sessions."
        },
        {
          "id": "15",
          "title": "Task O",
          "start": "2025-02-23",
          "end": "2025-02-20",
          "allDay": true,
          "status": "Completed",
          "assignedBy": "Harper Clark",
          "description": "Post-launch review and reporting."
        },
        {
          "id": "16",
          "title": "Task P",
          "start": "2025-02-23",
          "end": "2025-02-25",
          "allDay": true,
          "status": "Not Started",
          "assignedBy": "William Young",
          "description": "Drafting the project closure document."
        },
        {
          "id": "36",
          "title": "Task Z",
          "start": "2025-02-22",
          "end": "2025-02-25",
          "allDay": true,
          "status": "Not Started",
          "assignedBy": "sjcbscbm Young",
          "description": "Drafting the project closure document."
        },
        {
          "id": "17",
          "title": "Task Q",
          "start": "2025-02-26",
          "end": "2025-03-01",
          "allDay": true,
          "status": "In Progress",
          "assignedBy": "Ella Allen",
          "description": "Project retrospective session."
        },
        {
          "id": "18",
          "title": "Task R",
          "start": "2025-03-02",
          "end": "2025-03-06",
          "allDay": true,
          "status": "Completed",
          "assignedBy": "Mason King",
          "description": "Final archiving and knowledge sharing."
        }
        
    ];

    setCurrentEvents(dummyEvents);

    const thisWeek = dayjs().startOf("week");
    const thisMonth = dayjs().startOf("month");

    let weekCount = 0;
    let monthCount = 0;

    dummyEvents.forEach((event) => {
      const eventStart = dayjs(event.start);
      const eventEnd = dayjs(event.end);

      // Check if the event is due this week
      if (eventStart.isSameOrAfter(thisWeek) && eventStart.isBefore(thisWeek.add(7, "days"))) {
        weekCount++;
      }

      // Check if the event is due this month
      if (eventStart.isSameOrAfter(thisMonth) && eventStart.isBefore(thisMonth.add(1, "month"))) {
        monthCount++;
      }
    });

    setTasksThisWeek(weekCount);
    setTasksThisMonth(monthCount);
  }, []);

  const getEventClassName = (status: string) => {
    switch (status) {
      case "Not Started":
        return "event-not-started";
      case "In Progress":
        return "event-in-progress";
      case "Completed":
        return "event-completed";
      default:
        return "";
    }
  };

  
  const handleMouseEnter = (info: any) => {
    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
  
    // Format the date using toLocaleDateString
    const startDateFormatted = new Date(info.event.start).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const endDateFormatted = new Date(info.event.end).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  
    tooltip.innerHTML = `
      <strong>${info.event.title}</strong><br />
      <em>${info.event.extendedProps.description}</em><br />
      Assigned By: ${info.event.extendedProps.assignedBy}<br />
      Start date: ${startDateFormatted}<br />
      End date: ${endDateFormatted}
    `;
    document.body.appendChild(tooltip);
  
    info.el.onmousemove = (e: MouseEvent) => {
      tooltip.style.top = e.pageY + 10 + "px";
      tooltip.style.left = e.pageX + 10 + "px";
    };
  
    info.el.onmouseleave = () => {
      document.body.removeChild(tooltip);
    };

    info.el.addEventListener("mouseleave", () => {
      tooltip.remove();
    });
    
  };
  

  return (
    <div className="p-6 text-base-content min-h-screen transition-all dark:text-white">
      <div className="task-summary flex items-center justify-between mb-6">
        <p>Tasks Due This Week: {tasksThisWeek}</p>
        <h1 className="text-4xl font-bold text-center sm:text-2xl">Task Calendar</h1>
        <p>Tasks Due This Month: {tasksThisMonth}</p>
      </div>
      <div className="flex justify-center mb-4 space-x-4 flex-wrap">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className="legend-box bg-red-500 w-4 h-4"></div>
          <span className="text-sm sm:text-xs">Not Started</span>
        </div>
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className="legend-box bg-yellow-500 w-4 h-4"></div>
          <span className="text-sm sm:text-xs">In Progress</span>
        </div>
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className="legend-box bg-green-500 w-4 h-4"></div>
          <span className="text-sm sm:text-xs">Completed</span>
        </div>
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <div className="legend-box bg-purple-500 w-4 h-4"></div>
          <span className="text-sm sm:text-xs">Multiple Tasks</span>
        </div>
      </div>
  
  <FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  headerToolbar={{
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  }}
  events={currentEvents.map((event) => ({
    ...event,
    className: getEventClassName(event.status),
  }))}
  eventMouseEnter={handleMouseEnter}
  dayMaxEventRows={1}
  moreLinkContent={(args) => (
    <div className="bg-purple-500 text-white p-1 rounded w-full sm:w-24">
      {args.num} Tasks
    </div>
  )}
  contentHeight="auto"
  
/>
    </div>
  );
  
};

export default Calendar;
