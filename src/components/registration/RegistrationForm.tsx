import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGarage } from '@/context/GarageContext';
import { Registration, Vehicle } from '@/types/garage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  vehicleId: z.string({
    required_error: "Please select a vehicle",
  }),
  expiryDate: z.date({
    required_error: "Please select an expiry date",
  }),
  fee: z.coerce.number().min(0, {
    message: "Fee must be a positive number",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters",
  }),
  renewalUrl: z.string().url({
    message: "Please enter a valid URL",
  }).optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  registration?: Registration;
  onSubmit?: (data: FormValues) => void;
  isEditing?: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ registration, onSubmit, isEditing }) => {
  const { vehicles, addRegistration, updateRegistration } = useGarage();
  const navigate = useNavigate();
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: registration?.vehicleId || '',
      expiryDate: registration?.expiryDate ? new Date(registration.expiryDate) : undefined,
      fee: registration?.fee || 0,
      state: registration?.state || '',
      renewalUrl: registration?.renewalUrl || '',
      notes: '',
    },
  });

  useEffect(() => {
    // Filter out vehicles that already have registrations if creating a new registration
    if (!registration) {
      setAvailableVehicles(vehicles);
    } else {
      setAvailableVehicles(vehicles);
    }
  }, [vehicles, registration]);

  const handleSubmit = (data: FormValues) => {
    if (onSubmit) {
      onSubmit({
        ...data,
        expiryDate: data.expiryDate,
      });
    } else {
      // Default behavior if no onSubmit is provided
      if (registration && registration.id) {
        // Update existing registration - ensure all required fields are present
        updateRegistration(registration.id, {
          vehicleId: data.vehicleId, // Explicitly include required fields
          expiryDate: data.expiryDate.toISOString(),
          fee: data.fee,
          state: data.state,
          renewalUrl: data.renewalUrl || '',
        });
        navigate('/registration');
      } else {
        // Add new registration - ensure all required fields are present
        addRegistration({
          vehicleId: data.vehicleId, // Explicitly include required fields
          expiryDate: data.expiryDate.toISOString(),
          fee: data.fee,
          state: data.state,
          renewalUrl: data.renewalUrl || '',
        });
        navigate('/registration');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!!registration} // Disable if editing
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Fee (MVR)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renewalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renewal URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            {registration ? 'Update Registration' : 'Add Registration'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RegistrationForm;
