
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGarage } from '@/context/GarageContext';
import { GarageProvider } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, AlertTriangle } from 'lucide-react';

// Separate the content to use the useGarage hook within the GarageProvider
const InsurancePageContent = () => {
  const { vehicles, insurances } = useGarage();
  const navigate = useNavigate();

  // Group insurances by vehicle
  const vehicleInsurances = vehicles.map(vehicle => {
    const vehicleInsurancesList = insurances.filter(insurance => insurance.vehicleId === vehicle.id);
    return {
      vehicle,
      insurances: vehicleInsurancesList
    };
  });

  // Find expired and soon-to-expire insurances
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-garage-blue">Insurance Policies</h1>
        <Button onClick={() => navigate('/insurance/add')} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add New Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {vehicleInsurances.map(({ vehicle, insurances }) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <CardHeader className="bg-garage-blue text-white flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
                <CardDescription className="text-garage-silver">
                  {insurances.length > 0 ? `${insurances.length} Insurance ${insurances.length === 1 ? 'Policy' : 'Policies'}` : 'No Insurance Policies'}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white text-garage-blue hover:bg-white/90"
                onClick={() => navigate(`/insurance/add?vehicleId=${vehicle.id}`)}
              >
                Add Policy
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {insurances.length > 0 ? (
                <div className="divide-y">
                  {insurances.map(insurance => {
                    const expiryDate = new Date(insurance.expiryDate);
                    const isExpired = expiryDate < today;
                    const isExpiringSoon = !isExpired && expiryDate <= thirtyDaysFromNow;
                    
                    return (
                      <div 
                        key={insurance.id} 
                        className={`p-4 ${isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-amber-50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg flex items-center">
                              {insurance.provider}
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
                                  <Shield className="w-3 h-3 mr-1" />
                                  Active
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">Policy #{insurance.policyNumber}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/insurance/edit/${insurance.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Coverage</p>
                            <p className="font-medium">{insurance.coverage}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Premium</p>
                            <p className="font-medium">MVR{insurance.premium.toFixed(2)}/year</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Valid Until</p>
                            <p className="font-medium">{new Date(insurance.expiryDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No insurance policies found for this vehicle.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(`/insurance/add?vehicleId=${vehicle.id}`)}
                  >
                    Add Insurance Policy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-garage-blue mb-2">No Vehicles Found</h2>
            <p className="text-muted-foreground mb-6">Add vehicles to your garage to manage their insurance policies.</p>
            <Button onClick={() => navigate('/vehicles/add')}>
              Add Vehicle
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

// Main component wrapped in GarageProvider
const InsurancePage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <InsurancePageContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default InsurancePage;
