
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VehiclesList = () => {
  const { vehicles, refreshSubscriptions, isRefreshing, lastRefreshed } = useGarage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
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
    console.log('Manual refresh triggered');
    refreshSubscriptions();
  };

  // Calculate counts for the filter tabs
  const availableCount = vehicles.filter(v => !v.isRented).length;
  const rentedCount = vehicles.filter(v => v.isRented).length;

  // Filter vehicles based on search and availability filter
  const filteredVehicles = vehicles.filter(
    (vehicle) => {
      // Filter by search term
      const matchesSearch = 
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm) ||
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by availability
      if (activeFilter === "all") return matchesSearch;
      if (activeFilter === "available") return matchesSearch && !vehicle.isRented;
      if (activeFilter === "rented") return matchesSearch && vehicle.isRented;
      
      return matchesSearch;
    }
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-garage-blue">My Vehicles</h1>
          <p className="text-muted-foreground">Manage your vehicle collection.</p>
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
          
          <Button className="bg-garage-blue hover:bg-garage-blue/90" onClick={() => navigate('/vehicles/add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Vehicle
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search by make, model, year, or plate number..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Vehicles ({vehicles.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableCount})</TabsTrigger>
          <TabsTrigger value="rented">Currently Rented ({rentedCount})</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {vehicles.length > 0 ? (
            <>
              <p className="text-lg mb-2">No vehicles match your search.</p>
              <p className="text-muted-foreground">Try a different search term or filter.</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">You haven't added any vehicles yet.</p>
              <p className="text-muted-foreground mb-6">Start by adding your first vehicle.</p>
              <Button onClick={() => navigate('/vehicles/add')}>
                Add Your First Vehicle
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};

const VehiclesPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <VehiclesList />
      </main>
      <Footer />
    </div>
  );
};

export default VehiclesPage;
