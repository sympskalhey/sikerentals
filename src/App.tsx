
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { GarageProvider } from "@/context/GarageContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehiclesPage from "./pages/VehiclesPage";
import AddVehiclePage from "./pages/AddVehiclePage";
import EditVehiclePage from "./pages/EditVehiclePage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import InsurancePage from "./pages/InsurancePage";
import AddInsurancePage from "./pages/AddInsurancePage";
import RegistrationPage from "./pages/RegistrationPage";
import AddRegistrationPage from "./pages/AddRegistrationPage";
import MaintenancePage from "./pages/MaintenancePage";
import AddMaintenancePage from "./pages/AddMaintenancePage";
import EditMaintenancePage from "./pages/EditMaintenancePage";
import AddIncidentPage from "./pages/AddIncidentPage";
import EditIncidentPage from "./pages/EditIncidentPage";
import IncidentsPage from "./pages/IncidentsPage";
import DocumentsPage from "./pages/DocumentsPage";
import AnnualFeePage from "./pages/AnnualFeePage";
import AddAnnualFeePage from "./pages/AddAnnualFeePage";
import RentalsPage from "./pages/RentalsPage";
import RentalRecordsPage from "./pages/RentalRecordsPage";
import RentVehiclePage from "./pages/RentVehiclePage";
import RentalDetailsPage from "./pages/RentalDetailsPage";
import CustomersPage from "./pages/CustomersPage";
import AddCustomerPage from "./pages/AddCustomerPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import CustomerDetailsPage from "./pages/CustomerDetailsPage";
import CustomerRentPage from "./pages/CustomerRentPage";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GarageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/vehicles" element={
                <ProtectedRoute>
                  <VehiclesPage />
                </ProtectedRoute>
              } />
              <Route path="/vehicles/add" element={
                <ProtectedRoute>
                  <AddVehiclePage />
                </ProtectedRoute>
              } />
              <Route path="/vehicles/:id" element={
                <ProtectedRoute>
                  <VehicleDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/vehicles/edit/:id" element={
                <ProtectedRoute>
                  <EditVehiclePage />
                </ProtectedRoute>
              } />
              
              {/* Customer routes */}
              <Route path="/customers" element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              } />
              <Route path="/customers/add" element={
                <ProtectedRoute>
                  <AddCustomerPage />
                </ProtectedRoute>
              } />
              <Route path="/customers/:customerId" element={
                <ProtectedRoute>
                  <CustomerDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/customers/edit/:customerId" element={
                <ProtectedRoute>
                  <EditCustomerPage />
                </ProtectedRoute>
              } />
              <Route path="/customers/:customerId/rent" element={
                <ProtectedRoute>
                  <CustomerRentPage />
                </ProtectedRoute>
              } />
              
              {/* Insurance routes */}
              <Route path="/insurance" element={
                <ProtectedRoute>
                  <InsurancePage />
                </ProtectedRoute>
              } />
              <Route path="/insurance/add" element={
                <ProtectedRoute>
                  <AddInsurancePage />
                </ProtectedRoute>
              } />
              <Route path="/insurance/edit/:id" element={
                <ProtectedRoute>
                  <AddInsurancePage />
                </ProtectedRoute>
              } />
              
              {/* Registration routes */}
              <Route path="/registration" element={
                <ProtectedRoute>
                  <RegistrationPage />
                </ProtectedRoute>
              } />
              <Route path="/registration/add" element={
                <ProtectedRoute>
                  <AddRegistrationPage />
                </ProtectedRoute>
              } />
              <Route path="/registration/edit/:id" element={
                <ProtectedRoute>
                  <AddRegistrationPage />
                </ProtectedRoute>
              } />
              
              {/* Annual Fee routes */}
              <Route path="/annualfees" element={
                <ProtectedRoute>
                  <AnnualFeePage />
                </ProtectedRoute>
              } />
              <Route path="/annualfees/add" element={
                <ProtectedRoute>
                  <AddAnnualFeePage />
                </ProtectedRoute>
              } />
              <Route path="/annualfees/edit/:id" element={
                <ProtectedRoute>
                  <AddAnnualFeePage />
                </ProtectedRoute>
              } />
              
              {/* Rental routes */}
              <Route path="/rentals" element={
                <ProtectedRoute>
                  <RentalsPage />
                </ProtectedRoute>
              } />
              <Route path="/rental-records" element={
                <ProtectedRoute>
                  <RentalRecordsPage />
                </ProtectedRoute>
              } />
              <Route path="/rentals/:rentalId" element={
                <ProtectedRoute>
                  <RentalDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/vehicles/:vehicleId/rent" element={
                <ProtectedRoute>
                  <RentVehiclePage />
                </ProtectedRoute>
              } />
              
              {/* Maintenance routes */}
              <Route path="/maintenance" element={
                <ProtectedRoute>
                  <MaintenancePage />
                </ProtectedRoute>
              } />
              <Route path="/maintenance/add" element={
                <ProtectedRoute>
                  <AddMaintenancePage />
                </ProtectedRoute>
              } />
              <Route path="/maintenance/edit/:id" element={
                <ProtectedRoute>
                  <EditMaintenancePage />
                </ProtectedRoute>
              } />
              
              {/* Documents routes */}
              <Route path="/documents" element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              } />
              
              {/* Incident routes */}
              <Route path="/incidents" element={
                <ProtectedRoute>
                  <IncidentsPage />
                </ProtectedRoute>
              } />
              <Route path="/incidents/add" element={
                <ProtectedRoute>
                  <AddIncidentPage />
                </ProtectedRoute>
              } />
              <Route path="/incidents/edit/:id" element={
                <ProtectedRoute>
                  <EditIncidentPage />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </GarageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
