"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle, AlertCircle, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type Customer = {
  id: string
  name: string
  vertical: string
}

type ProjectManager = {
  id: string
  firstName: string
  lastName: string
  email: string
}

type Module = {
  id: string
  name: string
}

type Site = {
  id: string
  name: string
  code: string
}

type SitePO = {
  siteId: string
  siteName: string
  siteCode: string
  modules: POSiteModule[]
  selected: boolean
}

type POSiteModule = {
  id: string
  moduleId: string
  moduleName: string
  poSiteId: string
  siteId: string
  siteName: string
  siteCode: string
  isAssigned: boolean
  poId: string
  poNumber: string
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

export default function ResourceAllocation() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('pm-assign')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([])
  const [selectedPM, setSelectedPM] = useState<string>('')
  const [poSiteModules, setPOSiteModules] = useState<POSiteModule[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [customerSites, setCustomerSites] = useState<SitePO[]>([])
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [showAssigned, setShowAssigned] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingPMs, setLoadingPMs] = useState(true)

  useEffect(() => {
    // Fetch customers
    async function fetchCustomers() {
      try {
        setLoadingCustomers(true)
        const response = await fetch('/api/customers')
        if (response.ok) {
          const data = await response.json()
          setCustomers(data)
          toast({
            title: "Success",
            description: `Loaded ${data.length} customers`,
            variant: "default"
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load customers. Server returned an error.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast({
          title: "Error",
          description: "Failed to load customers. Please check your connection.",
          variant: "destructive"
        })
      } finally {
        setLoadingCustomers(false)
      }
    }

    // Fetch project managers
    async function fetchProjectManagers() {
      try {
        setLoadingPMs(true)
        const response = await fetch('/api/users?role=PROJECT_MANAGER')
        if (response.ok) {
          const data = await response.json()
          setProjectManagers(data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load project managers. Server returned an error.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching project managers:', error)
        toast({
          title: "Error",
          description: "Failed to load project managers. Please check your connection.",
          variant: "destructive"
        })
      } finally {
        setLoadingPMs(false)
      }
    }

    fetchCustomers()
    fetchProjectManagers()
  }, [toast])

  useEffect(() => {
    if (!selectedCustomer) {
      setPOSiteModules([])
      setCustomerSites([])
      setSelectedSites([])
      return
    }

    async function fetchPOSiteModules() {
      setLoading(true)
      try {
        const response = await fetch(`/api/customers/${selectedCustomer}/po-site-modules`)
        if (response.ok) {
          const data = await response.json()
          setPOSiteModules(data)
          
          // Group modules by site
          const siteMap = new Map<string, SitePO>();
          
          data.forEach((module: POSiteModule) => {
            const siteKey = module.siteId;
            
            if (!siteMap.has(siteKey)) {
              siteMap.set(siteKey, {
                siteId: module.siteId,
                siteName: module.siteName,
                siteCode: module.siteCode,
                modules: [],
                selected: false
              });
            }
            
            const site = siteMap.get(siteKey);
            if (site) {
              site.modules.push(module);
            }
          });
          
          const sitesList = Array.from(siteMap.values());
          setCustomerSites(sitesList);
          
          // Show feedback to user about loaded modules
          if (data.length > 0) {
            toast({
              title: "Modules Loaded",
              description: `${data.length} modules found across ${sitesList.length} sites.`,
              variant: "default"
            })
          } else {
            toast({
              title: "No Modules",
              description: "No modules found for this customer. Please check if POs are properly set up.",
              variant: "default"
            })
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          toast({
            title: "Error",
            description: errorData.error || "Failed to load site modules",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching PO site modules:', error)
        toast({
          title: "Error",
          description: "Failed to load site modules. Please check your connection.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPOSiteModules()
  }, [selectedCustomer, toast])

  const handleSiteSelection = (siteId: string) => {
    setSelectedSites(prev => {
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      } else {
        return [...prev, siteId];
      }
    });
    
    setCustomerSites(prev => 
      prev.map(site => 
        site.siteId === siteId 
          ? { ...site, selected: !site.selected } 
          : site
      )
    );
  }

  const handleModuleSelection = (moduleId: string) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId))
    } else {
      setSelectedModules([...selectedModules, moduleId])
    }
  }

  const handleAssignPM = async () => {
    if (!selectedPM) {
      toast({
        title: "Error",
        description: "Please select a project manager",
        variant: "destructive"
      })
      return
    }
    
    if (selectedModules.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one module",
        variant: "destructive"
      })
      return
    }

    setAssigning(true)
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectManagerId: selectedPM,
          poSiteModuleIds: selectedModules
        })
      })

      if (response.ok) {
        const assignmentData = await response.json();
        
        // Successfully assigned modules
        toast({
          title: "Success",
          description: `${selectedModules.length} modules assigned to ${
            projectManagers.find(pm => pm.id === selectedPM)?.firstName || ''
          } ${
            projectManagers.find(pm => pm.id === selectedPM)?.lastName || ''
          }`,
          variant: "default"
        })
        
        // Update the UI to show assigned modules
        setPOSiteModules(prevModules => 
          prevModules.map(module => {
            if (selectedModules.includes(module.id)) {
              return { 
                ...module, 
                isAssigned: true,
                assignedTo: {
                  id: selectedPM,
                  name: projectManagers.find(pm => pm.id === selectedPM)
                    ? `${projectManagers.find(pm => pm.id === selectedPM)?.firstName} ${projectManagers.find(pm => pm.id === selectedPM)?.lastName}`
                    : 'Project Manager'
                }
              }
            }
            return module
          })
        )
        
        // Update the customerSites state to reflect assignments
        setCustomerSites(prevSites => 
          prevSites.map(site => ({
            ...site,
            modules: site.modules.map(module => {
              if (selectedModules.includes(module.id)) {
                return {
                  ...module,
                  isAssigned: true,
                  assignedTo: {
                    id: selectedPM,
                    name: projectManagers.find(pm => pm.id === selectedPM)
                      ? `${projectManagers.find(pm => pm.id === selectedPM)?.firstName} ${projectManagers.find(pm => pm.id === selectedPM)?.lastName}`
                      : 'Project Manager'
                  }
                };
              }
              return module;
            })
          }))
        )
        
        // Clear selections
        setSelectedModules([])
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        toast({
          title: "Error",
          description: errorData.error || "Failed to assign modules",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error assigning PM:', error)
      toast({
        title: "Error",
        description: "Failed to assign modules. Please check your connection.",
        variant: "destructive"
      })
    } finally {
      setAssigning(false)
    }
  }

  // Calculate assignment progress
  const assignedModulesCount = poSiteModules.filter(module => module.isAssigned).length
  const totalModulesCount = poSiteModules.length
  const assignmentProgress = totalModulesCount > 0 
    ? Math.round((assignedModulesCount / totalModulesCount) * 100) 
    : 0

  // Filter modules based on site selection
  const visibleModules = poSiteModules.filter(module => 
    (selectedSites.length === 0 || selectedSites.includes(module.siteId)) &&
    (!showAssigned || !module.isAssigned)
  );

  // Group modules by site for display
  const visibleModulesBySite = visibleModules.reduce((map, module) => {
    const key = `${module.siteId}-${module.siteName}-${module.siteCode}`
    if (!map[key]) {
      map[key] = []
    }
    map[key].push(module)
    return map
  }, {} as Record<string, POSiteModule[]>)

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-4 text-primary">Resource Allocation</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="border bg-background w-full sm:w-auto justify-start">
          <TabsTrigger value="pm-assign" className="text-sm">PM Assignment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pm-assign" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
            <Card className="lg:col-span-2 shadow-md border-slate-200">
              <CardHeader className="bg-slate-50 pb-2">
                <CardTitle className="text-lg text-primary">Assignment Criteria</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer" className="text-sm">Customer</Label>
                  <Select 
                    value={selectedCustomer} 
                    onValueChange={setSelectedCustomer}
                    disabled={loadingCustomers}
                  >
                    <SelectTrigger id="customer" className="h-9">
                      <SelectValue placeholder={loadingCustomers ? "Loading..." : "Select a customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.vertical})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pm" className="text-sm">Project Manager</Label>
                  <Select 
                    value={selectedPM} 
                    onValueChange={setSelectedPM}
                    disabled={loadingPMs}
                  >
                    <SelectTrigger id="pm" className="h-9">
                      <SelectValue placeholder={loadingPMs ? "Loading..." : "Select a project manager"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projectManagers.map(pm => (
                        <SelectItem key={pm.id} value={pm.id}>
                          {pm.firstName} {pm.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox 
                      id="show-assigned" 
                      checked={showAssigned}
                      onCheckedChange={(checked) => setShowAssigned(checked === true)}
                    />
                    <Label htmlFor="show-assigned" className="text-sm font-normal cursor-pointer">
                      Show already assigned modules
                    </Label>
                  </div>
                  
                  <Button 
                    onClick={handleAssignPM} 
                    disabled={!selectedCustomer || !selectedPM || selectedModules.length === 0 || assigning}
                    className="w-full"
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>Assign Selected Modules</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 shadow-md border-slate-200">
              <CardHeader className="bg-slate-50 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-primary">Modules Available for Assignment</CardTitle>
                {selectedCustomer && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="ml-2 text-xs font-normal">
                      {poSiteModules.length} total modules
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs font-normal">
                      {assignedModulesCount} assigned
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !selectedCustomer ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Select a customer to view modules
                  </div>
                ) : customerSites.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="font-medium text-lg">No Modules Found</h3>
                    <p className="text-muted-foreground">
                      This customer has no modules from purchase orders or they have all been assigned.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCustomerSites(sites => sites.map(site => ({
                              ...site,
                              selected: true
                            })));
                            setSelectedSites(customerSites.map(site => site.siteId));
                            toast({
                              title: "Sites Selected",
                              description: `All ${customerSites.length} sites selected.`,
                              variant: "default"
                            })
                          }}
                          className="h-8 text-xs"
                          disabled={customerSites.length === 0}
                        >
                          Select All Sites
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setCustomerSites(sites => sites.map(site => ({
                              ...site,
                              selected: false
                            })));
                            setSelectedSites([]);
                            setSelectedModules([]);
                            toast({
                              title: "Selection Cleared",
                              description: "All site and module selections have been cleared.",
                              variant: "default"
                            })
                          }}
                          className="h-8 text-xs"
                          disabled={selectedSites.length === 0}
                        >
                          Clear Selection
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedModules.length} modules selected
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                      {customerSites.map(site => (
                        <div 
                          key={site.siteId}
                          className={`border rounded-md p-3 transition-colors ${site.selected ? 'border-primary/50 bg-slate-50' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Checkbox 
                                id={`site-${site.siteId}`}
                                checked={site.selected}
                                onCheckedChange={() => handleSiteSelection(site.siteId)}
                                className="mr-2"
                              />
                              <Label 
                                htmlFor={`site-${site.siteId}`} 
                                className={`font-medium cursor-pointer ${site.selected ? 'text-primary' : ''}`}
                              >
                                {site.siteName}
                              </Label>
                              <span className="text-xs text-muted-foreground ml-2">({site.siteCode})</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {site.modules.filter(m => !showAssigned ? !m.isAssigned : true).length} modules
                            </Badge>
                          </div>
                          
                          {site.selected && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-3 pl-6">
                              {site.modules
                                .filter(module => !module.isAssigned || showAssigned)
                                .map(module => (
                                  <div 
                                    key={module.id}
                                    className={`flex items-center space-x-2 p-2 rounded border ${
                                      selectedModules.includes(module.id)
                                        ? 'bg-primary/10 border-primary/30'
                                        : 'hover:bg-slate-50 border-slate-200'
                                    } ${module.isAssigned ? 'opacity-60' : ''}`}
                                  >
                                    <Checkbox 
                                      id={`module-${module.id}`}
                                      checked={selectedModules.includes(module.id)}
                                      onCheckedChange={() => handleModuleSelection(module.id)}
                                      disabled={module.isAssigned}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Label 
                                        htmlFor={`module-${module.id}`}
                                        className="text-sm font-normal cursor-pointer flex-1 truncate"
                                      >
                                        {module.moduleName}
                                      </Label>
                                      {module.isAssigned && module.assignedTo && (
                                        <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                          Assigned to {module.assignedTo.name}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 