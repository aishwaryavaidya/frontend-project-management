"use client";

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
// import './ProjectTable.css';
import { useState } from 'react';
import { Modal, Input, DatePicker, Select, Button } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface RowData {
  index: number;
  taskName: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  dependency: number | null;
  [key: string]: any;
}

interface ColumnDef {
  headerName: string;
  field: string;
  editable?: boolean;
  sortable?: boolean;
  filter?: boolean | string;
  pinned?: 'left' | 'right';
}

export default function ProjectTable() {
  const initialData: RowData[] = [
    { index: 1, taskName: 'Design', startDate: '2024-11-01', endDate: '2024-11-10', assignedTo: '', dependency: null },
    { index: 2, taskName: 'Development', startDate: '2024-11-11', endDate: '2024-12-15', assignedTo: '', dependency: 1 },
    { index: 3, taskName: 'Testing', startDate: '2024-12-16', endDate: '2024-12-30', assignedTo: '', dependency: 2 },
  ];

  const [rowData, setRowData] = useState<RowData[]>(initialData);
  const [columnDefs, setColumnDefs] = useState<ColumnDef[]>([
    { headerName: 'Index', field: 'index', pinned: 'left', editable: false },
    { headerName: 'Task Name', field: 'taskName', pinned: 'left', editable: true, sortable: true, filter: true },
    { headerName: 'Start Date', field: 'startDate', editable: true, sortable: true, filter: 'agDateColumnFilter' },
    { headerName: 'End Date', field: 'endDate', editable: true, sortable: true, filter: 'agDateColumnFilter' },
    { headerName: 'Assigned To', field: 'assignedTo', editable: false },
    { headerName: 'Dependency', field: 'dependency', editable: true, sortable: true, filter: true },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<RowData | null>(null);
  const [assigneeNames, setAssigneeNames] = useState<string[]>([]);
  const [designation, setDesignation] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const openModal = (task: RowData) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTask(null);
    setAssigneeNames([]);
    setDesignation('');
    setDateRange(null);
  };

  const handleSave = () => {
    if (!currentTask || !dateRange) return;

    const updatedData = rowData.map((row) => {
      if (row.index === currentTask.index) {
        return {
          ...row,
          assignedTo: assigneeNames.join(', '),
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        };
      }
      return row;
    });

    setRowData(updatedData);
    closeModal();
  };

  const onCellContextMenu = (params: any) => {
    if (params.colDef.field === 'assignedTo') {
      openModal(params.data);
    }
  };

  const validateDependency = (updatedRow: RowData, dependencyIndex: number | null) => {
    if (dependencyIndex === null) return true;

    const dependencyTask = rowData.find((row) => row.index === dependencyIndex);
    if (!dependencyTask) return false;

    return dayjs(updatedRow.startDate).isAfter(dayjs(dependencyTask.endDate));
  };

  const onCellValueChanged = (params: any) => {
    const { data, colDef, newValue } = params;
    if (colDef.field === 'dependency') {
      const dependencyIndex = parseInt(newValue, 10);

      if (validateDependency(data, dependencyIndex)) {
        const updatedData = rowData.map((row) =>
          row.index === data.index ? { ...row, dependency: dependencyIndex } : row
        );
        setRowData(updatedData);
      } else {
        alert("The dependency task's end date must be before this task's start date.");
      }
    }
  };

  const addColumn = () => {
    const newFieldName = `customField${columnDefs.length}`;
    const newColumn: ColumnDef = {
      headerName: `Custom Column ${columnDefs.length - 5}`,
      field: newFieldName,
      editable: true,
      sortable: true,
      filter: true,
    };

    setColumnDefs([...columnDefs, newColumn]);

    const updatedRowData = rowData.map((row) => ({
      ...row,
      [newFieldName]: '', // Initialize new field in each row
    }));

    setRowData(updatedRowData);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Project Planning Table</h1>
      <Button onClick={addColumn} type="primary" className="mb-4">
        Add Column
      </Button>
      <div className="ag-theme-alpine dark:bg-gray-700 rounded-lg shadow-md" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellContextMenu={onCellContextMenu}
          onCellValueChanged={onCellValueChanged}
        />
      </div>

      <Modal
        title={currentTask ? `Assign Task: ${currentTask.taskName}` : ''}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        className="dark:bg-gray-900 dark:text-gray-100"
      >
        <div className="mb-4">
          <label>Assignee Name(s):</label>
          <Select
            mode="multiple"
            placeholder="Select assignees"
            onChange={(value) => setAssigneeNames(value as string[])}
            className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            <Option value="Alice">Alice</Option>
            <Option value="Bob">Bob</Option>
            <Option value="Charlie">Charlie</Option>
          </Select>
        </div>

        <div className="mb-4">
          <label>Designation:</label>
          <Input
            placeholder="Enter designation"
            onChange={(e) => setDesignation(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <div className="mb-4">
          <label>Start and End Date:</label>
          <RangePicker
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            className="w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {dateRange && (
          <div>
            <label>Total Days:</label>
            <p>{dateRange[1].diff(dateRange[0], 'day')} days</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
