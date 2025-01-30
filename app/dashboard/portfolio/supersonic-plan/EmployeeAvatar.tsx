"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/generateInitials";
import React from "react";

interface EmployeeAvatarProps {
  assignments: { employeeName: string }[]; 
}

const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-yellow-500",
]; 

export default function EmployeeAvatar({ assignments }: EmployeeAvatarProps) {
  const numAssignments = assignments.length;

  if (numAssignments === 0) return null; 

  if (numAssignments > 3) {
    const numOverflow = numAssignments - 2;
    return (
      <div className="flex items-center">
        {assignments.slice(0, 2).map((assignment, index) => (
          <Avatar key={index} className="h-6 w-6 relative z-10">
            <AvatarImage
              src={`/avatars/${assignment.employeeName}.png`}
              alt={assignment.employeeName}
              className="rounded-full" // Added rounded-full
            />
            <AvatarFallback className={`rounded-full ${avatarColors[index % avatarColors.length]} text-white`}> {/* Applied color and text-white */}
              {getInitials(assignment.employeeName)}
            </AvatarFallback>
          </Avatar>
        ))}
        <Avatar className="h-6 w-6 bg-gray-300 text-center text-xs relative z-10 rounded-full"> {/* Added rounded-full */}
          +{numOverflow}
        </Avatar>
      </div>
    );
  } else if (numAssignments === 3) {
    return (
      <div className="flex items-center">
        {assignments.map((assignment, index) => (
          <Avatar key={index} className="h-6 w-6 relative z-10">
            <AvatarImage
              src={`/avatars/${assignment.employeeName}.png`}
              alt={assignment.employeeName}
              className="rounded-full" // Added rounded-full
            />
            <AvatarFallback className={`rounded-full ${avatarColors[index % avatarColors.length]} text-white`}>
              {getInitials(assignment.employeeName)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  } else {
    return (
      <div className="flex items-center">
        {assignments.map((assignment, index) => (
          <Avatar key={index} className="h-6 w-6 relative z-10">
            <AvatarImage
              src={`/avatars/${assignment.employeeName}.png`}
              alt={assignment.employeeName}
              className="rounded-full" // Added rounded-full
            />
            <AvatarFallback className={`rounded-full ${avatarColors[index % avatarColors.length]} text-white`}>
              {getInitials(assignment.employeeName)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    );
  }
}
