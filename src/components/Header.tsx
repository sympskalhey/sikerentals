import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Bike, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  Shield, 
  FileCheck, 
  Wrench, 
  Receipt, 
  LogOut,
  UserRound
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center text-garage-blue">
              <Bike className="mr-2 h-6 w-6" />
              <span className="font-bold text-xl">Sike Rentals</span>
            </NavLink>
          </div>
          
          {!isMobile ? (
            <nav className="hidden md:flex space-x-6 ml-10">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-garage-blue ${
                    isActive ? "text-garage-blue" : "text-gray-600"
                  }`
                } 
                end
              >
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/vehicles" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-garage-blue ${
                    isActive ? "text-garage-blue" : "text-gray-600"
                  }`
                }
              >
                Vehicles
              </NavLink>
              
              <NavLink 
                to="/customers" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-garage-blue ${
                    isActive ? "text-garage-blue" : "text-gray-600"
                  }`
                }
              >
                Customers
              </NavLink>
              
              <NavLink 
                to="/rentals" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-garage-blue ${
                    isActive ? "text-garage-blue" : "text-gray-600"
                  }`
                }
              >
                Rentals
              </NavLink>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium text-gray-600 hover:text-garage-blue transition-colors outline-none">
                  Records
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate("/insurance")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Insurance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/registration")}>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Registration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/maintenance")}>
                    <Wrench className="mr-2 h-4 w-4" />
                    Maintenance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/annualfees")}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Annual Fees
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <NavLink 
                to="/documents" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors hover:text-garage-blue ${
                    isActive ? "text-garage-blue" : "text-gray-600"
                  }`
                }
              >
                Documents
              </NavLink>
            </nav>
          ) : (
            <button onClick={toggleMobileMenu} className="p-2 rounded-md md:hidden">
              <Menu className="h-6 w-6" />
            </button>
          )}

          <div className="hidden md:flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-garage-blue text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center text-garage-blue">
              <Bike className="mr-2 h-6 w-6" />
              <span className="font-bold text-xl">Garage Tracker</span>
            </div>
            <button onClick={closeMobileMenu}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-col p-4 space-y-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                }`
              } 
              onClick={closeMobileMenu}
              end
            >
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/vehicles" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                }`
              }
              onClick={closeMobileMenu}
            >
              Vehicles
            </NavLink>
            
            <NavLink 
              to="/customers" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                }`
              }
              onClick={closeMobileMenu}
            >
              <UserRound className="inline mr-2 h-4 w-4" />
              Customers
            </NavLink>
            
            <NavLink 
              to="/rentals" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                }`
              }
              onClick={closeMobileMenu}
            >
              Rentals
            </NavLink>
            
            <div className="border-t border-gray-200 pt-2">
              <p className="text-sm font-medium text-gray-500 px-2">Records</p>
            </div>
            
            <NavLink 
              to="/insurance" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                } pl-4`
              }
              onClick={closeMobileMenu}
            >
              <Shield className="inline mr-2 h-4 w-4" />
              Insurance
            </NavLink>
            
            <NavLink 
              to="/registration" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                } pl-4`
              }
              onClick={closeMobileMenu}
            >
              <FileCheck className="inline mr-2 h-4 w-4" />
              Registration
            </NavLink>
            
            <NavLink 
              to="/maintenance" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                } pl-4`
              }
              onClick={closeMobileMenu}
            >
              <Wrench className="inline mr-2 h-4 w-4" />
              Maintenance
            </NavLink>
            
            <NavLink 
              to="/annualfees" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                } pl-4`
              }
              onClick={closeMobileMenu}
            >
              <Receipt className="inline mr-2 h-4 w-4" />
              Annual Fees
            </NavLink>
            
            <NavLink 
              to="/documents" 
              className={({ isActive }) => 
                `text-lg font-medium p-2 rounded-md transition-colors ${
                  isActive ? "bg-blue-50 text-garage-blue" : "text-gray-600"
                }`
              }
              onClick={closeMobileMenu}
            >
              <FileText className="inline mr-2 h-4 w-4" />
              Documents
            </NavLink>
            
            <div className="border-t border-gray-200 pt-2 mt-auto">
              <button 
                className="w-full text-lg font-medium p-2 rounded-md text-red-600 hover:bg-red-50"
                onClick={() => {
                  handleSignOut();
                  closeMobileMenu();
                }}
              >
                <LogOut className="inline mr-2 h-4 w-4" />
                Log Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
