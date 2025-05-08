import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RentalCard from '@/components/rentals/RentalCard';

const RentalsList = () => {
  const { rentals, vehicles, refreshSubscriptions, isRefreshing, lastRefreshed } = useGarage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh every 30 seconds to catch any status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format the last refresh time
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return 'Never';
    
    // Format the date as a readable string
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastRefreshed);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    console.log('Manual refresh triggered for rentals');
    refreshSubscriptions();
  };
  
  const filteredRentals = rentals.filter(rental => {
    // Filter by status
    if (activeTab === 'active' && rental.status !== 'active') return false;
    if (activeTab === 'completed' && rental.status !== 'completed') return false;
    if (activeTab === 'cancelled' && rental.status !== 'cancelled') return false;
    
    // Get associated vehicle
    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
    if (!vehicle) return false;
    
    // Search logic
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      rental.renter.fullName.toLowerCase().includes(searchLower) ||
      rental.renter.idNumber.toLowerCase().includes(searchLower) ||
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-garage-blue">Vehicle Rentals</h1>
          <p className="text-muted-foreground">Manage your vehicle rentals.</p>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="h-10 w-10"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh data</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
                <p className="text-xs text-muted-foreground">Last refreshed: {formatLastRefreshed()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button className="bg-garage-blue hover:bg-garage-blue/90" onClick={() => navigate('/vehicles')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Rent a Vehicle
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search by renter name, email, vehicle..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="active" className="flex-1">Active Rentals</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredRentals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => {
            const vehicle = vehicles.find(v => v.id === rental.vehicleId);
            if (!vehicle) return null;
            
            return (
              <RentalCard key={rental.id} rental={rental} vehicle={vehicle} />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          {rentals.some(r => r.status === activeTab) ? (
            <>
              <p className="text-lg mb-2">No rentals match your search.</p>
              <p className="text-muted-foreground">Try a different search term.</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">No {activeTab} rentals found.</p>
              {activeTab === 'active' && (
                <>
                  <p className="text-muted-foreground mb-6">Start by renting out a vehicle.</p>
                  <Button onClick={() => navigate('/vehicles')}>
                    Rent a Vehicle
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

const RentalsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <RentalsList />
      </main>
      <Footer />
    </div>
  );
};

export default RentalsPage;