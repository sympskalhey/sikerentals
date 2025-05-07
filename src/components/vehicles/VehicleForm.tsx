
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Vehicle } from '@/types/garage';
import { Upload, Image } from 'lucide-react';

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1900 && Number(val) <= new Date().getFullYear() + 1, {
    message: "Year must be a valid year",
  }),
  licensePlate: z.string().min(1, "License plate is required"),
  color: z.string().min(1, "Color is required"),
  vin: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  imageUrl: z.string().optional(),
});

interface VehicleFormProps {
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => void;
  initialData?: Vehicle;
  buttonText?: string;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ 
  onSubmit, 
  initialData, 
  buttonText = "Add Vehicle"
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialData?.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData ? {
      ...initialData,
      year: initialData.year.toString(),
      purchasePrice: initialData.purchasePrice?.toString(),
      purchaseDate: initialData.purchaseDate || "",
      vin: initialData.vin || "",
      imageUrl: initialData.imageUrl || "",
    } : {
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      licensePlate: "",
      color: "",
      vin: "",
      purchaseDate: "",
      purchasePrice: "",
      imageUrl: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview using FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        form.setValue("imageUrl", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (values: z.infer<typeof vehicleSchema>) => {
    // No need for special processing here since we're already storing the data URL
    onSubmit({
      make: values.make,
      model: values.model,
      year: Number(values.year),
      licensePlate: values.licensePlate,
      color: values.color,
      vin: values.vin || undefined,
      purchaseDate: values.purchaseDate || undefined,
      purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
      imageUrl: values.imageUrl || undefined,
    });
    
    if (!initialData) {
      form.reset();
      setSelectedImage(null);
      setImageFile(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Yamaha , Honda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g Exciter 125 , Airblade 160" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input type="number" min={1900} max={new Date().getFullYear() + 1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. A0G1225 , AA0G-P1225" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Blue , Red" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="vin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engine Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Engine Number" {...field} />
              </FormControl>
              <FormDescription>
                The unique identification number of your vehicle.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} placeholder="e.g. 25000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <FormLabel>Vehicle Image</FormLabel>
          <div className="flex items-center space-x-4">
            <div 
              className="relative h-40 w-64 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => document.getElementById('vehicle-image')?.click()}
            >
              {selectedImage ? (
                <div className="h-full w-full relative">
                  <img 
                    src={selectedImage} 
                    alt="Vehicle preview" 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm">Change Image</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Click to upload image</p>
                </>
              )}
            </div>
            
            <input
              type="file"
              id="vehicle-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            
            {imageFile && (
              <div className="text-sm text-gray-500">
                <p className="font-medium">{imageFile.name}</p>
                <p>{Math.round(imageFile.size / 1024)} KB</p>
              </div>
            )}
          </div>
          <FormDescription>
            Upload an image of your vehicle (optional).
          </FormDescription>
        </div>

        <Button type="submit" className="w-full bg-garage-blue hover:bg-garage-blue/90">
          {buttonText}
        </Button>
      </form>
    </Form>
  );
};

export default VehicleForm;
