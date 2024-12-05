"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community"; // Import type for ColDef
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
//import "ag-grid-community/styles/ag-theme-quartz-dark.css";
import { LucideToggleLeft } from "lucide-react"; // Import the toggle icon
import ProgressBar from "./ProgressBar"; // A custom progress bar component

interface RowData {
  projCode: string;
  status: string;
  progress: number;
  startDate: string;
  tentativeGoLiveDate: string;
  lastModified: string;
  projectManager: string;
  layout: string;
  rygHealth: boolean;
  products: string;
}

interface Params {
  value: any;
  data?: RowData;
}

const CustomerSiteTable = () => {
  const [darkMode, setDarkMode] = useState(false);

  
  const rowClassRules = {
    "rag-red": (params: any) => params.data?.rygHealth === true, // Condition for "Ford"
  };

  // Common columns
  const columnDefs: ColDef<RowData>[] = [
    { headerName: "Proj Code", 
      field: "projCode", 
      flex: 2.5,
    },
    {
      headerName: "Status",
      field: "status",
      cellClassRules: {
        'green-cell': p=>p.value=="Active",
        'red-cell': p=>p.value=="Inactive",
      }, // Type cast to satisfy Ag-Grid
      flex: 1.1,
    },
    {
      headerName: "Progress",
      field: "progress",
      cellRenderer: ProgressRenderer as any, // Type cast to satisfy Ag-Grid
      flex: 1.5,
    },
    { headerName: "Start Date", 
      field: "startDate", 
      sortable: true,
      flex: 1.5,
    },
    {
      headerName: "GO Live",
      field: "tentativeGoLiveDate",
      flex: 1.5,
    },
    { headerName: "Last Modified", field: "lastModified", flex: 1.5 },
    { headerName: "Project Manager", field: "projectManager", flex: 1.5 },
    { headerName: "Layout", field: "layout", flex: 1.8 },
    {
      headerName: "RYG",
      field: "rygHealth",
      //cellRenderer: RYGHealthRenderer as any, 
      flex: 1,
    },
    { headerName: "Products", field: "products", flex: 1.5 },
  ];

  // Example data
  const rowData: Record<string, RowData[]> = {
    VICAT: [
      {
        projCode: "VCT-KLM-07092024-R-IM",
        status: "Active",
        progress: 40,
        startDate: "07.09.2024",
        tentativeGoLiveDate: "08.11.2024",
        lastModified: "23.09.2024",
        projectManager: "O user_name",
        layout: "ROLLOUT",
        rygHealth: true,
        products: "widgets",
      },
      {
        projCode: "VCT-KLB-07092024-R-IM",
        status: "Active",
        progress: 20,
        startDate: "07.09.2025",
        tentativeGoLiveDate: "08.11.2025",
        lastModified: "23.09.2025",
        projectManager: "O user_name",
        layout: "STANDARD",
        rygHealth: false,
        products: "* # @",
      },
    ],

    ABG: [
        {
          projCode: "VCT-KLM-07092024-R-IM",
          status: "Active",
          progress: 40,
          startDate: "07.09.2024",
          tentativeGoLiveDate: "08.11.2024",
          lastModified: "23.09.2024",
          projectManager: "O user_name",
          layout: "ROLLOUT",
          rygHealth: true,
          products: "vc, inp, epod",
        },
        {
          projCode: "VCT-KLB-07092024-R-IM",
          status: "Active",
          progress: 20,
          startDate: "07.09.2025",
          tentativeGoLiveDate: "08.11.2025",
          lastModified: "23.09.2025",
          projectManager: "O user_name",
          layout: "STANDARD",
          rygHealth: false,
          products: "* # @",
        },
        {
            projCode: "VCT-KLB-07092024-R-IM",
            status: "Active",
            progress: 20,
            startDate: "07.09.2025",
            tentativeGoLiveDate: "08.11.2025",
            lastModified: "23.09.2025",
            projectManager: "O user_name",
            layout: "STANDARD",
            rygHealth: false,
            products: "* # @",
          },
          {
            projCode: "VCT-KLB-07092024-R-IM",
            status: "Active",
            progress: 20,
            startDate: "07.09.2025",
            tentativeGoLiveDate: "08.11.2025",
            lastModified: "23.09.2025",
            projectManager: "O user_name",
            layout: "STANDARD",
            rygHealth: false,
            products: "* # @",
          },
          {
            projCode: "VCT-KLB-07092024-R-IM",
            status: "Active",
            progress: 20,
            startDate: "07.09.2025",
            tentativeGoLiveDate: "08.11.2025",
            lastModified: "23.09.2025",
            projectManager: "O user_name",
            layout: "STANDARD",
            rygHealth: false,
            products: "* # @",
          },
          {
            projCode: "VCT-KLB-07092024-R-IM",
            status: "Active",
            progress: 90,
            startDate: "07.09.2025",
            tentativeGoLiveDate: "08.11.2025",
            lastModified: "23.09.2025",
            projectManager: "O user_name",
            layout: "STANDARD",
            rygHealth: false,
            products: "* # @",
          },
      ],
    // Add data for ABG and UTCL similarly...
  };

  return (
    <div
      className={`p-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}>

      {Object.keys(rowData).map((customer) => (
        <div key={customer} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{customer} Projects</h2>
          <div
            className={`ag-theme-alpine${
              darkMode ? "-dark" : ""
            } w-full`}
          >
            <AgGridReact
              rowData={rowData[customer]}
              columnDefs={columnDefs}
              rowClassRules={rowClassRules}
              defaultColDef={{}}
              domLayout='autoHeight'
            />
            <style jsx global>{`
        .rag-red {
          background-color: rgba(255, 0, 0, 0.2); /* Light red background */
        }
      `}</style>
          </div>
        </div>
      ))}
    </div>
  );
};

// Renderers for custom behavior


const ProgressRenderer = (params: Params) => {
  return <div className="pt-2"><ProgressBar value={params.value} />value</div> ;
};

const RYGHealthRenderer = (params: Params) => {
    const [checked, setChecked] = useState(!!params.value);
  
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (params.data) {
        setChecked(e.target.checked);
        params.data.rygHealth = e.target.checked; // Update the rygHealth state
      }
    };
  
    return (
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange} // Handle checkbox change
        />
      </label>
    );
  };


export default CustomerSiteTable;