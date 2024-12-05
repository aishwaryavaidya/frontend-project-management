"use client";

import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface RowData {
  id: number;
  make: string;
  model: string;
  price: number;
}

export default function RandomTable() {
  const [rowData] = useState<RowData[]>([
    { id: 1, make: "Toyota", model: "Celica", price: 35000 },
    { id: 2, make: "Ford", model: "Mondeo", price: 32000 },
    { id: 3, make: "Porsche", model: "Boxster", price: 72000 },
    { id: 4, make: "Ford", model: "Mustang", price: 55000 },
  ]);

  const columnDefs: ColDef<RowData>[] = [
    { headerName: "Make", field: "make", sortable: true, filter: true, flex: 1 },
    { headerName: "Model", field: "model", sortable: true, filter: true, flex: 1 },
    { headerName: "Price", field: "price", sortable: true, filter: true, flex: 1 },
  ];

  // Row class rules
  const rowClassRules = {
    "rag-red": (params: any) => params.data?.make === "Ford", // Condition for "Ford"
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Red Row Example</h1>
      <div
        className="ag-theme-alpine"
        style={{ height: 400, width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          rowClassRules={rowClassRules}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          getRowId={(params) => params.data.id.toString()} // Unique row IDs
        />
      </div>
      <style jsx global>{`
        .rag-red {
          background-color: rgba(255, 0, 0, 0.2); /* Light red background */
        }
      `}</style>
    </div>
  );
}
