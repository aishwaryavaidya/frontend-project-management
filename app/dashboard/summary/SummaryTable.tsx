"use client";
import React, { useState } from "react";
import Marquee from "react-fast-marquee";

const data = [
  { customer: "ABG ", type: "Fibres", site: "Vilayat", projCode: "P123fjbhsds", ProdName: "VC", currentphase: "Support", status: "Delayed", progress: 40, pm: "John Doe", spoc:"Saurabh Naik", delay: 10, goLive: "2025-01-10", ryg: 0 },
  { customer: "VICAT", type: "Cement", site: "California", projCode: "P456scb", ProdName: "Inplant",currentphase: "In Dev", status: "On Track", progress: 80, pm: "Jane Smith", spoc:"Alok Pandey", delay: 0, goLive: "2024-12-20", ryg: 0 },
  { customer: "ABG", type: "Cement", site: "Nevada", projCode: "P789sdkj", ProdName: "VC",currentphase: "UAT", status: "On Track", progress: 60, pm: "Alice Lee", spoc:"Alok Pandey", delay: 5, goLive: "2024-11-15", ryg: 1 },
  { customer: "SCL", type: "Cement", site: "New York", projCode: "P321kjsdbhqsbcd", ProdName: "Epod",currentphase: "Dev", status: "Delayed", progress: 30, pm: "Robert Green", spoc:"Saurabh Naik", delay: 15, goLive: "2025-02-01", ryg: 2 },
  { customer: "DCM", type: "Chemicals", site: "Texas", projCode: "P123", ProdName: "Inplant",currentphase: "Completed", status: "Delayed", progress: 40, pm: "John Doe", spoc:"Mayur Balsane", delay: 10, goLive: "2025-01-10", ryg: 0 },
  { customer: "DPF", type: "Chemicals", site: "California", projCode: "P456", ProdName: "Smartloading",currentphase: "Go-live", status: "On Track", progress: 80, pm: "Jane Smith", spoc:"Mayur Balsane", delay: 0, goLive: "2024-12-20", ryg: 1 },
  { customer: "UTCL", type: "Cement", site: "Nevada", projCode: "P789", ProdName: "Enroute",currentphase: "H/W Infra", status: "On Track", progress: 60, pm: "Alice Lee", spoc:"Amar", delay: 5, goLive: "2024-11-15", ryg: 0 },
  { customer: "JK", type: "Cement", site: "New York", projCode: "P321", ProdName: "Inplant",currentphase: "In Dev", status: "Delayed", progress: 30, pm: "Robert Green", spoc:"Sagar", delay: 15, goLive: "2025-02-01", ryg: 2 },
  { customer: "JK", type: "Cement", site: "Texas", projCode: "P123", ProdName: "Enroute",currentphase: "Design", status: "Delayed", progress: 40, pm: "John Doe", spoc:"Viswajeet", delay: 10, goLive: "2025-01-10", ryg: 1 },
  { customer: "JSW", type: "Cement", site: "California", projCode: "P456", ProdName: "Epod",currentphase: "UAT", status: "On Track", progress: 80, pm: "Jane Smith", spoc:"Sruti", delay: 0, goLive: "2024-12-20", ryg: 0 },
  { customer: "Sterlite", type: "Copper", site: "Nevada", projCode: "P789", ProdName: "Inplant",currentphase: "Dev", status: "On Track", progress: 60, pm: "Alice Lee", spoc:"Sana", delay: 5, goLive: "2024-11-15", ryg: 2 },
  { customer: "UTCL", type: "Cement", site: "Kesoram", projCode: "P321", ProdName: "VC",currentphase: "Testing/SIT", status: "Delayed", progress: 30, pm: "Robert Green", spoc:"ABC", delay: 15, goLive: "2025-02-01", ryg: 1 },
  { customer: "Amrit", type: "Cement", site: "Texas", projCode: "P123", ProdName: "VC",currentphase: "Dev", status: "Delayed", progress: 40, pm: "John Doe", spoc:"XYZ", delay: 10, goLive: "2025-01-10", ryg: 0 },
  { customer: "UTCL", type: "Cement", site: "Jharia", projCode: "P456", ProdName: "Inplant",currentphase: "Dev", status: "On Track", progress: 80, pm: "Jane Smith", spoc:"Rohit", delay: 0, goLive: "2024-12-20", ryg: 0},
  { customer: "ABG", type: "Fibers", site: "Nevada", projCode: "P789", ProdName: "Epod",currentphase: "Dev", status: "On Track", progress: 60, pm: "Alice Lee", spoc:"Ram", delay: 5, goLive: "2024-11-15", ryg: 0 },
  { customer: "ABC", type: "Cement", site: "New York", projCode: "P321", ProdName: "Epod",currentphase: "Dev", status: "Delayed", progress: 30, pm: "Robert Green", spoc:"Sham", delay: 15, goLive: "2025-02-01", ryg: 2 },
];

const filterTypes = [
  { label: "By Customer", value: "customer" },
  { label: "By Site", value: "site" },
  { label: "Product", value: "type" },
  { label: "Model", value: "ProdName" },
  { label: "Delayed Proj", value: "delayed" },
  { label: "Upcoming Go-live", value: "goLive" },
];

const ITEMS_PER_PAGE = 15;

const SummaryTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (direction: string) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    // First update the selected filter type and value
    setFilterType(type);
    setFilterValue(value);

    // Apply the filter only if both type and value are selected
    if (type && value) {
        if (type === "customer") {
            setFilteredData(data.filter((item) => item.customer === value));
        } else if (type === "site") {
            setFilteredData(data.filter((item) => item.site === value));
        } else if (type === "type") {
            setFilteredData(data.filter((item) => item.site === value));
        } else if (type === "ProdName") {
            setFilteredData(data.filter((item) => item.site === value));
        } else if (type === "delayed") {
            setFilteredData(data.filter((item) => item.status === "Delayed"));
        } else if (type === "goLive") {
            const currentDate = new Date();
            setFilteredData(data.filter((item) => new Date(item.goLive) <= currentDate));
        }
    } else {
        // Reset the table if no filter is applied
        setFilteredData(data);
    }
  };

  return (
    <div className="dark:bg-black dark:text-white">
  {/* Filters */}
  <div className="flex justify-between mt-1 text-sm">
    <div className="flex text-black text-base font-bold px-2 dark:text-white">
      Projects Summary
    </div>

    <div className="flex flex-col items-start ml-80">
      {filterType && (
        <select
          onChange={(e) => handleFilterChange(filterType, e.target.value)}
          className="ml-2 p-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select {filterType}</option>
          {filterType === "customer" &&
            [...new Set(data.map((item) => item.customer))].map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          {filterType === "site" &&
            [...new Set(data.map((item) => item.site))].map((site) => (
              <option key={site} value={site}>
                {site}
              </option>
            ))}
          {filterType === "type" &&
            [...new Set(data.map((item) => item.type))].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
      )}
    </div>

    <div className="flex flex-col items-end mr-0">
      <select
        onChange={(e) => handleFilterChange(e.target.value, filterValue)}
        className="p-0.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white mb-2"
      >
        <option value="">Select Filter Type</option>
        {filterTypes.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-x-auto overflow-y-auto sm:max-h-[300px] sm:max-w-[58vw] md:max-h-[350px] md:max-w-[60vw] lg:max-h-[300px] lg:max-w-[60vw]">
  <table className="min-w-full border-collapse text-xs">
    {/* Sticky header */}
    <thead className="bg-gray-200 dark:bg-gray-950 sticky top-0 z-10 shadow">
      <tr>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Index</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Customer</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Type</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Site</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Proj Code</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Product</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Current Phase</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Status</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Progress%</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">PM</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">SPOC</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Delay %</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">Go-live dt.</th>
        <th className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">RYG</th>
      </tr>
    </thead>
    <tbody>
      {paginatedData.map((item, index) => (
        <tr
          key={index}
          className={`text-xs ${
            item.ryg
              ? "bg-red-500 text-white"
              : "bg-white dark:bg-gray-800 dark:text-white"
          }`}
        >
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{index + 1}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.customer}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.type}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.site}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.projCode}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.ProdName}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.currentphase}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.status}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.progress}%</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.pm}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.spoc}</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.delay}%</td>
          <td className="px-2 py-1 border dark:border-gray-700 whitespace-nowrap">{item.goLive}</td>
          <td className="px-2 py-1 border dark:border-gray-700 text-center whitespace-nowrap"></td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>


    {/* Pagination */}
    <div className="flex justify-center items-center space-x-3">
    <button
      onClick={() => handlePageChange("prev")}
      disabled={currentPage === 1}
      className="px-3 py-1 bg-gray-300 text-xs rounded hover:bg-blue-600 disabled:bg-blue-400 text-white dark:bg-gray-700 dark:hover:bg-blue-800"
    >
      Prev
    </button>
    <span className="text-xs dark:text-gray-300">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => handlePageChange("next")}
      disabled={currentPage === totalPages}
      className="px-3 py-1 bg-blue-400 text-xs rounded hover:bg-blue-600 disabled:bg-blue-400 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
    >
      Next
    </button>
    </div>

  </div>


  );
};

export default SummaryTable;
