"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusCircle, Save, Loader2, Package2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type Customer = {
  id: string
  name: string
  vertical: string
}

type Site = {
  id: string
  name: string
  code: string
}

type Module = {
  id: string
  name: string
}

type PurchaseOrder = {
  id: string
  orderType: string
  poNumber: string | null
  soNumber: string | null
  loiNumber: string | null
  issueDate: Date
  expiryDate: Date
  amount: string
  description: string
}

type SiteWithModules = {
  siteId: string
  siteName: string
  siteCode: string
  modules: Module[]
}

export default function OrderEntryPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [orderType, setOrderType] = useState<string>('External')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedPO, setSelectedPO] = useState<string>('')
  const [poDetails, setPODetails] = useState<Partial<PurchaseOrder>>({
    orderType: 'External',
    poNumber: '',
    soNumber: '',
    loiNumber: '',
    issueDate: new Date(),
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    amount: '',
    description: ''
  })
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    vertical: ''
  })
  const [poDialogOpen, setPODialogOpen] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [siteDialogOpen, setSiteDialogOpen] = useState(false)
  const [newSite, setNewSite] = useState<Partial<Site>>({
    name: '',
    code: ''
  })
  const [selectedSites, setSelectedSites] = useState<SiteWithModules[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingPOs, setLoadingPOs] = useState(false)
  const [loadingSites, setLoadingSites] = useState(false)
  const [loadingModules, setLoadingModules] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [isEditingPO, setIsEditingPO] = useState(false)
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingSiteIndex, setEditingSiteIndex] = useState<number | null>(null)
  const [tempSelectedModules, setTempSelectedModules] = useState<string[]>([])

  const moduleNames = ['Enroute', 'EpoD', 'Inplant-IB', 'Inplant-OB', 'VC'];

  // Fetch customers on mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoadingCustomers(true)
        const response = await fetch('/api/customers')
        if (response.ok) {
          const data = await response.json()
          setCustomers(data)
          toast.success(`Loaded ${data.length} customers`)
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          toast.error(errorData.error || "Failed to load customers")
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast.error('Failed to load customers. Please check your connection.')
      } finally {
        setLoadingCustomers(false)
      }
    }

    async function fetchModules() {
      try {
        setLoadingModules(true)
        const response = await fetch('/api/modules')
        if (response.ok) {
          const data = await response.json()
          setModules(data)
          
          // Create default modules if they don't exist
          const defaultModuleNames = ['Enroute', 'EpoD', 'Inplant-IB', 'Inplant-OB', 'VC'];
          const existingModuleNames = data.map((m: Module) => m.name);
          
          // Find missing modules
          const missingModules = defaultModuleNames.filter(name => !existingModuleNames.includes(name));
          
          if (missingModules.length > 0) {
            // Create the missing modules
            for (const moduleName of missingModules) {
              try {
                const createResponse = await fetch('/api/modules', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ name: moduleName })
                });
                
                if (createResponse.ok) {
                  const newModule = await createResponse.json();
                  setModules(prev => [...prev, newModule]);
                }
              } catch (error) {
                console.error(`Error creating module ${moduleName}:`, error);
              }
            }
            
            // Refetch modules to ensure we have everything
            const refetchResponse = await fetch('/api/modules');
            if (refetchResponse.ok) {
              const refreshedData = await refetchResponse.json();
              setModules(refreshedData);
            }
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          toast.error(errorData.error || 'Failed to load modules')
        }
      } catch (error) {
        console.error('Error fetching modules:', error)
        toast.error('Failed to load modules. Please check your connection.')
      } finally {
        setLoadingModules(false)
      }
    }

    fetchCustomers()
    fetchModules()
  }, [])

  // Fetch POs when customer and order type change
  useEffect(() => {
    if (!selectedCustomer) return

    async function fetchPurchaseOrders() {
      try {
        setLoadingPOs(true)
        const response = await fetch(`/api/purchase-orders?customerId=${selectedCustomer}&orderType=${orderType}`)
        if (response.ok) {
          const data = await response.json()
          setPurchaseOrders(data)
        }
      } catch (error) {
        console.error('Error fetching purchase orders:', error)
        toast.error('Failed to load purchase orders')
      } finally {
        setLoadingPOs(false)
      }
    }

    fetchPurchaseOrders()
  }, [selectedCustomer, orderType])

  // Fetch PO details when selected PO changes
  useEffect(() => {
    if (!selectedPO) {
      setPODetails({
        orderType,
        poNumber: '',
        soNumber: '',
        loiNumber: '',
        issueDate: new Date(),
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        amount: '',
        description: ''
      })
      setSelectedSites([])
      return
    }

    async function fetchPODetails() {
      try {
        const response = await fetch(`/api/purchase-orders/${selectedPO}`)
        if (response.ok) {
          const data = await response.json()
          setPODetails({
            ...data,
            issueDate: new Date(data.issueDate),
            expiryDate: new Date(data.expiryDate)
          })

          // Fetch sites and modules for this PO
          const sitesResponse = await fetch(`/api/purchase-orders/${selectedPO}/sites`)
          if (sitesResponse.ok) {
            const sitesData = await sitesResponse.json()
            setSelectedSites(sitesData)
          }
        }
      } catch (error) {
        console.error('Error fetching PO details:', error)
        toast.error('Failed to load purchase order details')
      }
    }

    fetchPODetails()
  }, [selectedPO, orderType])

  // Fetch sites when customer changes
  useEffect(() => {
    if (!selectedCustomer) return

    async function fetchSites() {
      try {
        setLoadingSites(true)
        const response = await fetch(`/api/customers/${selectedCustomer}/sites`)
        if (response.ok) {
          const data = await response.json()
          setSites(data)
        }
      } catch (error) {
        console.error('Error fetching sites:', error)
        toast.error('Failed to load sites')
      } finally {
        setLoadingSites(false)
      }
    }

    fetchSites()
  }, [selectedCustomer])

  const handleCustomerAdd = async () => {
    if (!newCustomer.name || !newCustomer.vertical) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCustomer)
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(prev => [...prev, data])
        setSelectedCustomer(data.id)
        setNewCustomer({ name: '', vertical: '' })
        setCustomerDialogOpen(false)
        toast.success('Customer added successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add customer')
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error('Failed to add customer')
    }
  }

  const handleSiteAdd = async () => {
    if (!newSite.name || !newSite.code || !selectedCustomer) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const response = await fetch(`/api/customers/${selectedCustomer}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSite)
      })

      if (response.ok) {
        const data = await response.json()
        setSites(prev => [...prev, data])
        setNewSite({ name: '', code: '' })
        setSiteDialogOpen(false)
        toast.success('Site added successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add site')
      }
    } catch (error) {
      console.error('Error adding site:', error)
      toast.error('Failed to add site')
    }
  }

  const handlePOAdd = async () => {
    if (!selectedCustomer || !poDetails.issueDate || !poDetails.expiryDate || 
        !poDetails.description || !poDetails.amount) {
      toast.error('Please fill all required fields')
      return
    }

    // Validate that at least one identifier is present
    if (!poDetails.poNumber && !poDetails.soNumber && !poDetails.loiNumber) {
      toast.error('At least one of PO Number, SO Number, or LOI Number is required')
      return
    }

    try {
      setSubmitting(true)
      const method = isEditingPO ? 'PUT' : 'POST';
      const url = isEditingPO ? `/api/purchase-orders/${selectedPO}` : '/api/purchase-orders';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...poDetails,
          customerId: selectedCustomer,
          orderType
        })
      })

      if (response.ok) {
        try {
          const responseText = await response.text();
          const data = responseText ? JSON.parse(responseText) : {};
          if (!isEditingPO) {
            setPurchaseOrders(prev => [...prev, data]);
            setSelectedPO(data.id);
          } else {
            setPurchaseOrders(prev => prev.map(po => po.id === selectedPO ? data : po));
          }
          setPODialogOpen(false);
          toast.success(`Purchase Order ${isEditingPO ? 'updated' : 'added'} successfully`);
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          toast.success(`Purchase Order ${isEditingPO ? 'updated' : 'added'} successfully, but could not retrieve details`);
          setPODialogOpen(false);
        }
      } else {
        try {
          const responseText = await response.text();
          const error = responseText ? JSON.parse(responseText) : {};
          toast.error(error.error || `Failed to ${isEditingPO ? 'update' : 'add'} purchase order`);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          toast.error(`Failed to ${isEditingPO ? 'update' : 'add'} purchase order`);
        }
      }
    } catch (error) {
      console.error('Error with purchase order:', error);
      toast.error(`Failed to ${isEditingPO ? 'update' : 'add'} purchase order`);
    } finally {
      setSubmitting(false);
    }
  }

  const handleAddSiteToSelection = (siteId: string) => {
    const site = sites.find(s => s.id === siteId)
    if (!site) return

    // Check if site already exists in selection
    if (selectedSites.some(s => s.siteId === siteId)) {
      toast.error(`Site ${site.name} is already added`)
      return
    }

    setSelectedSites(prev => [
      ...prev,
      {
        siteId: site.id,
        siteName: site.name,
        siteCode: site.code,
        modules: []
      }
    ])
  }

  const handleRemoveSiteFromSelection = (siteId: string) => {
    const siteName = selectedSites.find(site => site.siteId === siteId)?.siteName || 'Site';
    setSelectedSites(prev => prev.filter(site => site.siteId !== siteId));
    toast.success(`Removed ${siteName} from selection`);
  }

  const handleModuleDialogOpen = (siteIndex: number) => {
    setEditingSiteIndex(siteIndex);
    const site = selectedSites[siteIndex];
    setTempSelectedModules(site.modules.map(m => m.name));
    setModuleDialogOpen(true);
  };

  const handleModuleSelectionSave = async () => {
    if (editingSiteIndex === null) return;

    if (!selectedPO) {
      toast.error('Please select or create a purchase order first')
      return
    }

    try {
      setSubmitting(true)
      
      // Update local state first
      const updatedSites = [...selectedSites];
      const currentSite = updatedSites[editingSiteIndex];
      
      // Debug info
      console.log("Selected PO:", selectedPO);
      console.log("Current site:", currentSite);
      console.log("Temp selected modules:", tempSelectedModules);
      
      // Validate site data
      if (!currentSite || !currentSite.siteId) {
        toast.error('Invalid site selection');
        setSubmitting(false);
        return;
      }
      
      // Update modules based on tempSelectedModules
      const filteredModules = modules.filter(m => tempSelectedModules.includes(m.name));
      console.log("Filtered modules:", filteredModules);
      
      // Validate modules
      if (filteredModules.length === 0) {
        toast.error('Please select at least one module for this site');
        setSubmitting(false);
        return;
      }
      
      currentSite.modules = filteredModules;
      
      // Prepare data for the API - only send the current site's data
      const siteData = {
        siteId: currentSite.siteId,
        modules: currentSite.modules.map(module => module.id)
      };
      
      console.log("Sending site data:", siteData);
      
      // Validate moduleIds
      if (!siteData.modules.length || siteData.modules.some(id => !id)) {
        toast.error('Invalid module IDs. Please refresh and try again.');
        setSubmitting(false);
        return;
      }
      
      const sitesResponse = await fetch(`/api/purchase-orders/${selectedPO}/sites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([siteData]) // Send as array with single site
      });

      console.log("Response status:", sitesResponse.status);
      
      // Get response text first to debug
      const responseText = await sitesResponse.text();
      console.log("Response text:", responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Response data:", responseData);
      } catch (e) {
        console.log("Response is not valid JSON");
      }

      if (!sitesResponse.ok) {
        let errorMessage = 'Failed to save modules for site';
        
        if (responseData && responseData.error) {
          errorMessage = responseData.error;
        }
        
        throw new Error(errorMessage);
      }

      // Update the local state with the changes
      setSelectedSites(updatedSites);
      
      const moduleNames = currentSite.modules.map(m => m.name).join(', ');
      toast.success(`Modules saved successfully for ${currentSite.siteName}: ${moduleNames}`, {
        duration: 3000,
      });

      setModuleDialogOpen(false);
      setEditingSiteIndex(null);
      setTempSelectedModules([]);
    } catch (error) {
      console.error('Error saving modules:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save modules for site');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModuleToggle = (moduleName: string) => {
    setTempSelectedModules(prev => {
      if (prev.includes(moduleName)) {
        return prev.filter(m => m !== moduleName);
      } else {
        return [...prev, moduleName];
      }
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-4 text-primary">Order Entry</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50 pb-2">
              <CardTitle className="text-lg text-primary">Customer & Purchase Order</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="customer" className="text-sm">Customer</Label>
                    <Select 
                      value={selectedCustomer} 
                      onValueChange={setSelectedCustomer}
                      disabled={loadingCustomers}
                    >
                      <SelectTrigger id="customer" className="h-9">
                        <SelectValue placeholder="Select a customer" />
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
                  <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="shrink-0 h-9 w-9">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Customer Name</Label>
                          <Input 
                            id="name" 
                            value={newCustomer.name}
                            onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="vertical">Vertical</Label>
                          <Select 
                            value={newCustomer.vertical} 
                            onValueChange={value => setNewCustomer({ ...newCustomer, vertical: value })}
                          >
                            <SelectTrigger id="vertical">
                              <SelectValue placeholder="Select a vertical" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cement">Cement</SelectItem>
                              <SelectItem value="Chemical">Chemical</SelectItem>
                              <SelectItem value="Metals">Metals</SelectItem>
                              <SelectItem value="FMCG">FMCG</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCustomerAdd}>Add Customer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-sm">Order Type</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="external"
                        checked={orderType === 'External'}
                        onChange={() => setOrderType('External')}
                        className="h-4 w-4 accent-primary"
                      />
                      <Label htmlFor="external" className="font-normal text-sm">External</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="internal"
                        checked={orderType === 'Internal'}
                        onChange={() => setOrderType('Internal')}
                        className="h-4 w-4 accent-primary"
                      />
                      <Label htmlFor="internal" className="font-normal text-sm">Internal</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="purchaseOrder" className="text-sm">Purchase Order</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select 
                          value={selectedPO} 
                          onValueChange={setSelectedPO}
                          disabled={!selectedCustomer || loadingPOs}
                        >
                          <SelectTrigger id="purchaseOrder" className="h-9">
                            <SelectValue placeholder="Select or create a PO" />
                          </SelectTrigger>
                          <SelectContent>
                            {purchaseOrders.map(po => {
                              const poIdentifier = po.poNumber || po.soNumber || po.loiNumber || po.id.substring(0, 8)
                              return (
                                <SelectItem key={po.id} value={po.id}>
                                  {poIdentifier} - {new Date(po.issueDate).toLocaleDateString()}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedPO && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsEditingPO(true);
                            setPODialogOpen(true);
                          }}
                          className="shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                      )}
                    </div>
                  </div>
                  <Dialog open={poDialogOpen} onOpenChange={(open) => {
                    setPODialogOpen(open);
                    if (!open) setIsEditingPO(false);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="shrink-0"
                        disabled={!selectedCustomer}
                        onClick={() => {
                          setIsEditingPO(false);
                          setPODetails({
                            orderType: 'External',
                            poNumber: '',
                            soNumber: '',
                            loiNumber: '',
                            issueDate: new Date(),
                            expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
                            amount: '',
                            description: ''
                          });
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>{isEditingPO ? 'Edit Purchase Order' : 'Add New Purchase Order'}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="poNumber">PO Number</Label>
                          <Input 
                            id="poNumber" 
                            value={poDetails.poNumber || ''}
                            onChange={e => setPODetails({ ...poDetails, poNumber: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="soNumber">SO Number</Label>
                          <Input 
                            id="soNumber" 
                            value={poDetails.soNumber || ''}
                            onChange={e => setPODetails({ ...poDetails, soNumber: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="loiNumber">LOI Number</Label>
                          <Input 
                            id="loiNumber" 
                            value={poDetails.loiNumber || ''}
                            onChange={e => setPODetails({ ...poDetails, loiNumber: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="issueDate">Issue Date</Label>
                            <DatePicker 
                              date={poDetails.issueDate} 
                              setDate={(date) => {
                                if (date) setPODetails({ ...poDetails, issueDate: date })
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <DatePicker 
                              date={poDetails.expiryDate} 
                              setDate={(date) => {
                                if (date) setPODetails({ ...poDetails, expiryDate: date })
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input 
                            id="amount" 
                            type="number" 
                            value={poDetails.amount || ''}
                            onChange={e => setPODetails({ ...poDetails, amount: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            value={poDetails.description || ''}
                            onChange={e => setPODetails({ ...poDetails, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handlePOAdd} disabled={submitting}>
                          {submitting ? (isEditingPO ? 'Updating...' : 'Adding...') : (isEditingPO ? 'Update Purchase Order' : 'Add Purchase Order')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50 pb-2">
              <CardTitle className="text-lg text-primary">Sites</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Add sites to this purchase order
                  </div>
                  <Dialog open={siteDialogOpen} onOpenChange={setSiteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={!selectedPO}
                        className="h-8"
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                        Add Site
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Site</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input 
                            id="siteName" 
                            value={newSite.name}
                            onChange={e => setNewSite({ ...newSite, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="siteCode">Site Code</Label>
                          <Input 
                            id="siteCode" 
                            value={newSite.code}
                            onChange={e => setNewSite({ ...newSite, code: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSiteAdd}>Add Site</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Site Selection */}
                <div className="max-h-[200px] overflow-y-auto pr-1 border rounded-md p-2">
                  {loadingSites ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : sites.length === 0 ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No sites available. Please add a site.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {sites.map(site => {
                        const isSelected = selectedSites.some(s => s.siteId === site.id)
                        return (
                          <div 
                            key={site.id} 
                            className={`flex items-center justify-between p-2 rounded-md text-sm hover:bg-slate-50 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}
                          >
                            <div>
                              <span className="font-medium">{site.name}</span> 
                              <span className="text-xs text-muted-foreground ml-1.5">({site.code})</span>
                            </div>
                            <Button
                              variant={isSelected ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => isSelected ? handleRemoveSiteFromSelection(site.id) : handleAddSiteToSelection(site.id)}
                              className="h-7 text-xs"
                            >
                              {isSelected ? "Remove" : "Add"}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-md border-slate-200">
            <CardHeader className="bg-slate-50 pb-2">
              <CardTitle className="text-lg text-primary">Selected Sites & Modules</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {selectedSites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sites selected. Please select sites from the left panel.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSites.map((site, index) => (
                    <div key={site.siteId} className="p-3 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{site.siteName}</h3>
                          <p className="text-xs text-muted-foreground">{site.siteCode}</p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleModuleDialogOpen(index)}
                                className="h-8 text-xs"
                              >
                                <Package2 className="h-3.5 w-3.5 mr-1.5" />
                                Configure Modules
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Select Modules for {site.siteName}</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <div className="mb-2 text-sm text-muted-foreground">
                                  Select modules to implement at this site:
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                                  {loadingModules ? (
                                    <div className="col-span-2 flex justify-center p-4">
                                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                  ) : modules.length === 0 ? (
                                    <div className="col-span-2 text-center p-4 text-muted-foreground">
                                      No modules available. Please refresh the page.
                                    </div>
                                  ) : (
                                    modules.map(module => (
                                      <div 
                                        key={module.id} 
                                        className="flex items-center space-x-2 p-2 border rounded-md hover:bg-slate-50"
                                      >
                                        <Checkbox 
                                          id={`module-${module.id}`} 
                                          checked={tempSelectedModules.includes(module.name)}
                                          onCheckedChange={() => handleModuleToggle(module.name)}
                                        />
                                        <Label 
                                          htmlFor={`module-${module.id}`}
                                          className="text-sm font-normal cursor-pointer flex-1"
                                        >
                                          {module.name}
                                          <span className="text-xs text-muted-foreground ml-1 hidden">ID: {module.id}</span>
                                        </Label>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleModuleSelectionSave} disabled={submitting}>
                                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Save Selection
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveSiteFromSelection(site.siteId)}
                            className="h-8 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Module list */}
                      <div className="mt-2">
                        {site.modules.length === 0 ? (
                          <div className="text-sm text-muted-foreground italic">
                            No modules selected. Click "Configure Modules" to add.
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {site.modules.map(module => (
                              <Badge key={module.id} variant="outline" className="bg-slate-50 text-xs">
                                {module.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 