
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGarage } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Car, Plus, Shield, ClipboardList, Wrench, AlertTriangle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DocumentsPage = () => {
  const { vehicles, insurances, registrations, maintenances, incidents, refreshSubscriptions, isRefreshing, lastRefreshed } = useGarage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter documents based on search term
  const filterDocuments = (items, type) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    
    return items.filter(item => {
      const vehicle = vehicles.find(v => v.id === item.vehicleId);
      const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase() : '';
      
      // Search based on document type
      switch (type) {
        case 'insurance':
          return vehicleName.includes(term) || 
                 item.provider.toLowerCase().includes(term) || 
                 item.policyNumber.toLowerCase().includes(term);
        case 'registration':
          return vehicleName.includes(term) || 
                 item.state.toLowerCase().includes(term);
        case 'maintenance':
          return vehicleName.includes(term) || 
                 item.type.toLowerCase().includes(term) || 
                 (item.description && item.description.toLowerCase().includes(term)) ||
                 (item.shop && item.shop.toLowerCase().includes(term));
        case 'incident':
          return vehicleName.includes(term) || 
                 item.type.toLowerCase().includes(term) || 
                 item.description.toLowerCase().includes(term) ||
                 (item.location && item.location.toLowerCase().includes(term));
        default:
          return false;
      }
    });
  };

  const filteredInsurances = filterDocuments(insurances, 'insurance');
  const filteredRegistrations = filterDocuments(registrations, 'registration');
  const filteredMaintenances = filterDocuments(maintenances, 'maintenance');
  const filteredIncidents = filterDocuments(incidents, 'incident');

  const getVehicleDetails = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
  };

  // Format the last refreshed time
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return 'Never refreshed';
    return `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`;
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refreshSubscriptions();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-garage-blue">Vehicle Documents</h1>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatLastRefreshed()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="w-full md:w-64">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="all" className="flex flex-col py-2">
              <FileText className="h-4 w-4 mb-1" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex flex-col py-2">
              <Shield className="h-4 w-4 mb-1" />
              <span>Insurance</span>
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex flex-col py-2">
              <ClipboardList className="h-4 w-4 mb-1" />
              <span>Registration</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex flex-col py-2">
              <Wrench className="h-4 w-4 mb-1" />
              <span>Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex flex-col py-2">
              <AlertTriangle className="h-4 w-4 mb-1" />
              <span>Incidents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-6">
              {/* Insurance Documents */}
              {filteredInsurances.length > 0 && (
                <Card>
                  <CardHeader className="bg-garage-blue text-white">
                    <CardTitle className="text-white flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Insurance Documents
                    </CardTitle>
                    <CardDescription className="text-garage-silver">
                      Policy records and coverage information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredInsurances.map(insurance => (
                        <div key={insurance.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                          <div>
                            <h3 className="font-medium">{insurance.provider} - Policy #{insurance.policyNumber}</h3>
                            <p className="text-sm text-muted-foreground">{getVehicleDetails(insurance.vehicleId)}</p>
                            <p className="text-sm">
                              Valid: {new Date(insurance.startDate).toLocaleDateString()} - {new Date(insurance.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-2 md:mt-0"
                            onClick={() => navigate(`/insurance/edit/${insurance.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Registration Documents */}
              {filteredRegistrations.length > 0 && (
                <Card>
                  <CardHeader className="bg-garage-blue text-white">
                    <CardTitle className="text-white flex items-center">
                      <ClipboardList className="mr-2 h-5 w-5" />
                      Registration Documents
                    </CardTitle>
                    <CardDescription className="text-garage-silver">
                      Vehicle registration records
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredRegistrations.map(registration => (
                        <div key={registration.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                          <div>
                            <h3 className="font-medium">{registration.state} Registration</h3>
                            <p className="text-sm text-muted-foreground">{getVehicleDetails(registration.vehicleId)}</p>
                            <p className="text-sm">
                              Expires: {new Date(registration.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-2 md:mt-0"
                            onClick={() => navigate(`/registration/edit/${registration.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Maintenance Documents */}
              {filteredMaintenances.length > 0 && (
                <Card>
                  <CardHeader className="bg-garage-blue text-white">
                    <CardTitle className="text-white flex items-center">
                      <Wrench className="mr-2 h-5 w-5" />
                      Maintenance Records
                    </CardTitle>
                    <CardDescription className="text-garage-silver">
                      Service and repair documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredMaintenances.map(maintenance => (
                        <div key={maintenance.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                          <div>
                            <h3 className="font-medium">{maintenance.type}</h3>
                            <p className="text-sm text-muted-foreground">{getVehicleDetails(maintenance.vehicleId)}</p>
                            <p className="text-sm">
                              Date: {new Date(maintenance.date).toLocaleDateString()} | Mileage: {maintenance.mileage.toLocaleString()}
                            </p>
                            {maintenance.shop && <p className="text-sm">Shop: {maintenance.shop}</p>}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-2 md:mt-0"
                            onClick={() => navigate(`/maintenance/edit/${maintenance.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Incident Documents */}
              {filteredIncidents.length > 0 && (
                <Card>
                  <CardHeader className="bg-garage-blue text-white">
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Incident Reports
                    </CardTitle>
                    <CardDescription className="text-garage-silver">
                      Accident and damage records
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredIncidents.map(incident => (
                        <div key={incident.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                          <div>
                            <h3 className="font-medium capitalize">{incident.type}</h3>
                            <p className="text-sm text-muted-foreground">{getVehicleDetails(incident.vehicleId)}</p>
                            <p className="text-sm">
                              Date: {new Date(incident.date).toLocaleDateString()}
                              {incident.location && ` | Location: ${incident.location}`}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-2 md:mt-0"
                            onClick={() => navigate(`/incidents/edit/${incident.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {filteredInsurances.length === 0 && filteredRegistrations.length === 0 && 
               filteredMaintenances.length === 0 && filteredIncidents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold text-garage-blue mb-2">No Documents Found</h2>
                  {searchTerm ? (
                    <p className="text-muted-foreground mb-6">No documents match your search criteria. Try different keywords.</p>
                  ) : (
                    <p className="text-muted-foreground mb-6">Add vehicles and their related documents to start tracking them.</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insurance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-garage-blue text-white">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Insurance Documents
                  </CardTitle>
                  <CardDescription className="text-garage-silver">
                    {filteredInsurances.length} {filteredInsurances.length === 1 ? 'policy' : 'policies'} found
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => navigate('/insurance/add')} className="bg-white text-garage-blue hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Policy
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {filteredInsurances.length > 0 ? (
                  <div className="divide-y">
                    {filteredInsurances.map(insurance => (
                      <div key={insurance.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <h3 className="font-medium">{insurance.provider} - Policy #{insurance.policyNumber}</h3>
                          <p className="text-sm text-muted-foreground">{getVehicleDetails(insurance.vehicleId)}</p>
                          <div className="text-sm mt-1">
                            <span className={`rounded px-2 py-0.5 text-xs ${
                              new Date(insurance.expiryDate) < new Date() 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {new Date(insurance.expiryDate) < new Date() ? 'Expired' : 'Active'}
                            </span>
                            <span className="ml-2">
                              Valid until {new Date(insurance.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">Coverage: {insurance.coverage}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2 md:mt-0"
                          onClick={() => navigate(`/insurance/edit/${insurance.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No insurance policies found.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/insurance/add')}
                    >
                      Add Insurance Policy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registration">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-garage-blue text-white">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Registration Documents
                  </CardTitle>
                  <CardDescription className="text-garage-silver">
                    {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'registration' : 'registrations'} found
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => navigate('/registration/add')} className="bg-white text-garage-blue hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Registration
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRegistrations.length > 0 ? (
                  <div className="divide-y">
                    {filteredRegistrations.map(registration => (
                      <div key={registration.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <h3 className="font-medium">{registration.state} Registration</h3>
                          <p className="text-sm text-muted-foreground">{getVehicleDetails(registration.vehicleId)}</p>
                          <div className="text-sm mt-1">
                            <span className={`rounded px-2 py-0.5 text-xs ${
                              new Date(registration.expiryDate) < new Date() 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {new Date(registration.expiryDate) < new Date() ? 'Expired' : 'Active'}
                            </span>
                            <span className="ml-2">
                              Expires on {new Date(registration.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">Fee: ${registration.fee.toFixed(2)}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2 md:mt-0"
                          onClick={() => navigate(`/registration/edit/${registration.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No vehicle registrations found.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/registration/add')}
                    >
                      Add Registration
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-garage-blue text-white">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Maintenance Records
                  </CardTitle>
                  <CardDescription className="text-garage-silver">
                    {filteredMaintenances.length} {filteredMaintenances.length === 1 ? 'record' : 'records'} found
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => navigate('/maintenance/add')} className="bg-white text-garage-blue hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {filteredMaintenances.length > 0 ? (
                  <div className="divide-y">
                    {filteredMaintenances
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(maintenance => (
                      <div key={maintenance.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <h3 className="font-medium">{maintenance.type}</h3>
                          <p className="text-sm text-muted-foreground">{getVehicleDetails(maintenance.vehicleId)}</p>
                          <p className="text-sm mt-1">
                            Date: {new Date(maintenance.date).toLocaleDateString()} | Mileage: {maintenance.mileage.toLocaleString()} miles
                          </p>
                          {maintenance.shop && <p className="text-sm mt-1">Shop: {maintenance.shop}</p>}
                          <p className="text-sm mt-1">Cost: ${maintenance.cost.toFixed(2)}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2 md:mt-0"
                          onClick={() => navigate(`/maintenance/edit/${maintenance.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No maintenance records found.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/maintenance/add')}
                    >
                      Add Maintenance Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-garage-blue text-white">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Incident Reports
                  </CardTitle>
                  <CardDescription className="text-garage-silver">
                    {filteredIncidents.length} {filteredIncidents.length === 1 ? 'report' : 'reports'} found
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => navigate('/incidents/add')} className="bg-white text-garage-blue hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Report
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {filteredIncidents.length > 0 ? (
                  <div className="divide-y">
                    {filteredIncidents
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(incident => (
                      <div key={incident.id} className="p-4 flex flex-col md:flex-row justify-between items-start">
                        <div>
                          <h3 className="font-medium capitalize">{incident.type}</h3>
                          <p className="text-sm text-muted-foreground">{getVehicleDetails(incident.vehicleId)}</p>
                          <p className="text-sm mt-1">
                            Date: {new Date(incident.date).toLocaleDateString()}
                          </p>
                          {incident.location && <p className="text-sm mt-1">Location: {incident.location}</p>}
                          {incident.cost !== undefined && <p className="text-sm mt-1">Cost: ${incident.cost.toFixed(2)}</p>}
                          <p className="text-sm mt-1">
                            Insurance Claim: {incident.insuranceClaim ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2 md:mt-0"
                          onClick={() => navigate(`/incidents/edit/${incident.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No incident reports found.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/incidents/add')}
                    >
                      Add Incident Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentsPage;
