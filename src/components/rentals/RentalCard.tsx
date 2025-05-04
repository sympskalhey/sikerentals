import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rental, Vehicle } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addHours, addDays, format } from 'date-fns';
import { toast } from "sonner";

interface RentalCardProps {
  rental: Rental;
  vehicle: Vehicle;
}

const EXTENSION_OPTIONS = [
  { value: '24', label: '24 hours', multiplier: 0.9 }, // Slightly discounted for extensions
  { value: '48', label: '2 days (48 hours)', multiplier: 1.7 },
  { value: '72', label: '3 days (72 hours)', multiplier: 2.4 },
  { value: '168', label: '1 week (7 days)', multiplier: 5.0 },
];

const RentalCard: React.FC<RentalCardProps> = ({ rental, vehicle }) => {
  const { completeRental, getRentalTimeRemaining, extendRental } = useGarage();
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [extensionHours, setExtensionHours] = useState('24');
  const [extensionFee, setExtensionFee] = useState<number>(
    Math.round(rental.rentalFee * 0.9) // Default to 90% of original fee for 24h extension
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    // Update remaining time initially
    updateRemainingTime();
    
    // Update remaining time every minute
    const interval = setInterval(updateRemainingTime, 60000);
    
    return () => clearInterval(interval);
  }, [rental.id]);
  
  useEffect(() => {
    // Calculate extension fee based on original rental and selected extension
    const option = EXTENSION_OPTIONS.find(opt => opt.value === extensionHours);
    if (option) {
      // Base the extension on the original daily rate
      const dailyRate = rental.rentalFee / 24; // Assuming original fee was for 24 hours
      const newFee = Math.round(dailyRate * parseInt(extensionHours) * option.multiplier);
      setExtensionFee(newFee);
    }
  }, [extensionHours, rental.rentalFee]);
  
  const updateRemainingTime = () => {
    const remainingMs = getRentalTimeRemaining(rental.id);
    
    if (remainingMs <= 0) {
      setRemainingTime('Expired');
      return;
    }
    
    // Convert milliseconds to hours, minutes
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    setRemainingTime(`${hours}h ${minutes}m`);
  };
  
  const handleComplete = () => {
    completeRental(rental.id);
    toast.success("Vehicle marked as returned successfully");
  };
  
  const handleExtend = () => {
    const hours = parseInt(extensionHours);
    const endTime = new Date(rental.endTime);
    const newEndTime = hours <= 72 ? addHours(endTime, hours) : addDays(endTime, 7);
    
    extendRental(rental.id, {
      endTime: newEndTime.toISOString(),
      additionalFee: extensionFee
    });
    
    setDialogOpen(false);
    toast.success(`Rental extended by ${extensionHours} hours`);
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card className={rental.status === 'active' ? 'border-green-500 border-2' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
          <span className={`text-sm px-2 py-1 rounded ${
            rental.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : rental.status === 'completed' 
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Renter</h3>
            <p className="text-sm">{rental.renter.fullName}</p>
            <p className="text-sm text-gray-500">{rental.renter.email} | {rental.renter.phone}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4">
            <div>
              <h3 className="font-medium">Start</h3>
              <p className="text-sm">{formatDateTime(rental.startTime)}</p>
            </div>
            
            <div>
              <h3 className="font-medium">End</h3>
              <p className="text-sm">{formatDateTime(rental.endTime)}</p>
            </div>
          </div>
          
          {rental.status === 'active' && (
            <div className="bg-green-50 p-2 rounded text-center">
              <span className="text-sm font-medium">Time remaining: </span>
              <span className="text-sm font-bold">{remainingTime}</span>
            </div>
          )}
          
          <div>
            <h3 className="font-medium">Fee</h3>
            <p className="text-sm">MVR{rental.rentalFee.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
      
      {rental.status === 'active' && (
        <CardFooter className="pt-0 flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
              >
                Extend Rental
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Extend Rental Period</DialogTitle>
                <DialogDescription>
                  Add more time to the current rental period for {vehicle.year} {vehicle.make} {vehicle.model}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Current End Time</Label>
                  <Input value={formatDateTime(rental.endTime)} disabled className="bg-gray-50" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="extensionHours">Add Time</Label>
                  <Select value={extensionHours} onValueChange={setExtensionHours}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select extension period" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXTENSION_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>New End Time</Label>
                  <Input 
                    value={formatDateTime(
                      parseInt(extensionHours) <= 72 
                        ? addHours(new Date(rental.endTime), parseInt(extensionHours)).toISOString()
                        : addDays(new Date(rental.endTime), 7).toISOString()
                    )} 
                    disabled 
                    className="bg-gray-50" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="extensionFee">Extension Fee (MVR)</Label>
                  <Input 
                    id="extensionFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={extensionFee}
                    onChange={(e) => setExtensionFee(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleExtend}>Confirm Extension</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleComplete}
          >
            Mark as Returned
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default RentalCard;
