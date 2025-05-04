
import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GarageProvider, useGarage } from '@/context/GarageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-MV', {
    style: 'currency',
    currency: 'MVR',
  }).format(amount);
};

// Helper to get month name from date
const getMonthName = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

// Helper to get unique months from rental data
const getUniqueMonths = (rentals: any[]): { value: string; label: string }[] => {
  const months = new Set<string>();
  
  rentals.forEach(rental => {
    const startDate = new Date(rental.startTime);
    const monthYear = format(startDate, 'yyyy-MM');
    months.add(monthYear);
  });
  
  return Array.from(months)
    .map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return {
        value: month,
        label: getMonthName(date)
      };
    })
    .sort((a, b) => b.value.localeCompare(a.value)); // Sort by newest first
};

const RentalRecordsList = () => {
  const { rentals, vehicles, customers } = useGarage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Get unique months for the dropdown
  const monthOptions = useMemo(() => getUniqueMonths(rentals), [rentals]);
  
  // Set the most recent month as default if available
  useEffect(() => {
    if (monthOptions.length > 0 && selectedPeriod === "all") {
      setSelectedPeriod(monthOptions[0].value);
    }
  }, [monthOptions]);
  
  // Filter rentals based on selected period and status
  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      // Filter by status
      if (selectedStatus !== "all" && rental.status !== selectedStatus) {
        return false;
      }
      
      // Filter by period
      if (selectedPeriod !== "all") {
        const rentalDate = new Date(rental.startTime);
        const rentalMonth = format(rentalDate, 'yyyy-MM');
        if (rentalMonth !== selectedPeriod) {
          return false;
        }
      }
      
      // Filter by search term
      if (searchTerm) {
        const vehicle = vehicles.find(v => v.id === rental.vehicleId);
        const customer = customers.find(c => c.id === rental.customerId);
        const searchLower = searchTerm.toLowerCase();
        
        const vehicleMatch = vehicle && (
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.licensePlate.toLowerCase().includes(searchLower)
        );
        
        const customerMatch = customer && (
          customer.fullName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower)
        );
        
        const renterMatch = 
          rental.renter.fullName.toLowerCase().includes(searchLower) ||
          rental.renter.email.toLowerCase().includes(searchLower);
        
        return vehicleMatch || customerMatch || renterMatch;
      }
      
      return true;
    });
  }, [rentals, selectedPeriod, selectedStatus, searchTerm, vehicles, customers]);
  
  // Calculate revenue for the selected period
  const totalRevenue = useMemo(() => {
    return filteredRentals.reduce((sum, rental) => sum + rental.rentalFee, 0);
  }, [filteredRentals]);
  
  // Count rentals by status
  const rentalCounts = useMemo(() => {
    const counts = {
      active: 0,
      completed: 0,
      cancelled: 0
    };
    
    filteredRentals.forEach(rental => {
      if (rental.status in counts) {
        counts[rental.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  }, [filteredRentals]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-garage-blue">Rental Records</h1>
          <p className="text-muted-foreground">Track and analyze your rental history and revenue.</p>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Time Period</label>
          <Select 
            value={selectedPeriod} 
            onValueChange={(value) => setSelectedPeriod(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search vehicles, customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-garage-blue">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedPeriod === "all" ? "All time" : `For ${monthOptions.find(m => m.value === selectedPeriod)?.label}`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-garage-blue">
              {filteredRentals.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Active: {rentalCounts.active} | Completed: {rentalCounts.completed} | Cancelled: {rentalCounts.cancelled}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Rental Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-garage-blue">
              {filteredRentals.length > 0 
                ? formatCurrency(totalRevenue / filteredRentals.length) 
                : formatCurrency(0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Per rental transaction
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Rental Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRentals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Renter</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rental Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => {
                  const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                  return (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                      </TableCell>
                      <TableCell>{rental.renter.fullName}</TableCell>
                      <TableCell>{format(new Date(rental.startTime), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(new Date(rental.endTime), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={
                          rental.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                          rental.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                          'bg-red-100 text-red-800 hover:bg-red-200'
                        }>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(rental.rentalFee)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/rentals/${rental.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg mb-2">No rental records found.</p>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try a different search term or filter.' : 'Start by renting out a vehicle.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const RentalRecordsPage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <RentalRecordsList />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default RentalRecordsPage;
