"use client";

import React, { useState, useEffect } from "react";
import { formatDate, EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calendar.css"; // Add custom styles

interface CustomEvent extends EventInput {
  status: "Not Started" | "In Progress" | "Completed";
  assignedTo: string;
  description: string;
}

const Calendar: React.FC = () => {
  const [currentEvents, setCurrentEvents] = useState<CustomEvent[]>([]);

  useEffect(() => {
    const fetchEvents = () => {
      const dummyEvents: CustomEvent[] = [
        {
          id: "1",
          title: "Task A",
          start: "2024-12-01",
          end: "2024-12-10",
          allDay: true,
          status: "Not Started",
          assignedTo: "John Doe",
          description: "Initial design phase for the project.",
        },
        {
          id: "2",
          title: "Task B",
          start: "2024-12-11",
          end: "2024-12-15",
          allDay: true,
          status: "In Progress",
          assignedTo: "Jane Smith",
          description: "Developing key components of the application.",
        },
        {
          id: "3",
          title: "Task C",
          start: "2024-12-16",
          end: "2024-12-20",
          allDay: true,
          status: "Completed",
          assignedTo: "Alice Johnson",
          description: "Final testing and bug fixes.",
        },
        
          {
            "id": "4",
            "title": "Task D",
            "start": "2024-12-21",
            "end": "2024-12-25",
            "allDay": true,
            "status": "Not Started",
            "assignedTo": "Michael Brown",
            "description": "Research and analysis phase."
          },
          {
            "id": "5",
            "title": "Task E",
            "start": "2024-12-26",
            "end": "2024-12-30",
            "allDay": true,
            "status": "In Progress",
            "assignedTo": "Emma Wilson",
            "description": "Creating wireframes and prototypes."
          },
          {
            "id": "6",
            "title": "Task F",
            "start": "2025-01-01",
            "end": "2025-01-05",
            "allDay": true,
            "status": "Completed",
            "assignedTo": "Liam Martinez",
            "description": "Client feedback and adjustments."
          },
          {
            "id": "7",
            "title": "Task G",
            "start": "2025-01-06",
            "end": "2025-01-10",
            "allDay": true,
            "status": "Not Started",
            "assignedTo": "Sophia Garcia",
            "description": "Code optimization and refactoring."
          },
          {
            "id": "8",
            "title": "Task H",
            "start": "2025-01-11",
            "end": "2025-01-15",
            "allDay": true,
            "status": "In Progress",
            "assignedTo": "James Taylor",
            "description": "Database integration and testing."
          },
          {
            "id": "9",
            "title": "Task I",
            "start": "2025-01-16",
            "end": "2025-01-20",
            "allDay": true,
            "status": "Completed",
            "assignedTo": "Olivia Anderson",
            "description": "User interface enhancements."
          },
          {
            "id": "10",
            "title": "Task J",
            "start": "2025-01-21",
            "end": "2025-01-25",
            "allDay": true,
            "status": "Not Started",
            "assignedTo": "Benjamin Hernandez",
            "description": "API development and integration."
          },
          {
            "id": "11",
            "title": "Task K",
            "start": "2025-01-26",
            "end": "2025-01-30",
            "allDay": true,
            "status": "In Progress",
            "assignedTo": "Charlotte Moore",
            "description": "Quality assurance testing."
          },
          {
            "id": "12",
            "title": "Task L",
            "start": "2025-02-01",
            "end": "2025-02-05",
            "allDay": true,
            "status": "Completed",
            "assignedTo": "Lucas Thompson",
            "description": "Final deployment preparation."
          },
          {
            "id": "13",
            "title": "Task M",
            "start": "2025-02-06",
            "end": "2025-02-10",
            "allDay": true,
            "status": "Not Started",
            "assignedTo": "Amelia White",
            "description": "Creating marketing materials."
          },
          {
            "id": "14",
            "title": "Task N",
            "start": "2025-02-11",
            "end": "2025-02-15",
            "allDay": true,
            "status": "In Progress",
            "assignedTo": "Ethan Harris",
            "description": "Customer onboarding sessions."
          },
          {
            "id": "15",
            "title": "Task O",
            "start": "2025-02-16",
            "end": "2025-02-20",
            "allDay": true,
            "status": "Completed",
            "assignedTo": "Harper Clark",
            "description": "Post-launch review and reporting."
          },
          {
            "id": "16",
            "title": "Task P",
            "start": "2025-02-21",
            "end": "2025-02-25",
            "allDay": true,
            "status": "Not Started",
            "assignedTo": "William Young",
            "description": "Drafting the project closure document."
          },
          {
            "id": "17",
            "title": "Task Q",
            "start": "2025-02-26",
            "end": "2025-03-01",
            "allDay": true,
            "status": "In Progress",
            "assignedTo": "Ella Allen",
            "description": "Project retrospective session."
          },
          {
            "id": "18",
            "title": "Task R",
            "start": "2025-03-02",
            "end": "2025-03-06",
            "allDay": true,
            "status": "Completed",
            "assignedTo": "Mason King",
            "description": "Final archiving and knowledge sharing."
          }
      ];

      setCurrentEvents(dummyEvents);
    };

    fetchEvents();
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

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        {/* Sidebar with Task List */}

        {/* Calendar */}
        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={false}
            selectable={false}
            dayMaxEvents={true}
            events={currentEvents.map((event) => ({
              ...event,
              className: getEventClassName(event.status),
              extendedProps: {
                assignedTo: event.assignedTo,
                description: event.description,
              },
            }))}
            eventMouseEnter={(info) => {
              const tooltip = document.createElement("div");
              tooltip.className = "custom-tooltip";
              tooltip.innerHTML = `
                <strong>${info.event.title}</strong><br/>
                <strong>Status:</strong> ${info.event.extendedProps.status}<br/>
                <strong>Assigned To:</strong> ${info.event.extendedProps.assignedTo}<br/>
                <strong>Description:</strong> ${info.event.extendedProps.description}
              `;
              document.body.appendChild(tooltip);

              info.el.addEventListener("mousemove", (e) => {
                tooltip.style.top = `${e.pageY + 10}px`;
                tooltip.style.left = `${e.pageX + 10}px`;
              });
            }}
            eventMouseLeave={() => {
              const tooltip = document.querySelector(".custom-tooltip");
              if (tooltip) tooltip.remove();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
