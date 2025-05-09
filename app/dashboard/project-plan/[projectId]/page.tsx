"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TaskTable from "../components/TaskTable";
import { Task } from "../types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, FileText, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// New type for assignments
type Assignment = {
  id: string;
  employeeId?: number;
  employee?: {
    id: number;
    name: string;
    role: string;
    percentage: number;
  };
  poSiteModule: {
    id: string;
    module: {
      name: string;
    };
    poSite: {
      site: {
        name: string;
      };
    };
  };
  createdAt: string;
};

export default function ProjectPlanPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: session, status } = useSession();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('taskTable');
  const { toast } = useToast();
  const [planExists, setPlanExists] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Project not found");
        } else {
          setError("Failed to load project data");
        }
        return;
      }
      
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      setError("An error occurred while loading the project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProject();
    }
  }, [projectId, status]);

  useEffect(() => {
    checkExistingPlan();
  }, [projectId]);

  const checkExistingPlan = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/plan`);
      if (response.ok) {
        const data = await response.json();
        if (data.id) {
          setPlanExists(true);
          // If plan exists, fetch tasks
          fetchTasks(data.id);
        }
      }
    } catch (error) {
      console.error("Error checking for existing plan:", error);
    }
  };

  const fetchTasks = async (planId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const createProjectPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body since we just need the projectId
      });

      if (response.ok) {
        const data = await response.json();
        setPlanExists(true);
        toast({
          title: "Success",
          description: "Project Plan created successfully",
        });
        // Refresh project details
        fetchProject();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        toast({
          title: "Error",
          description: errorData.error || "Failed to create project plan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating project plan:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add function to fetch assignments
  const fetchAssignments = async () => {
    if (!projectId) return;
    
    try {
      setLoadingAssignments(true);
      const response = await fetch(`/api/projects/${projectId}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Call fetchAssignments when component loads
  useEffect(() => {
    if (status === "authenticated") {
      fetchAssignments();
    }
  }, [projectId, status]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading project plan...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">Please sign in to view this project plan.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {planExists ? "Project Plan" : "Create Project Plan"}
          </h1>
          {project && (
            <p className="text-muted-foreground">
              {project.name} ({project.code})
            </p>
          )}
        </div>
        
        {!planExists ? (
          <Button onClick={createProjectPlan} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Create Plan
          </Button>
        ) : (
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {planExists ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="">
          {/* <TabsList>
            <TabsTrigger value="taskTable">Task Table</TabsTrigger>
            <TabsTrigger value="ganttChart">Gantt Chart</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList> */}
          
          {/* <TabsContent value="taskTable" className="space-y-4">
            <Card>
              <CardContent className="p-6"> */}
                <TaskTable projectId={projectId} initialTasks={tasks} />
              {/* </CardContent>
            </Card>
          </TabsContent> */}
          
          {/* <TabsContent value="ganttChart" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center items-center py-12">
                  <p>Gantt Chart view will be available soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
          
          {/* <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Resource Assignments</CardTitle>
                <Button size="sm" className="h-8">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Resource
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {loadingAssignments ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading assignments...</span>
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium">No Resources Assigned</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      This project doesn't have any resources assigned yet.
                    </p>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Your First Resource
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Assigned Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${assignment.employee?.name || 'user'}`} />
                                <AvatarFallback>
                                  {assignment.employee?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{assignment.employee?.name || 'Unassigned'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{assignment.employee?.role || 'N/A'}</TableCell>
                          <TableCell>{assignment.poSiteModule?.module?.name || 'Unknown'}</TableCell>
                          <TableCell>{assignment.poSiteModule?.poSite?.site?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {assignment.employee?.percentage || 0}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Click the "Create Plan" button to start a new project plan.</p>
            <p className="text-muted-foreground text-sm">
              This will allow you to create and manage tasks, track progress, and visualize your project timeline.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 