"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "antd";
import React from "react";

interface AssignmentViewProps {
  task: {
    taskName: string;
    assignee: string;
    status: string;
    startDate: string;
    endDate: string;
    assignedBy: string;
    comments: string[];
    completionPercentage: number;
  };
  onClose: () => void;
}

export default function AssignmentView({ task, onClose }: AssignmentViewProps) {
  return (
    <div className="assignment-view">
      <Card className="max-w-2xl mx-auto p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{task.taskName}</CardTitle>
          <CardDescription>
            Assigned By: <strong>{task.assignedBy}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Assignee</TableCell>
                <TableCell>{task.assignee}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{task.status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Start Date</TableCell>
                <TableCell>{task.startDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>End Date</TableCell>
                <TableCell>{task.endDate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completion Percentage</TableCell>
                <TableCell>{task.completionPercentage}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Comments</TableCell>
                <TableCell>
                  <ul className="list-disc ml-5">
                    {task.comments.map((comment, index) => (
                      <li key={index}>{comment}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <Button type="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
