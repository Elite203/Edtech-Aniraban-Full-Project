
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useCart } from "@/contexts/CartContext";
import NavLinks from "@/components/navbar/NavLinks";
import MobileMenu from "@/components/navbar/MobileMenu";
import NavbarActions from "@/components/navbar/NavbarActions";
import NavbarLogo from "@/components/navbar/NavbarLogo";


const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-[1000]"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <NavbarLogo />

          <div className="hidden lg:flex items-center space-x-2">
            <NavLinks />
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            <NavbarActions 
              theme={theme} 
              setTheme={setTheme} 
              cartItemCount={cart.length} 
              onCartClick={() => navigate('/cart')} 
            />
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenu 
            toggleMobileMenu={toggleMobileMenu} 
            onLoginClick={() => { navigate('/login'); toggleMobileMenu();}}
            onSignupClick={() => { navigate('/signup'); toggleMobileMenu();}}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;
