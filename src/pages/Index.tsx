
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleSummary from '@/components/Dashboard/VehicleSummary';
import MaintenanceSummary from '@/components/Dashboard/MaintenanceSummary';
import IncidentSummary from '@/components/Dashboard/IncidentSummary';
import RentalSummary from '@/components/Dashboard/RentalSummary';
import { GarageProvider, useGarage } from '@/context/GarageContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardContent = () => {
  const navigate = useNavigate();
  const { vehicles, rentals } = useGarage();
  
  // Ensure vehicle rental status is consistent with active rentals
  useEffect(() => {
    const activeRentals = rentals.filter(r => r.status === 'active');
    const rentedVehicleIds = new Set(activeRentals.map(r => r.vehicleId));
    
    // Log any inconsistencies for debugging
    vehicles.forEach(vehicle => {
      const shouldBeRented = rentedVehicleIds.has(vehicle.id);
      if (shouldBeRented !== !!vehicle.isRented) {
        console.log('Vehicle rental status inconsistency:', {
          vehicleId: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          isMarkedRented: vehicle.isRented,
          hasActiveRental: shouldBeRented
        });
      }
    });
  }, [vehicles, rentals]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-garage-blue">Dashboard</h1>
          <p className="text-muted-foreground">Manage all aspects of your vehicles in one place.</p>
        </div>
        <div className="flex space-x-4">
          <Button className="bg-garage-blue hover:bg-garage-blue/90" onClick={() => navigate('/vehicles/add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
          <Button variant="outline" onClick={() => navigate('/maintenance/add')}>
            Add Service Record
          </Button>
          <Button variant="outline" onClick={() => navigate('/rental-records')}>
            <FileText className="mr-2 h-4 w-4" />
            Rental Records
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-garage-blue">Vehicle Overview</h2>
          <VehicleSummary />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4 text-garage-blue">Rental Status</h2>
          <RentalSummary />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4 text-garage-blue">Maintenance & Service</h2>
          <MaintenanceSummary />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4 text-garage-blue">Incidents & Claims</h2>
          <IncidentSummary />
        </section>
      </div>
    </>
  );
};

const Index = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <DashboardContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default Index;
