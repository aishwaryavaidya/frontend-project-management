"use client";

import React, { useEffect, useRef } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ResponsiveContainer,
} from "recharts";

const PhaseChart: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom on initial render
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const projectData = [
    { phase: "Not Started", currentCount: 5, estimatedCount: 7, criticalTasks: 3 },
    { phase: "Req Gather", currentCount: 8, estimatedCount: 6, criticalTasks: 5 },
    { phase: "Design", currentCount: 6, estimatedCount: 8, criticalTasks: 4 },
    { phase: "H/W Infra", currentCount: 3, estimatedCount: 4, criticalTasks: 2 },
    { phase: "In Dev", currentCount: 10, estimatedCount: 9, criticalTasks: 7 },
    { phase: "H/W Install", currentCount: 4, estimatedCount: 5, criticalTasks: 3 },
    { phase: "Testing/SIT", currentCount: 7, estimatedCount: 6, criticalTasks: 6 },
    { phase: "UAT", currentCount: 6, estimatedCount: 7, criticalTasks: 4 },
    { phase: "Parallel", currentCount: 2, estimatedCount: 3, criticalTasks: 1 },
    { phase: "Go-live", currentCount: 3, estimatedCount: 4, criticalTasks: 2 },
    { phase: "Support", currentCount: 5, estimatedCount: 6, criticalTasks: 3 },
    { phase: "Completed", currentCount: 12, estimatedCount: 12, criticalTasks: 0 },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full text-sm bg-white dark:bg-black dark:text-gray-200 shadow-md rounded-lg overflow-y-auto "
      style={{ height: "350px" }} // Fixed height to enable scrolling
    >
      <ResponsiveContainer width="100%" height={600}>
        <ComposedChart
          layout="vertical"
          data={projectData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          {/* Gridlines */}
          <CartesianGrid stroke="#e5e7eb" horizontal={false} vertical={true} />
          {/* Numeric X-Axis */}
          <XAxis
            type="number"
            tick={{ fill: "#6B7280", fontSize: 12 }}
            axisLine={{ stroke: "#ddd" }}
            tickLine={false}
          />
          {/* Categorical Y-Axis */}
          <YAxis
            type="category"
            dataKey="phase"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            width={100}
            axisLine={{ stroke: "#ddd" }}
            tickLine={false}
          />
          {/* Tooltip */}
          <Tooltip
            cursor={{ fill: "rgba(76, 139, 245, 0.1)" }}
            contentStyle={{
              backgroundColor: "#1F2937",
              color: "white",
              borderRadius: "5px",
              fontSize: "10px",
              lineHeight: "1",
            }}
            formatter={(value: any, name: string) =>
              name === "criticalTasks"
                ? `${value} critical tasks`
                : value
            }
          />
          {/* Legend */}
          <Legend verticalAlign="top" height={36} />
          {/* Bars for Current and Estimated Counts */}
          <Bar
            dataKey="currentCount"
            fill="#4C8BF5"
            barSize={12}
            name="Current"
          />
          <Bar
            dataKey="estimatedCount"
            fill="#82ca9d"
            barSize={12}
            name="Estimated"
          />
          {/* Scatter for Critical Tasks */}
          <Scatter
            dataKey="criticalTasks"
            fill="red"
            name="Critical Tasks"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}; 

export default PhaseChart;
