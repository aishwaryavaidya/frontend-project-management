"use client";

import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'ABG', invoicesPending: 5, amtPending: 250000 },
  { name: 'JK', invoicesPending: 1, amtPending: 70000 },
  { name: 'UTCL', invoicesPending: 8, amtPending: 80000 },
  { name: 'VICAT', invoicesPending: 1, amtPending: 50000 },
  { name: 'JSW', invoicesPending: 5, amtPending: 150000 },
  { name: 'SCM', invoicesPending: 7, amtPending: 350000 },
  { name: 'DCM', invoicesPending: 9, amtPending: 850000 },
  { name: 'DPF', invoicesPending: 7, amtPending: 450000 },
  { name: 'Amrit', invoicesPending: 2, amtPending: 50000 },
];

export default class InvoicePending extends PureComponent {
  render() {
    return (
      <div
        className="w-full text-sm bg-white dark:bg-black dark:text-gray-200 shadow-md rounded-lg overflow-x-auto"
        style={{ maxWidth: '100%' }}
      >
        <div style={{ width: `${data.length * 100}px`, minWidth: '500px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 25,
                left: 15,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#4CAF50" />
              <YAxis yAxisId="right" orientation="right" stroke="#2196F3" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="invoicesPending"
                fill="#4CAF50"
                name="Invoices Pending"
                barSize={10}
              />
              <Bar
                yAxisId="right"
                dataKey="amtPending"
                fill="#2196F3"
                name="Amount Pending (Rs.)"
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}
