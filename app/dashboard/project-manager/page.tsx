"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { FolderPlus, CheckCircle, AlertCircle, Loader2, Package2, FileText, Plus, ExternalLink, FileEdit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSession } from "next-auth/react"
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from 'next/navigation'

// --- Types --- 

type ModuleInfo = {
  id: string; // Module ID
  name: string; // Module Name
  poSiteModuleId: string;
  assignmentId: string;
};

type SiteInfoForAssignment = {
  id: string; // Site ID
  name: string; // Site Name
  code: string; // Site Code
  modules: ModuleInfo[];
};

type CustomerInfoForAssignment = {
  id: string; // Customer ID
  name: string; // Customer Name
  sites: SiteInfoForAssignment[];
};

type SiteInfoForProject = {
  id: string;
  name: string;
  code: string;
  modules: Array<{ id: string; name: string; poSiteModuleId?: string }>;
};

type ProjectInfo = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  sites: SiteInfoForProject[];
  projectPlan: { id: string } | null;
};

// --- Component --- 

export default function ProjectManager() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('create');
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [assignedModulesData, setAssignedModulesData] = useState<CustomerInfoForAssignment[]>([]);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [selectedPoSiteModuleIds, setSelectedPoSiteModuleIds] = useState<string[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);

  // --- Data Fetching --- 

  useEffect(() => {
    if (status === "authenticated") {
      fetchAssignedModules();
      fetchProjects();
    }
  }, [status]);

  const fetchAssignedModules = async () => {
    setLoadingAssigned(true);
    try {
      const response = await fetch('/api/project-manager/assigned-modules');
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = errorText ? JSON.parse(errorText) : { error: "Unknown server error" };
        throw new Error(errorData.error || "Failed to load assigned modules");
      }
      
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        setAssignedModulesData([]);
        return;
      }

      const data = JSON.parse(responseText);
      console.log('Fetched Assigned Modules:', data); 
      setAssignedModulesData(data);

      if (data.length > 0) {
        // Optional: Show a toast if new modules are available
        // toast({ title: "Modules Ready", description: `Modules available for project creation.` });
      }

    } catch (error: any) {
      console.error('Error fetching assigned modules:', error);
      toast({
        title: "Error Loading Modules",
        description: error.message || "Could not load assigned modules. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingAssigned(false);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch('/api/project-manager/projects');
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = errorText ? JSON.parse(errorText) : { error: "Unknown server error" };
        throw new Error(errorData.error || "Failed to load projects");
      }
      
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        setProjects([]);
        return;
      }

      const data = JSON.parse(responseText);
      console.log('Fetched Projects:', data); 
      setProjects(data);

    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error Loading Projects",
        description: error.message || "Could not load project portfolio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  // --- Event Handlers --- 

  const handleModuleSelection = (poSiteModuleId: string) => {
    setSelectedPoSiteModuleIds(prev => 
      prev.includes(poSiteModuleId) 
        ? prev.filter(id => id !== poSiteModuleId) 
        : [...prev, poSiteModuleId]
    );
  };

  const handleSelectAllCustomerModules = (customer: CustomerInfoForAssignment) => {
    const allModuleIds = customer.sites.flatMap(site => 
      site.modules.map(module => module.poSiteModuleId)
    );
    // Check if all are already selected
    const allSelected = allModuleIds.every(id => selectedPoSiteModuleIds.includes(id));

    if (allSelected) {
      // Deselect all
      setSelectedPoSiteModuleIds(prev => prev.filter(id => !allModuleIds.includes(id)));
    } else {
      // Select all (add unique)
      setSelectedPoSiteModuleIds(prev => [...new Set([...prev, ...allModuleIds])]);
    }
  };

  const handleCreateProjectClick = () => {
    if (!newProjectName || !newProjectCode) {
      toast({ title: "Missing Details", description: "Please enter a project name and code.", variant: "destructive" });
      return;
    }
    if (selectedPoSiteModuleIds.length === 0) {
      toast({ title: "No Modules Selected", description: "Please select at least one module.", variant: "destructive" });
      return;
    }
    setCreateDialogOpen(true);
  };

  const confirmCreateProject = async () => {
    setCreatingProject(true);
    const loadingToast = toast({ title: "Creating Project...", description: "Please wait." });

    try {
      // Derive the sites structure from the selected modules for metadata
      const sitesForMetadata: SiteInfoForProject[] = [];
      const siteMap = new Map<string, SiteInfoForProject>();

      assignedModulesData.forEach(customer => {
        customer.sites.forEach(site => {
          site.modules.forEach(module => {
            if (selectedPoSiteModuleIds.includes(module.poSiteModuleId)) {
              if (!siteMap.has(site.id)) {
                siteMap.set(site.id, { 
                  id: site.id, 
                  name: site.name, 
                  code: site.code, 
                  modules: [] 
                });
              }
              siteMap.get(site.id)?.modules.push({ id: module.id, name: module.name });
            }
          });
        });
      });
      sitesForMetadata.push(...siteMap.values());

      const response = await fetch('/api/project-manager/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          code: newProjectCode,
          poSiteModuleIds: selectedPoSiteModuleIds,
          sites: sitesForMetadata // Pass the derived structure
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorData = errorText ? JSON.parse(errorText) : { error: "Unknown server error" };
        throw new Error(errorData.error || "Failed to create project");
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error("Empty response from server");
      }
      
      const responseData = JSON.parse(responseText);
      loadingToast.dismiss();

      toast({ title: "Project Created", description: responseData.message, variant: "default" });

      // Reset form and state
      setCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectCode('');
      setSelectedPoSiteModuleIds([]);
      
      // Refresh data
      fetchAssignedModules(); // Update available modules
      
      // Navigate or refresh portfolio
      if (responseData.nextStep === 'projectPlan' && responseData.projectPlanUrl) {
        toast({ title: "Navigating...", description: "Opening Project Plan." });
        setTimeout(() => router.push(responseData.projectPlanUrl), 800);
      } else {
        fetchProjects(); // Refresh portfolio list
        setActiveTab('portfolio'); // Switch to portfolio view
      }

    } catch (error: any) {
      loadingToast.dismiss();
      console.error('Error creating project:', error);
      toast({
        title: "Project Creation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setCreatingProject(false);
    }
  };

  const openProjectPlan = (projectId: string) => {
    router.push(`/dashboard/project-plan?projectId=${projectId}`);
  };

  // --- Memos / Calculated Values --- 

  const totalAssignedModulesCount = useMemo(() => {
    return assignedModulesData.reduce((custCount, customer) => 
      custCount + customer.sites.reduce((siteCount, site) => 
        siteCount + site.modules.length, 0), 0);
  }, [assignedModulesData]);

  // --- Render Logic --- 

  if (status === "loading") {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-6"><Card><CardContent className="py-10 text-center"><AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">Authentication Required</h2><p className="mt-2 text-sm text-muted-foreground">Please sign in.</p></CardContent></Card></div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-4 text-primary">Project Manager</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="border bg-background">
          <TabsTrigger value="create">Create Project</TabsTrigger>
          <TabsTrigger value="portfolio">Project Portfolio</TabsTrigger>
        </TabsList>
        
        {/* Create Project Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>Select assigned modules and define a new project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input 
                    id="projectName" 
                    placeholder="Enter project name" 
                    value={newProjectName} 
                    onChange={(e) => setNewProjectName(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="projectCode">Project Code</Label>
                  <Input 
                    id="projectCode" 
                    placeholder="Enter unique project code" 
                    value={newProjectCode} 
                    onChange={(e) => setNewProjectCode(e.target.value)} 
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateProjectClick}
                disabled={selectedPoSiteModuleIds.length === 0 || !newProjectName || !newProjectCode || creatingProject}
              >
                {creatingProject 
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> 
                  : <><FolderPlus className="h-4 w-4 mr-2" /> Create Project ({selectedPoSiteModuleIds.length} modules)</>
                }
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Modules for Project Creation</CardTitle>
              <CardDescription>Modules assigned to you that are not yet part of a project.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAssigned ? (
                <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : totalAssignedModulesCount === 0 ? (
                <div className="text-center py-12"><Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>No modules available for project creation.</p></div>
              ) : (
                <div className="space-y-6">
                  {assignedModulesData.map(customer => (
                    <div key={customer.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-primary">{customer.name}</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectAllCustomerModules(customer)}
                        >
                          Select/Deselect All ({customer.sites.reduce((p, c) => p + c.modules.length, 0)})
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {customer.sites.map(site => (
                          <div key={site.id} className="border-l-4 border-slate-200 pl-4 py-2">
                            <h4 className="font-medium mb-2">{site.name} ({site.code})</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {site.modules.map(module => (
                                <div 
                                  key={module.poSiteModuleId}
                                  className={`flex items-center space-x-2 p-2 border rounded cursor-pointer ${selectedPoSiteModuleIds.includes(module.poSiteModuleId) ? 'bg-primary/10 border-primary/30' : 'hover:bg-slate-50'}`}
                                  onClick={() => handleModuleSelection(module.poSiteModuleId)}
                                >
                                  <Checkbox 
                                    id={`module-${module.poSiteModuleId}`}
                                    checked={selectedPoSiteModuleIds.includes(module.poSiteModuleId)}
                                    onCheckedChange={() => {}} // Handled by div click
                                  />
                                  <Label htmlFor={`module-${module.poSiteModuleId}`} className="cursor-pointer">{module.name}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Portfolio</CardTitle>
              <CardDescription>Projects you have created.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p>You have not created any projects yet.</p><Button onClick={() => setActiveTab('create')}><Plus className="h-4 w-4 mr-2" />Create First Project</Button></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Sites</TableHead>
                      <TableHead>Modules</TableHead>
                      <TableHead>Plan Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map(project => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.code}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {project.sites.map(site => (
                              <Badge key={site.id} variant="secondary">{site.name}</Badge>
                            ))}
                            {project.sites.length === 0 && <span className="text-xs text-muted-foreground">N/A</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {project.sites.flatMap(site => site.modules).map(module => (
                              <Badge key={module.id} variant="outline" className="bg-slate-100">{module.name}</Badge>
                            ))}
                            {project.sites.flatMap(site => site.modules).length === 0 && <span className="text-xs text-muted-foreground">N/A</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {project.projectPlan ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Created</Badge>
                          ) : (
                            <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Needed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openProjectPlan(project.id)}
                          >
                            <FileEdit className="w-4 h-4 mr-2" />
                            View/Edit Plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Project Creation</DialogTitle>
          </DialogHeader>
          <div className="py-4"><p>Create project "<span className='font-semibold'>{newProjectName}</span>" (<code>{newProjectCode}</code>) with {selectedPoSiteModuleIds.length} selected module(s)?</p></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmCreateProject} disabled={creatingProject}>
              {creatingProject ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Confirm & Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 