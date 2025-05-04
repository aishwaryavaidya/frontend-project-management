'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

const DashboardNavigation: FC = () => {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Planning
      </Link>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <Home className="w-5 h-5 mr-2" />
        Home
      </Link>
    </div>
  );
};

export default DashboardNavigation; 