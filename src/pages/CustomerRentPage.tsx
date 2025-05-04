
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RentalForm from '@/components/rentals/RentalForm';
import { Rental } from '@/types/garage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomerRentContent = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, vehicles, rentVehicle } = useGarage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("vehicles");
  
  const customer = customerId ? getCustomerById(customerId) : undefined;
  
  // Make sure we only show available vehicles - this is critical
  const availableVehicles = vehicles.filter(v => !v.isRented);
  
  // Recheck selected vehicle availability when component updates
  useEffect(() => {
    if (selectedVehicleId) {
      const isStillAvailable = availableVehicles.some(v => v.id === selectedVehicleId);
      if (!isStillAvailable) {
        // Reset selection if vehicle is no longer available
        setSelectedVehicleId(null);
        setActiveTab("vehicles");
      }
    }
  }, [availableVehicles, selectedVehicleId]);
  
  const filteredVehicles = availableVehicles.filter(vehicle => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower) ||
      vehicle.color.toLowerCase().includes(searchLower)
    );
  });
  
  if (!customer) {
    return (
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Customer not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVehicleSelect = (vehicleId: string) => {
    // Check again if the vehicle is available before selecting
    const isAvailable = availableVehicles.some(v => v.id === vehicleId);
    if (isAvailable) {
      setSelectedVehicleId(vehicleId);
    } else {
      alert("This vehicle is no longer available for rent.");
    }
  };

  const handleSubmit = (rental: Omit<Rental, 'id' | 'vehicleId' | 'status' | 'customerId'>) => {
    if (selectedVehicleId) {
      // Double check the vehicle is not rented before proceeding
      const isStillAvailable = availableVehicles.some(v => v.id === selectedVehicleId);
      if (!isStillAvailable) {
        alert("This vehicle has just been rented by someone else.");
        setSelectedVehicleId(null);
        setActiveTab("vehicles");
        return;
      }
      
      // Add customerId to the rental
      const rentalWithCustomer = {
        ...rental,
        customerId: customer.id,
        renter: {
          ...rental.renter,
          customerId: customer.id
        }
      };
      
      rentVehicle(selectedVehicleId, rentalWithCustomer);
      navigate('/rentals');
    }
  };

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate(`/customers/${customer.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer
        </Button>
        
        <h1 className="text-3xl font-bold text-garage-blue">Rent a Vehicle</h1>
        <p className="text-muted-foreground">Creating a rental for {customer.fullName}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customer.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium">{customer.licenseNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="vehicles">Select Vehicle</TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedVehicleId}>Rental Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles" className="space-y-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search vehicles..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {filteredVehicles.length === 0 ? (
                <Alert>
                  <AlertTitle>No vehicles available</AlertTitle>
                  <AlertDescription>
                    No available vehicles found. All vehicles are currently rented or no vehicles match your search.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredVehicles.map((vehicle) => (
                    <Card 
                      key={vehicle.id}
                      className={`cursor-pointer transition-all ${
                        selectedVehicleId === vehicle.id ? 'border-2 border-blue-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleVehicleSelect(vehicle.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        {vehicle.imageUrl ? (
                          <img 
                            src={vehicle.imageUrl} 
                            alt={`${vehicle.make} ${vehicle.model}`} 
                            className="w-24 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                          </div>
                        )}
                        <div className="flex-grow">
                          <h3 className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vehicle.color} • {vehicle.licensePlate}
                          </p>
                        </div>
                        <div>
                          <Button 
                            variant={selectedVehicleId === vehicle.id ? "default" : "outline"}
                            size="sm"
                          >
                            {selectedVehicleId === vehicle.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {selectedVehicleId && (
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("details")}>
                    Continue to Rental Details
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details">
              {selectedVehicleId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rental Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Final check that the selected vehicle is still available */}
                    {availableVehicles.some(v => v.id === selectedVehicleId) ? (
                      <RentalForm 
                        vehicle={vehicles.find(v => v.id === selectedVehicleId)!} 
                        onSubmit={handleSubmit}
                        customerData={customer} 
                      />
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>Vehicle No Longer Available</AlertTitle>
                        <AlertDescription>
                          This vehicle has been rented by someone else. Please select another vehicle.
                          <div className="mt-4">
                            <Button onClick={() => setActiveTab("vehicles")}>
                              Select Another Vehicle
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

const CustomerRentPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <CustomerRentContent />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerRentPage;
