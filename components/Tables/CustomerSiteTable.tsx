"use client";

import { useState, useEffect } from 'react'
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community"; // Import type for ColDef
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import ProgressBar from "./ProgressBar"; // A custom progress bar component


//type defining
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
//////////////////////

export default function CustomerSiteTable() {

    const [mode, setMode] = useState<boolean>(false);

    useEffect(() => {
        // Check the current color scheme preference
        const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
        // Set the mode based on the preference
        setMode(prefersDarkMode);
    
        // Add an event listener to update the mode dynamically when the preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
          setMode(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

    // Cleanup the event listener on component unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

    const ProgressRenderer = (params: Params) => {
        return <div className="pt-1"><ProgressBar value={params.value} /></div> ;
    };

    const rowClassRules = {
        "rag-red": (params: any) => params.data?.rygHealth === true,
    };

  // Common columns
  const columnDefs: ColDef<RowData>[] = [
    { 
      headerName: "Proj Code", 
      field: "projCode", 
      flex: 2.5,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Status",
      field: "status",
      flex: 1.5,
      cellClassRules: {
        'green-cell': p => p.value == "Active",
        'red-cell': p => p.value == "Inactive",
      },
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Progress",
      field: "progress",
      flex: 1.5,
      cellRenderer: ProgressRenderer as any,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Start Date", 
      field: "startDate", 
      sortable: true,
      flex: 2,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "GO Live",
      field: "tentativeGoLiveDate",
      flex: 2,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Last Modified",
      field: "lastModified", 
      flex: 2,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Project Manager", 
      field: "projectManager", 
      flex: 2,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Layout",
      field: "layout", 
      flex: 1.8,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "RYG",
      field: "rygHealth",
      flex: 1,
      headerClass: 'text-center', // Align column header text to center
    },
    { 
      headerName: "Products",
      field: "products", 
      flex: 1.5,
      headerClass: 'text-center', // Align column header text to center
    },
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

    ABG:[
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
    };
  

  return (
    <div className="p-4 light:text-black bg-slate-50 dark:text-white dark:bg-neutral-900">
      {Object.keys(rowData).map((customer) => (
        <div key={customer} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{customer} Projects</h2>
          
          <div className={mode ? "ag-theme-material" : "ag-theme-material-dark"}>
            <AgGridReact
              rowData={rowData[customer]}
              columnDefs={columnDefs}
              rowClassRules={rowClassRules}
              defaultColDef={{}}
              gridOptions={{}}
              domLayout='autoHeight'
              rowHeight={29}
            />
            </div>
            <style jsx global>{`.rag-red {background-color: rgba(255, 0, 0, 0.2)}`}</style>
          </div>
      ))}
    </div>
  )
};
