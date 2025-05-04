'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import TaskTable from './components/TaskTable';
import HolidayButton from './components/HolidayButton';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download } from 'lucide-react';
import Link from 'next/link';

export default function ProjectPlanPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load project details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Project ID Missing</h1>
          <p className="text-muted-foreground">Please select a project to create or edit a plan.</p>
          <Link href="/dashboard/project-manager">
            <Button>Go to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/project-manager">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {project ? project.name : 'Project Plan'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Plan
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export as Excel
          </Button>
          <HolidayButton />
        </div>
      </div>
      
      {project && (
        <div className="bg-muted p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project Code</p>
              <p>{project.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project Manager</p>
              <p>{project.projectManager?.firstName} {project.projectManager?.lastName}</p>
            </div>
          </div>
        </div>
      )}
      
      <TaskTable projectId={projectId} />
    </div>
  );
} 