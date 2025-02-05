"use client";
import React, { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertTriangle, CheckCircle, XCircle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { KPIAnalytics } from './KPIAnalytics';

interface KPI {
  id: string;
  parameter: string;
  status: 'red' | 'yellow' | 'green';
  actualDate: string;
  remarks: { [key: string]: string };
}

const initialKPIs: KPI[] = [
  {
    id: '1',
    parameter: 'Go-Live Date',
    status: 'green',
    actualDate: '2024-03-15',
    remarks: { 'W1': 'On track', 'W2': 'Successfully deployed' }
  },
  {
    id: '2',
    parameter: 'First Invoice Date',
    status: 'yellow',
    actualDate: '2024-03-20',
    remarks: { 'W1': 'Pending approval', 'W2': 'Delayed due to client feedback' }
  },
];

const defaultParameters = [
  'Go-Live Date', 'First Invoice Date', 'SOW', 'Project Plan', 'Solution Evaluation',
  'TAT Reduction', 'Man Power Optimization', 'TPH', 'Hardware status / challenges',
  'Software status / challenges', 'Integration status / challenges', 'Infra status / challenges',
  'Process status / challenges', 'Resource status / challenges', 'Travel status / challenges',
  'Billing status / challenges', 'Logistics status / challenges', 'Procurement status / challenges',
  'Document status / challenges', 'Signoff status / challenges', 'Open points at the customer end',
  'Support Handover', 'Automated Billing Module', 'Sustainability monitoring', 'Others'
];

export function KPITracker() {
  const [kpis, setKpis] = useState<KPI[]>(initialKPIs);
  const [weeks, setWeeks] = useState(['W1', 'W2']);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [customParameter, setCustomParameter] = useState('');
  const [showCustomParameterInput, setShowCustomParameterInput] = useState(false);

  const addNewWeek = () => {
    const weekNumber = prompt('Enter week number:');
    if (weekNumber) {
      const newWeek = `W${weekNumber}`;
      if (weeks.includes(newWeek)) {
        toast.error(`Week ${weekNumber} already exists`);
        return;
      }
      setWeeks([...weeks, newWeek]);
      setKpis(kpis.map(kpi => ({
        ...kpi,
        remarks: { ...kpi.remarks, [newWeek]: '' }
      })));
      toast.success(`Added Week ${weekNumber} column`);
    }
  };

  const deleteWeek = (week: string) => {
    if (confirm(`Are you sure you want to delete ${week} column?`)) {
      setWeeks(weeks.filter(w => w !== week));
      setKpis(kpis.map(kpi => {
        const newRemarks = { ...kpi.remarks };
        delete newRemarks[week];
        return { ...kpi, remarks: newRemarks };
      }));
      toast.success(`Deleted ${week} column`);
    }
  };

  const deleteKPI = (id: string) => {
    if (confirm('Are you sure you want to delete this KPI?')) {
      setKpis(kpis.filter(kpi => kpi.id !== id));
      toast.success('KPI deleted successfully');
    }
  };

  const addNewKPI = () => {
    const newKPI: KPI = {
      id: String(kpis.length + 1),
      parameter: '',
      status: 'green',
      actualDate: '',
      remarks: weeks.reduce((acc, week) => ({ ...acc, [week]: '' }), {})
    };
    setKpis([...kpis, newKPI]);
    toast.success('Added new KPI row');
  };

  const handleCellEdit = (id: string, field: string, value: any) => {
    if (field === 'parameter' && value === 'Others') {
      setShowCustomParameterInput(true);
      setEditingCell({ id, field });
      return;
    }

    setKpis(kpis.map(kpi => {
      if (kpi.id === id) {
        if (field.startsWith('remarks.')) {
          const week = field.split('.')[1];
          return {
            ...kpi,
            remarks: { ...kpi.remarks, [week]: value }
          };
        }
        return { ...kpi, [field]: value };
      }
      return kpi;
    }));
    setEditingCell(null);
  };

  const handleCustomParameterSubmit = (id: string) => {
    if (customParameter.trim()) {
      handleCellEdit(id, 'parameter', customParameter.trim());
      setCustomParameter('');
      setShowCustomParameterInput(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'red': return 'bg-red-500 hover:bg-red-600';
      case 'yellow': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'green': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'red': return <XCircle className="w-4 h-4" />;
      case 'yellow': return <AlertTriangle className="w-4 h-4" />;
      case 'green': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          KPI Tracker
        </h1>
        <div className="space-x-4">
          <Button onClick={addNewWeek} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Week
          </Button>
          <Button onClick={addNewKPI} variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add KPI
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">Index</th>
              <th className="p-3 text-left font-medium">Evaluation Parameters</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Actual Date</th>
              {weeks.map(week => (
                <th key={week} className="p-3 text-left font-medium relative">
                  <div className="flex items-center justify-between">
                    <span>Remarks {week}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      onClick={() => deleteWeek(week)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, index) => (
              <tr key={kpi.id} className="border-t hover:bg-muted/50 transition-colors">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">
                  {editingCell?.id === kpi.id && editingCell?.field === 'parameter' ? (
                    showCustomParameterInput ? (
                      <div className="flex gap-2">
                        <Input
                          value={customParameter}
                          onChange={(e) => setCustomParameter(e.target.value)}
                          placeholder="Enter parameter name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCustomParameterSubmit(kpi.id);
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCustomParameterSubmit(kpi.id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Select
                        defaultValue={kpi.parameter}
                        onValueChange={(value) => handleCellEdit(kpi.id, 'parameter', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultParameters.map(param => (
                            <SelectItem key={param} value={param}>{param}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  ) : (
                    <div
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => setEditingCell({ id: kpi.id, field: 'parameter' })}
                    >
                      {kpi.parameter || 'Click to select'}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <Select
                    defaultValue={kpi.status}
                    onValueChange={(value: 'red' | 'yellow' | 'green') => handleCellEdit(kpi.id, 'status', value)}
                  >
                    <SelectTrigger className={`w-24 text-white ${getStatusColor(kpi.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">
                        <div className="flex items-center">
                          <XCircle className="w-4 h-4 mr-2 text-red-500" />
                          Red
                        </div>
                      </SelectItem>
                      <SelectItem value="yellow">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                          Yellow
                        </div>
                      </SelectItem>
                      <SelectItem value="green">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Green
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">
                  {editingCell?.id === kpi.id && editingCell?.field === 'actualDate' ? (
                    <Input
                      type="date"
                      defaultValue={kpi.actualDate}
                      onBlur={(e) => handleCellEdit(kpi.id, 'actualDate', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => setEditingCell({ id: kpi.id, field: 'actualDate' })}
                    >
                      {kpi.actualDate || 'Click to set date'}
                    </div>
                  )}
                </td>
                {weeks.map(week => (
                  <td key={week} className="p-3">
                    {editingCell?.id === kpi.id && editingCell?.field === `remarks.${week}` ? (
                      <Input
                        defaultValue={kpi.remarks[week]}
                        onBlur={(e) => handleCellEdit(kpi.id, `remarks.${week}`, e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => setEditingCell({ id: kpi.id, field: `remarks.${week}` })}
                      >
                        {kpi.remarks[week] || 'Click to add remarks'}
                      </div>
                    )}
                  </td>
                ))}
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-100 hover:text-red-600"
                    onClick={() => deleteKPI(kpi.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}