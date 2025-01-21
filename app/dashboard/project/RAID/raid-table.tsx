"use client";
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

interface RaidItem {
  id: number;
  category: 'Risk' | 'Assumption' | 'Issue' | 'Dependency';
  name: string;
  probability: number;
  status: 'Open' | 'Closed' | 'Maybe';
  dateRegistered: string;
  dateClosed: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  owner: string;
  remarks: string;
}

const initialData: RaidItem[] = [
  {
    id: 1,
    category: 'Risk',
    name: 'Resource Availability',
    probability: 75,
    status: 'Open',
    dateRegistered: '2024-01-15',
    dateClosed: '',
    priority: 'High',
    owner: 'John Doe',
    remarks: 'Key resources might not be available during critical project phases'
  }
];

export function RaidTable() {
  const [data, setData] = useState<RaidItem[]>(initialData);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: keyof RaidItem;
  } | null>(null);

  const handleAddRow = () => {
    const newId = Math.max(...data.map(item => item.id), 0) + 1;
    const newRow: RaidItem = {
      id: newId,
      category: 'Risk',
      name: '',
      probability: 0,
      status: 'Open',
      dateRegistered: format(new Date(), 'yyyy-MM-dd'),
      dateClosed: '',
      priority: 'Medium',
      owner: '',
      remarks: ''
    };
    setData([...data, newRow]);
  };

  const handleCellEdit = (id: number, field: keyof RaidItem, value: any) => {
    setData(data.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const renderCell = (item: RaidItem, field: keyof RaidItem) => {
    const isEditing = editingCell?.id === item.id && editingCell?.field === field;

    const startEditing = () => {
      setEditingCell({ id: item.id, field });
    };

    const finishEditing = () => {
      setEditingCell(null);
    };

    switch (field) {
      case 'category':
        return (
          <Select
            value={item[field]}
            onValueChange={(value) => handleCellEdit(item.id, field, value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Risk">Risk</SelectItem>
              <SelectItem value="Assumption">Assumption</SelectItem>
              <SelectItem value="Issue">Issue</SelectItem>
              <SelectItem value="Dependency">Dependency</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'status':
        return (
          <Select
            value={item[field]}
            onValueChange={(value) => handleCellEdit(item.id, field, value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
              <SelectItem value="Maybe">Maybe</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'priority':
        return (
          <Select
            value={item[field]}
            onValueChange={(value) => handleCellEdit(item.id, field, value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'dateRegistered':
      case 'dateClosed':
        return (
          <Input
            type="date"
            value={item[field]}
            onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
            className="h-8"
          />
        );

      case 'probability':
        return (
          <Input
            type="number"
            min="0"
            max="100"
            value={item[field]}
            onChange={(e) => handleCellEdit(item.id, field, parseInt(e.target.value))}
            className="h-8"
          />
        );

      case 'remarks':
        return (
          <div className="relative group">
            <div className="truncate max-w-[200px]" title={item[field]}>
              {isEditing ? (
                <Input
                  value={item[field]}
                  onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
                  onBlur={finishEditing}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <div onClick={startEditing}>{item[field]}</div>
              )}
            </div>
            <div className="absolute hidden group-hover:block bg-white p-2 border rounded shadow-lg z-10 max-w-[300px] whitespace-normal">
              {item[field]}
            </div>
          </div>
        );

      case 'id':
        return item[field];

      default:
        return isEditing ? (
          <Input
            value={item[field as keyof RaidItem]}
            onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
            onBlur={finishEditing}
            autoFocus
            className="h-8"
          />
        ) : (
          <div onClick={startEditing}>{item[field as keyof RaidItem]}</div>
        );
    }
  };

  return (
    <div className="space-y-4 px-2">
      <h1 className='font-semibold text-2xl pl-3'>RAID LOG</h1>
      <div className="flex justify-end">
        <Button onClick={handleAddRow}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25px]">ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Probability%</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Reg.</TableHead>
              <TableHead>Date Closed</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{renderCell(item, 'id')}</TableCell>
                <TableCell>{renderCell(item, 'category')}</TableCell>
                <TableCell>{renderCell(item, 'name')}</TableCell>
                <TableCell>{renderCell(item, 'probability')}</TableCell>
                <TableCell>{renderCell(item, 'status')}</TableCell>
                <TableCell>{renderCell(item, 'dateRegistered')}</TableCell>
                <TableCell>{renderCell(item, 'dateClosed')}</TableCell>
                <TableCell>{renderCell(item, 'priority')}</TableCell>
                <TableCell>{renderCell(item, 'owner')}</TableCell>
                <TableCell>{renderCell(item, 'remarks')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}