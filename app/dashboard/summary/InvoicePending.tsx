"use client";

import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  {
    name: 'ABG',
    invoicesPending: 5,  // No. of invoices pending
    amtPending: 250000,   // Amount pending in Rs.
  },
  {
    name: 'JK',
    invoicesPending: 1,  // No. of invoices pending
    amtPending: 70000,    // Amount pending in Rs.
  },
  {
    name: 'UTCL',
    invoicesPending: 8,  // No. of invoices pending
    amtPending: 80000,    // Amount pending in Rs.
  },
  {
    name: 'VICAT',
    invoicesPending: 1,  // No. of invoices pending
    amtPending: 50000,    // Amount pending in Rs.
  },
  {
    name: 'JSW',
    invoicesPending: 5,  // No. of invoices pending
    amtPending: 150000,   // Amount pending in Rs.
  },
];

export default class InvoicePending extends PureComponent {
  render() {
    return (
      <div className="w-full text-sm bg-white dark:bg-black dark:text-gray-200 shadow-md rounded-lg">
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
            <Bar yAxisId="left" dataKey="invoicesPending" fill="#4CAF50" name="Invoices Pending" />
            <Bar yAxisId="right" dataKey="amtPending" fill="#2196F3" name="Amount Pending (Rs.)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
