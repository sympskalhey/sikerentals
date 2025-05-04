import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Insurance } from '@/types/garage';
import { useGarage } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InsuranceFormProps {
  insurance?: Insurance;
  vehicleId?: string;
  isEditing?: boolean;
}

const insuranceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  provider: z.string().min(1, 'Provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  startDate: z.date({ required_error: 'Start date is required' }),
  expiryDate: z.date({ required_error: 'Expiry date is required' }),
  premium: z.coerce.number().min(0, 'Premium must be a positive number'),
  coverage: z.string().min(1, 'Coverage details are required'),
  documents: z.array(z.string()).optional(),
});

type InsuranceFormValues = z.infer<typeof insuranceSchema>;

const InsuranceForm: React.FC<InsuranceFormProps> = ({ insurance, vehicleId, isEditing }) => {
  const { vehicles, addInsurance, updateInsurance } = useGarage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      vehicleId: vehicleId || insurance?.vehicleId || '',
      provider: insurance?.provider || '',
      policyNumber: insurance?.policyNumber || '',
      startDate: insurance?.startDate ? new Date(insurance.startDate) : undefined,
      expiryDate: insurance?.expiryDate ? new Date(insurance.expiryDate) : undefined,
      premium: insurance?.premium || 0,
      coverage: insurance?.coverage || '',
      documents: insurance?.documents || [],
    },
  });

  const onSubmit = async (data: InsuranceFormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure all required fields are provided
      const insuranceData: Omit<Insurance, 'id'> = {
        vehicleId: data.vehicleId,
        provider: data.provider,
        policyNumber: data.policyNumber,
        startDate: data.startDate.toISOString(),
        expiryDate: data.expiryDate.toISOString(),
        premium: data.premium,
        coverage: data.coverage,
        documents: data.documents || [],
      };

      if (insurance) {
        updateInsurance(insurance.id, insuranceData);
        toast.success('Insurance policy updated successfully');
      } else {
        addInsurance(insuranceData);
        toast.success('Insurance policy added successfully');
      }
      navigate('/insurance');
    } catch (error) {
      console.error('Error saving insurance:', error);
      toast.error('Failed to save insurance policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!vehicleId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.map((vehicle) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Provider</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Allied, Amanatakaful" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="policyNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Policy Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. POL-12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
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
                        date > new Date() || date < new Date("1900-01-01")
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
                          "pl-3 text-left font-normal",
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
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="premium"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Premium Amount (MVR)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coverage Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the coverage details, limits, deductibles, etc."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/insurance')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : insurance ? 'Update Insurance' : 'Add Insurance'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InsuranceForm;
