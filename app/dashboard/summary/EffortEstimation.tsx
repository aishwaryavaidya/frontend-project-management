"use client";

import React, { useState } from "react";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend, Sector } from "recharts";

// Define TypeScript types for the data
interface CustomerEffortData {
  name: string;
  value: number;
}

const EffortEstimation: React.FC = () => {
  // Sample data for customers and effort estimation
  const data: CustomerEffortData[] = [
    { name: "UTCL", value: 10.87 },
    { name: "JK", value: 6.52 },
    { name: "ABG", value: 8.7 },
    { name: "NUVISTA", value: 4.35 },
    { name: "VICAT", value: 2.17 },
    { name: "DPF", value: 10.87 },
    { name: "DCM", value: 10.87 },
    { name: "JSW", value: 10.87 },
    { name: "Strelite", value: 10.87 },
    { name: "Kesoram", value: 10.87 },
    { name: "Amrit", value: 10.87 },
    { name: "SCL", value: 10.87 },
  ];

  // State to manage the active pie slice on hover
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Function to render active slice shape
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g style={{ zIndex: 50 }}>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} style={{ fontSize: '16px', fontWeight: 'semibold' }}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="fill-black dark:fill-white" style={{ fontSize: '12px', fontWeight: 'bold' }}>{`Effort: ${value}%`}</text>
      </g>
    );
  };

  // Handle pie chart mouse enter to highlight slices
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Colors for each slice
  const COLORS = ["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];

  return (
    <div className="w-full text-sm bg-white dark:bg-black dark:text-gray-200 shadow-md rounded-lg relative">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number, name: string) => [name, `${value}% effort utilized by`]}
            // style={{ fontSize: '12px', fontWeight: 'bold' }}
            />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            iconSize={10} // Smaller legend icon size
            wrapperStyle={{ fontSize: "10px" }} // Smaller text size
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EffortEstimation;
