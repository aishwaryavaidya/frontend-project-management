import TaskTable from './components/TaskTable';
import GanttChart from './components/GanttChart';
import { prisma } from '@/prisma/db';

export default async function Home() {
  const tasks = await prisma.task.findMany({
    orderBy: { siNo: 'asc' }
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MS Project Clone</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <TaskTable initialTasks={tasks} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <GanttChart tasks={tasks} />
          </div>
        </div>
      </div>
    </main>
  );
}