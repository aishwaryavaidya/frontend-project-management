"use client";

// src/app/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Modal, Input, Button, Alert } from "antd";

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);

export default function TaskStatusPage() {
  const taskStatuses = [
    { status: "Not Started", count: 10, color: "bg-gray-400" },
    { status: "In Progress", count: 8, color: "bg-blue-500" },
    { status: "Completed", count: 15, color: "bg-green-500" },
    { status: "Pending", count: 5, color: "bg-yellow-500" },
    { status: "Approved", count: 12, color: "bg-purple-500" },
  ];

  const tasks = [
    { taskName: "Complete QA testing", assignee: "John Doe", status: "Completed", startDate: "2024-11-01", endDate: "2024-11-03" },
    { taskName: "Start development", assignee: "Jane Smith", status: "In Progress", startDate: "2024-11-04", endDate: "2024-11-10" },
    { taskName: "Review code", assignee: "Alice Johnson", status: "Pending Review", startDate: "2024-11-05", endDate: "2024-11-07" },
    { taskName: "Design UI", assignee: "Bob Brown", status: "Not Started", startDate: "2024-11-02", endDate: "2024-11-04" },
    { taskName: "Deploy to production", assignee: "Sarah Lee", status: "Completed", startDate: "2024-10-29", endDate: "2024-10-31" },
  ];

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [filter, setFilter] = useState("All");

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue);
    if (filterValue === "All") setFilteredTasks(tasks);
    else if (filterValue === "This Week") {
      const startOfWeek = dayjs().startOf("week");
      const endOfWeek = dayjs().endOf("week");
      setFilteredTasks(tasks.filter((task) => dayjs(task.endDate).isBetween(startOfWeek, endOfWeek, null, "[]")));
    } else if (filterValue === "Today") {
      setFilteredTasks(tasks.filter((task) => dayjs(task.endDate).isSame(dayjs(), "day")));
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === filterValue));
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Task Status Cards */}
      <div className="flex justify-center gap-4 flex-wrap mt-4">
        {taskStatuses.map((status, index) => (
          <Card key={index} className={`w-48 h-32 text-white ${status.color}`}>
            <CardHeader>
              <CardTitle>{status.status}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{status.count}</p>
              <p className="text-sm">Tasks</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and Task Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="w-40">
            <Select onValueChange={handleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="This Week">This Week</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task, index) => (
              <TableRow key={index}>
                <TableCell>{task.taskName}</TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.startDate}</TableCell>
                <TableCell>{task.endDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
