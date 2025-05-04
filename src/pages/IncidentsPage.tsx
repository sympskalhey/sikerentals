import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGarage } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus, Car, RefreshCw, DollarSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const IncidentsPage = () => {
  const { vehicles, incidents, refreshSubscriptions, isRefreshing, lastRefreshed } = useGarage();
  const navigate = useNavigate();

  // Group incidents by vehicle
  const vehicleIncidents = vehicles.map(vehicle => {
    const vehicleIncidentList = incidents.filter(incident => incident.vehicleId === vehicle.id);
    return {
      vehicle,
      incidents: vehicleIncidentList
    };
  });

  // Format the last refreshed time
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return 'Never refreshed';
    return `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`;
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refreshSubscriptions();
  };

  // Get badge color based on incident type
  const getIncidentTypeBadge = (type: 'accident' | 'theft' | 'damage' | 'other') => {
    switch (type) {
      case 'accident':
        return 'bg-red-100 text-red-800';
      case 'theft':
        return 'bg-purple-100 text-purple-800';
      case 'damage':
        return 'bg-orange-100 text-orange-800';
      case 'other':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-garage-blue">Incident Reports</h1>
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
            <Button onClick={() => navigate('/incidents/add')} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Incident
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {vehicleIncidents.map(({ vehicle, incidents }) => (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardHeader className="bg-garage-blue text-white flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription className="text-garage-silver">
                    {incidents.length > 0 ? `${incidents.length} Incident ${incidents.length === 1 ? 'Report' : 'Reports'}` : 'No Incident Reports'}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-garage-blue hover:bg-white/90"
                  onClick={() => navigate(`/incidents/add?vehicleId=${vehicle.id}`)}
                >
                  Add Incident
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {incidents.length > 0 ? (
                  <div className="divide-y">
                    {incidents
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(incident => (
                      <div 
                        key={incident.id} 
                        className="p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg flex items-center">
                              <span className={`inline-flex items-center text-xs font-medium ${getIncidentTypeBadge(incident.type)} rounded-full px-2.5 py-0.5 mr-2 capitalize`}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {incident.type}
                              </span>
                              {new Date(incident.date).toLocaleDateString()}
                            </h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/incidents/edit/${incident.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {incident.location && (
                            <div>
                              <p className="text-sm text-muted-foreground">Location</p>
                              <p className="font-medium">{incident.location}</p>
                            </div>
                          )}
                          {incident.cost !== undefined && (
                            <div>
                              <p className="text-sm text-muted-foreground">Cost</p>
                              <p className="font-medium">${incident.cost.toFixed(2)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Insurance Claim</p>
                            <p className="font-medium">{incident.insuranceClaim ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        {incident.description && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="mt-1">{incident.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No incident reports found for this vehicle.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate(`/incidents/add?vehicleId=${vehicle.id}`)}
                    >
                      Add Incident Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {vehicles.length === 0 && (
            <div className="text-center py-12">
              <Car className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-garage-blue mb-2">No Vehicles Found</h2>
              <p className="text-muted-foreground mb-6">Add vehicles to your garage to manage their incident reports.</p>
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

export default IncidentsPage;