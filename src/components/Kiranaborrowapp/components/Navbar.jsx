import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Store, PlusCircle, History, BarChart3, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Store },
    { name: 'Add Borrow', path: '/borrow', icon: PlusCircle },
    { name: 'Borrow Log', path: '/log', icon: History },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Manage Items', path: '/products', icon: Settings },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div 
            className="flex cursor-pointer items-center space-x-2 transition-transform active:scale-95"
            onClick={() => { navigate('/'); setMenuOpen(false); }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-lg">
              🛒
            </span>
            <span className="text-xl font-bold tracking-tight text-secondary">
              Kirana<span className="text-primary">Borrow</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <ul className="flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                        active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links */}
      {menuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <ul className="space-y-1 px-2 pb-3 pt-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className={`flex w-full items-center space-x-3 rounded-md px-3.5 py-2.5 text-base font-medium transition-colors ${
                      active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
