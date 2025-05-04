
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Car, Shield, ClipboardList, Wrench, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VehicleDetailsContent = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    vehicles, 
    insurances, 
    registrations, 
    maintenances, 
    incidents,
    deleteVehicle 
  } = useGarage();
  const navigate = useNavigate();

  const vehicle = vehicles.find(v => v.id === id);
  
  if (!vehicle || !id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-garage-blue mb-4">Vehicle Not Found</h2>
        <p className="mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/vehicles')}>
          Back to Vehicles
        </Button>
      </div>
    );
  }
  
  const vehicleInsurances = insurances.filter(i => i.vehicleId === id);
  const vehicleRegistrations = registrations.filter(r => r.vehicleId === id);
  const vehicleMaintenances = maintenances.filter(m => m.vehicleId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const vehicleIncidents = incidents.filter(i => i.vehicleId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const totalMaintenanceCost = vehicleMaintenances.reduce((sum, m) => sum + m.cost, 0);
  
  const handleDeleteVehicle = () => {
    if (confirm(`Are you sure you want to remove ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
      deleteVehicle(id);
      navigate('/vehicles');
    }
  };

  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/vehicles')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-garage-blue">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 h-full">
          <CardHeader className="bg-garage-blue text-white">
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription className="text-garage-silver">
              License: {vehicle.licensePlate}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="aspect-video bg-garage-silver/30 rounded-md mb-6 flex items-center justify-center overflow-hidden">
              {vehicle.imageUrl ? (
                <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" />
              ) : (
                <Car className="h-12 w-12 text-garage-blue/50" />
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-medium">{vehicle.color}</span>
              </div>
              
              {vehicle.vin && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VIN:</span>
                  <span className="font-medium">{vehicle.vin}</span>
                </div>
              )}
              
              {vehicle.purchaseDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchased:</span>
                  <span className="font-medium">{new Date(vehicle.purchaseDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {vehicle.purchasePrice !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span className="font-medium">${vehicle.purchasePrice.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance Records:</span>
                <span className="font-medium">{vehicleMaintenances.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance Cost:</span>
                <span className="font-medium">${totalMaintenanceCost.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Incidents:</span>
                <span className="font-medium">{vehicleIncidents.length}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t flex flex-col space-y-2">
              <Button variant="outline" onClick={() => navigate(`/vehicles/edit/${id}`)}>
                Edit Vehicle Details
              </Button>
              <Button variant="destructive" onClick={handleDeleteVehicle}>
                Remove Vehicle
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="maintenance">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="maintenance" className="flex flex-col items-center py-2">
                <Wrench className="h-4 w-4 mb-1" />
                <span>Maintenance</span>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex flex-col items-center py-2">
                <Shield className="h-4 w-4 mb-1" />
                <span>Insurance</span>
              </TabsTrigger>
              <TabsTrigger value="registration" className="flex flex-col items-center py-2">
                <ClipboardList className="h-4 w-4 mb-1" />
                <span>Registration</span>
              </TabsTrigger>
              <TabsTrigger value="incidents" className="flex flex-col items-center py-2">
                <AlertTriangle className="h-4 w-4 mb-1" />
                <span>Incidents</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="maintenance">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Maintenance History</CardTitle>
                    <CardDescription>
                      {vehicleMaintenances.length} records found
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/maintenance/add?vehicleId=${id}`)}>
                    Add Record
                  </Button>
                </CardHeader>
                <CardContent>
                  {vehicleMaintenances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Service</th>
                            <th className="pb-2">Mileage</th>
                            <th className="pb-2 text-right">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicleMaintenances.map((maintenance) => (
                            <tr key={maintenance.id} className="border-b last:border-0">
                              <td className="py-3">{new Date(maintenance.date).toLocaleDateString()}</td>
                              <td className="py-3">{maintenance.type}</td>
                              <td className="py-3">{maintenance.mileage} mi</td>
                              <td className="py-3 text-right">${maintenance.cost.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No maintenance records found for this vehicle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insurance">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Insurance Information</CardTitle>
                    <CardDescription>
                      Policy details and coverage
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/insurance/add?vehicleId=${id}`)}>
                    Add Policy
                  </Button>
                </CardHeader>
                <CardContent>
                  {vehicleInsurances.length > 0 ? (
                    <div className="space-y-4">
                      {vehicleInsurances.map((insurance) => (
                        <div key={insurance.id} className="border rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-lg font-medium">{insurance.provider}</h3>
                            <span className={`rounded px-2 py-0.5 text-xs ${
                              new Date(insurance.expiryDate) < new Date() 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {new Date(insurance.expiryDate) < new Date() ? 'Expired' : 'Active'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Policy Number:</span>
                              <p className="font-medium">{insurance.policyNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Coverage:</span>
                              <p className="font-medium">{insurance.coverage}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Start Date:</span>
                              <p className="font-medium">{new Date(insurance.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expiry Date:</span>
                              <p className="font-medium">{new Date(insurance.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Annual Premium:</span>
                              <p className="font-medium">${insurance.premium.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No insurance information added for this vehicle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="registration">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Registration Information</CardTitle>
                    <CardDescription>
                      Registration details and renewal dates
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/registration/add?vehicleId=${id}`)}>
                    Add Registration
                  </Button>
                </CardHeader>
                <CardContent>
                  {vehicleRegistrations.length > 0 ? (
                    <div className="space-y-4">
                      {vehicleRegistrations.map((registration) => (
                        <div key={registration.id} className="border rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-lg font-medium">{registration.state} Registration</h3>
                            <span className={`rounded px-2 py-0.5 text-xs ${
                              new Date(registration.expiryDate) < new Date() 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {new Date(registration.expiryDate) < new Date() ? 'Expired' : 'Active'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Expiry Date:</span>
                              <p className="font-medium">{new Date(registration.expiryDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fee:</span>
                              <p className="font-medium">${registration.fee.toFixed(2)}</p>
                            </div>
                            {registration.renewalUrl && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Renewal URL:</span>
                                <p className="font-medium">
                                  <a 
                                    href={registration.renewalUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {registration.renewalUrl}
                                  </a>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No registration information added for this vehicle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="incidents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Incidents & Claims</CardTitle>
                    <CardDescription>
                      Accident records and insurance claims
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/incidents/add?vehicleId=${id}`)}>
                    Add Incident
                  </Button>
                </CardHeader>
                <CardContent>
                  {vehicleIncidents.length > 0 ? (
                    <div className="space-y-4">
                      {vehicleIncidents.map((incident) => (
                        <div key={incident.id} className="border rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-lg font-medium capitalize">{incident.type}</h3>
                            <span>{new Date(incident.date).toLocaleDateString()}</span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{incident.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {incident.location && (
                              <div>
                                <span className="text-muted-foreground">Location:</span>
                                <p className="font-medium">{incident.location}</p>
                              </div>
                            )}
                            {incident.cost !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Cost:</span>
                                <p className="font-medium">${incident.cost.toFixed(2)}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Insurance Claim:</span>
                              <p className="font-medium">{incident.insuranceClaim ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No incident records found for this vehicle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

const VehicleDetailsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <VehicleDetailsContent />
      </main>
      <Footer />
    </div>
  );
};

export default VehicleDetailsPage;
