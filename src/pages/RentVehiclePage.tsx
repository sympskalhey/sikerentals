
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { useNavigate, useParams } from 'react-router-dom';
import RentalForm from '@/components/rentals/RentalForm';
import { Rental } from '@/types/garage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Search, UserRound, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RentVehicleContent = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const { vehicles, customers, rentVehicle } = useGarage();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("existing");
  
  const vehicle = vehicles.find(v => v.id === vehicleId);
  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : undefined;

  // Check if vehicle is already rented when component mounts
  useEffect(() => {
    if (vehicle?.isRented) {
      // If the vehicle is already rented, redirect back to vehicles page
      navigate('/vehicles');
    }
  }, [vehicle, navigate]);
  
  const filteredCustomers = customers.filter(customer => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      customer.licenseNumber.toLowerCase().includes(searchLower)
    );
  });
  
  if (!vehicle) {
    return (
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Vehicle not found.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Check if vehicle is already rented
  if (vehicle.isRented) {
    return (
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Vehicle Unavailable</AlertTitle>
          <AlertDescription>
            This vehicle is currently rented and unavailable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleSubmit = (rental: Omit<Rental, 'id' | 'vehicleId' | 'status'>) => {
    // Double check the vehicle is not rented before proceeding
    const currentVehicle = vehicles.find(v => v.id === vehicle.id);
    if (currentVehicle?.isRented) {
      alert("This vehicle has just been rented by someone else.");
      navigate('/vehicles');
      return;
    }
    
    rentVehicle(vehicle.id, rental);
    navigate('/rentals');
  };

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/vehicles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
        </Button>
        
        <h1 className="text-3xl font-bold text-garage-blue">Rent a Vehicle</h1>
        <p className="text-muted-foreground">Complete the form below to rent this vehicle.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <div className="container mx-auto px-4">
              <TabsList className="border-b-0 -mb-px">
                <TabsTrigger value="existing">Existing Customer</TabsTrigger>
                <TabsTrigger value="new">New Customer</TabsTrigger>
                {selectedCustomer && (
                  <TabsTrigger value="details">Rental Details</TabsTrigger>
                )}
              </TabsList>
            </div>
          </div>
          
          <div className="p-6">
            <TabsContent value="existing" className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search customers by name, email, phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {customers.length === 0 ? (
                <div className="text-center py-8">
                  <UserRound className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-lg mb-2">No customers in database</p>
                  <p className="text-muted-foreground mb-4">You need to add a customer before renting a vehicle.</p>
                  <Button onClick={() => navigate('/customers/add')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No customers match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {filteredCustomers.map(customer => (
                    <Card 
                      key={customer.id}
                      className={`cursor-pointer transition-all ${
                        selectedCustomerId === customer.id ? 'border-2 border-blue-500' : 'hover:shadow-md'
                      }`}
                      onClick={() => handleCustomerSelect(customer.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-gray-100 rounded-full p-3">
                          <UserRound className="h-8 w-8 text-gray-500" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{customer.fullName}</h3>
                          <p className="text-sm text-gray-600">
                            {customer.email} • {customer.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            License: {customer.licenseNumber}
                          </p>
                        </div>
                        <Button 
                          variant={selectedCustomerId === customer.id ? "default" : "outline"}
                          size="sm"
                        >
                          {selectedCustomerId === customer.id ? "Selected" : "Select"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {selectedCustomerId && (
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setActiveTab("details")}>
                    Continue to Rental Details
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new">
              <div className="text-center py-4">
                <p className="mb-6">Add a new customer to the database before renting.</p>
                <Button onClick={() => navigate('/customers/add')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Customer
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              {selectedCustomer && (
                <RentalForm 
                  vehicle={vehicle} 
                  onSubmit={handleSubmit} 
                  customerData={selectedCustomer}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

const RentVehiclePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <RentVehicleContent />
      </main>
      <Footer />
    </div>
  );
};

export default RentVehiclePage;
