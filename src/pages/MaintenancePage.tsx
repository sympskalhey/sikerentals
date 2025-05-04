
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGarage } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { Wrench, Plus, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MaintenancePage = () => {
  const { vehicles, maintenances, refreshSubscriptions, isRefreshing, lastRefreshed } = useGarage();
  const navigate = useNavigate();

  // Group maintenances by vehicle
  const vehicleMaintenances = vehicles.map(vehicle => {
    const vehicleMaintenanceList = maintenances.filter(maintenance => maintenance.vehicleId === vehicle.id);
    return {
      vehicle,
      maintenances: vehicleMaintenanceList
    };
  });

  // Calculate upcoming maintenance based on last maintenance date
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-garage-blue">Maintenance Records</h1>
          <div className="flex space-x-2">
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
            <Button onClick={() => navigate('/maintenance/add')} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Maintenance
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {vehicleMaintenances.map(({ vehicle, maintenances }) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardHeader className="bg-garage-blue text-white flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription className="text-garage-silver">
                    {maintenances.length > 0 ? `${maintenances.length} Maintenance ${maintenances.length === 1 ? 'Record' : 'Records'}` : 'No Maintenance Records'}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-garage-blue hover:bg-white/90"
                  onClick={() => navigate(`/maintenance/add?vehicleId=${vehicle.id}`)}
                >
                  Add Maintenance
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {maintenances.length > 0 ? (
                  <div className="divide-y">
                    {maintenances
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(maintenance => (
                      <div 
                        key={maintenance.id} 
                        className="p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg flex items-center">
                              {maintenance.type}
                              <span className="ml-2 inline-flex items-center text-xs font-medium text-blue-700 bg-blue-100 rounded-full px-2.5 py-0.5">
                                <Wrench className="w-3 h-3 mr-1" />
                                {new Date(maintenance.date).toLocaleDateString()}
                              </span>
                            </h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/maintenance/edit/${maintenance.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Mileage</p>
                            <p className="font-medium">{maintenance.mileage.toLocaleString()} miles</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cost</p>
                            <p className="font-medium">${maintenance.cost.toFixed(2)}</p>
                          </div>
                          {maintenance.shop && (
                            <div>
                              <p className="text-sm text-muted-foreground">Shop</p>
                              <p className="font-medium">{maintenance.shop}</p>
                            </div>
                          )}
                        </div>
                        {maintenance.description && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="mt-1">{maintenance.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No maintenance records found for this vehicle.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate(`/maintenance/add?vehicleId=${vehicle.id}`)}
                    >
                      Add Maintenance Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {vehicles.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-garage-blue mb-2">No Vehicles Found</h2>
              <p className="text-muted-foreground mb-6">Add vehicles to your garage to manage their maintenance records.</p>
              <Button onClick={() => navigate('/vehicles/add')}>
                Add Vehicle
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MaintenancePage;
