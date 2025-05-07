
import React, { useState, useEffect } from 'react';
import { Vehicle, Rental, Customer } from '@/types/garage';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, UploadCloud } from 'lucide-react';
import { format, addHours, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type RentalFormProps = {
  vehicle: Vehicle;
  onSubmit: (data: Omit<Rental, 'id' | 'vehicleId' | 'status'>) => void;
  customerData?: Customer;
};

const RENTAL_DURATIONS = [
  { value: '24', label: '24 hours', baseFee: 280, multiplier: 1 },
  { value: '48', label: '2 days (48 hours)', baseFee: 560, multiplier: 1 },
  { value: '72', label: '3 days (72 hours)', baseFee: 840, multiplier: 1 },
  { value: '168', label: '1 week (7 days)', baseFee: 1960, multiplier: 1 },
];

const RentalForm: React.FC<RentalFormProps> = ({ vehicle, onSubmit, customerData }) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | undefined>(undefined);
  const [rentalDuration, setRentalDuration] = useState<string>('24'); // Default 24 hours
  const [rentalFee, setRentalFee] = useState<number>(280); // Default rental fee
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();
  
 // Pre-fill the form if customer data is provided
useEffect(() => {
  if (customerData) {
    setValue('fullName', customerData.fullName);
    setValue('idNumber', customerData.idNumber);
    setValue('phone', customerData.phone);
    
    // Only set address if it exists
    if (customerData.address) {
      setValue('address', customerData.address);
    }
    
    setValue('licenseNumber', customerData.licenseNumber);
    
    if (customerData.idImageUrl) {
      setIdImagePreview(customerData.idImageUrl);
    }
  }
}, [customerData, setValue]);
  
  // Update rental fee when duration changes
  useEffect(() => {
    const selectedDuration = RENTAL_DURATIONS.find(d => d.value === rentalDuration);
    if (selectedDuration) {
      const calculatedFee = Math.round(selectedDuration.baseFee * selectedDuration.multiplier);
      setRentalFee(calculatedFee);
      setValue('rentalFee', calculatedFee);
    }
  }, [rentalDuration, setValue]);
  
  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const calculateEndTime = (): Date => {
    const durationHours = parseInt(rentalDuration);
    if (durationHours <= 72) {
      // For shorter durations, use addHours
      return addHours(startDate, durationHours);
    } else {
      // For week-long rentals, use addDays for better precision
      return addDays(startDate, 7);
    }
  };
  
  const handleDurationChange = (value: string) => {
    setRentalDuration(value);
  };
  
  const processSubmit = (data: any) => {
    const endTime = calculateEndTime();
    
    const processImage = () => {
      if (idImage) {
        // Convert File to data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const idImageUrl = event.target?.result as string;
          finishSubmit(idImageUrl);
        };
        reader.readAsDataURL(idImage);
      } else {
        // Use existing image URL or undefined
        finishSubmit(idImagePreview);
      }
    };
    
    const finishSubmit = (idImageUrl?: string) => {
      onSubmit({
        startTime: startDate.toISOString(),
        endTime: endTime.toISOString(),
        renter: {
          fullName: data.fullName,
          idNumber: data.idNumber,
          phone: data.phone,
          address: data.address,
          licenseNumber: data.licenseNumber,
          idImageUrl: idImageUrl,
          customerId: customerData?.id
        },
        rentalFee: parseFloat(data.rentalFee),
        customerId: customerData?.id
      });
    };
    
    processImage();
  };
  
  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Vehicle Information</h3>
          <div className="bg-gray-50 rounded p-3 space-y-2">
            <div>
              <Label>Vehicle</Label>
              <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
            </div>
            
            <div>
              <Label>License Plate</Label>
              <p className="font-medium">{vehicle.licensePlate}</p>
            </div>
            
            <div>
              <Label>Color</Label>
              <p className="font-medium">{vehicle.color}</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="startTime">Rental Start Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP HH:mm") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
                <div className="p-3 border-t border-border">
                  <Label htmlFor="startTime">Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={format(startDate, "HH:mm")}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newDate = new Date(startDate);
                      newDate.setHours(hours, minutes);
                      setStartDate(newDate);
                    }}
                    className="mt-1"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="rentalDuration">Rental Duration</Label>
            <Select 
              value={rentalDuration}
              onValueChange={handleDurationChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_DURATIONS.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="endTime">Rental End Time</Label>
            <Input
              id="endTime"
              value={format(calculateEndTime(), "PPP HH:mm")}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="rentalFee">Rental Fee (MVR)</Label>
            <Input
              id="rentalFee"
              type="number"
              step="0.01"
              {...register('rentalFee', { 
                required: 'Rental fee is required',
                min: { value: 0, message: 'Rental fee must be positive' }
              })}
              value={rentalFee}
              onChange={(e) => setRentalFee(parseFloat(e.target.value))}
              className={errors.rentalFee ? 'border-red-500' : ''}
            />
            {errors.rentalFee && (
              <p className="text-sm text-red-500 mt-1">{errors.rentalFee.message as string}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Renter Information {customerData && "(Pre-filled)"}</h3>
          
          <div>
            <Label htmlFor="fullName">Full Name*</Label>
            <Input
              id="fullName"
              {...register('fullName', { required: 'Full name is required' })}
              disabled={!!customerData}
              className={cn(
                errors.fullName ? 'border-red-500' : '',
                customerData ? 'bg-gray-50' : ''
              )}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName.message as string}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="idNumber">ID Number*</Label>
              <Input
                id="idNumber"
                type="idNumber"
                {...register('idNumber', { 
                  required: 'Id Card Number is required',
                  pattern: {
                    value: /^[A-Z0-9]+$/i,
                    message: "Invalid ID Card Number"
                  }
                })}
                disabled={!!customerData}
                className={cn(
                  errors.idNumber ? 'border-red-500' : '',
                  customerData ? 'bg-gray-50' : ''
                )}
              />
              {errors.idNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.idNumber.message as string}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone*</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Phone is required' })}
                disabled={!!customerData}
                className={cn(
                  errors.phone ? 'border-red-500' : '',
                  customerData ? 'bg-gray-50' : ''
                )}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message as string}</p>
              )}
            </div>
          </div>
          
          <div>
  <Label htmlFor="address">Address</Label>
  <Input
    id="address"
    {...register('address')}
    placeholder="address / island name"
    className={errors.address ? 'border-red-500' : ''}
  />
  {errors.address && (
    <p className="text-sm text-red-500 mt-1">{errors.address.message as string}</p>
  )}
</div>
          
          <div>
            <Label htmlFor="licenseNumber">Driver's License Number</Label>
            <Input
              id="licenseNumber"
              {...register('licenseNumber',)}
              disabled={!!customerData}
              className={cn(
                errors.licenseNumber ? 'border-red-500' : '',
                customerData ? 'bg-gray-50' : ''
              )}
            />
            {errors.licenseNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.licenseNumber.message as string}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="idImage">ID Document / Driver's License</Label>
            {customerData && idImagePreview ? (
              <div className="mt-2 border rounded-md p-2">
                <img 
                  src={idImagePreview} 
                  alt="ID Preview" 
                  className="max-h-32 object-contain mx-auto" 
                />
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  Using existing ID document from customer records
                </p>
              </div>
            ) : (
              <Card className="mt-1">
                <CardContent className="p-4">
                  <label htmlFor="idImage" className="flex flex-col items-center gap-2 cursor-pointer">
                    {idImagePreview ? (
                      <div className="mt-2">
                        <img 
                          src={idImagePreview} 
                          alt="ID Preview" 
                          className="max-h-32 object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-4">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-center">Upload ID or driver's license</p>
                        <p className="text-xs text-center text-muted-foreground">Click to browse</p>
                      </div>
                    )}
                    <input
                      id="idImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIdImageChange}
                      disabled={!!customerData && !!idImagePreview}
                    />
                  </label>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-garage-blue hover:bg-garage-blue/90"
      >
        Complete Rental
      </Button>
    </form>
  );
};

export default RentalForm;
