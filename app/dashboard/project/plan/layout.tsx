import React from 'react';
import Link from 'next/link';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
    {/* Navigation Bar */}
    <nav className="bg-blue-600 text-white p-2 shadow-md w-full">
        <ul className="flex space-x-8 justify-center items-center">
        <li>
            <Link href="/dashboard/plan" className="hover:underline font-medium">
            Plan
            </Link>
        </li>
        <li>
            <Link href="/dashboard/resources" className="hover:underline font-medium">
            Resources
            </Link>
        </li>
        <li>
            <Link href="/dashboard/documents" className="hover:underline font-medium">
            Documents
            </Link>
        </li>
        <li>
            <Link href="/dashboard/raid" className="hover:underline font-medium">
            RAID
            </Link>
        </li>
        <li>
            <Link href="/dashboard/ryg" className="hover:underline font-medium">
            RYG
            </Link>
        </li>
        <li>
            <Link href="/dashboard/project/proj-timeline" className="hover:underline font-medium">
            Timeline
            </Link>
        </li>
        <li>
            <Link href="/dashboard/project/gantt" className="hover:underline font-medium">
            Gantt
            </Link>
        </li>
        </ul>
    </nav>

    {/* Main Content */}
    <main className="p-6 flex-grow w-full">
        {children}
    </main>
    </div>

    
  );
};

export default Layout;
