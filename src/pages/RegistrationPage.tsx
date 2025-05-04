
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGarage } from '@/context/GarageContext';
import { GarageProvider } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, AlertTriangle } from 'lucide-react';

// Separate component to use the useGarage hook within the GarageProvider
const RegistrationPageContent = () => {
  const { vehicles, registrations } = useGarage();
  const navigate = useNavigate();

  // Group registrations by vehicle
  const vehicleRegistrations = vehicles.map(vehicle => {
    const vehicleRegistrationsList = registrations.filter(registration => registration.vehicleId === vehicle.id);
    return {
      vehicle,
      registrations: vehicleRegistrationsList
    };
  });

  // Find expired and soon-to-expire registrations
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-garage-blue">Vehicle Registrations</h1>
        <Button onClick={() => navigate('/registration/add')} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Registration
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {vehicleRegistrations.map(({ vehicle, registrations }) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <CardHeader className="bg-garage-blue text-white flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
                <CardDescription className="text-garage-silver">
                  {registrations.length > 0 ? `${registrations.length} Registration ${registrations.length === 1 ? 'Record' : 'Records'}` : 'No Registration Records'}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white text-garage-blue hover:bg-white/90"
                onClick={() => navigate(`/registration/add?vehicleId=${vehicle.id}`)}
              >
                Add Registration
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {registrations.length > 0 ? (
                <div className="divide-y">
                  {registrations.map(registration => {
                    const expiryDate = new Date(registration.expiryDate);
                    const isExpired = expiryDate < today;
                    const isExpiringSoon = !isExpired && expiryDate <= thirtyDaysFromNow;
                    
                    return (
                      <div 
                        key={registration.id} 
                        className={`p-4 ${isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-amber-50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg flex items-center">
                              {registration.state} Registration
                              {isExpired ? (
                                <span className="ml-2 inline-flex items-center text-xs font-medium text-red-700 bg-red-100 rounded-full px-2.5 py-0.5">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expired
                                </span>
                              ) : isExpiringSoon ? (
                                <span className="ml-2 inline-flex items-center text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Expiring Soon
                                </span>
                              ) : (
                                <span className="ml-2 inline-flex items-center text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
                                  <ClipboardList className="w-3 h-3 mr-1" />
                                  Active
                                </span>
                              )}
                            </h3>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/registration/edit/${registration.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Expiry Date</p>
                            <p className="font-medium">{new Date(registration.expiryDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Fee</p>
                            <p className="font-medium">${registration.fee.toFixed(2)}</p>
                          </div>
                          {registration.renewalUrl && (
                            <div>
                              <p className="text-sm text-muted-foreground">Renewal URL</p>
                              <a 
                                href={registration.renewalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Renew Online
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No registration records found for this vehicle.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(`/registration/add?vehicleId=${vehicle.id}`)}
                  >
                    Add Registration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-garage-blue mb-2">No Vehicles Found</h2>
            <p className="text-muted-foreground mb-6">Add vehicles to your garage to manage their registrations.</p>
            <Button onClick={() => navigate('/vehicles/add')}>
              Add Vehicle
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

// Main component wrapped with GarageProvider
const RegistrationPage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <RegistrationPageContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default RegistrationPage;
