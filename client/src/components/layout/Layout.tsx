import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import {
  Shield,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  User,
  KeyRound,
} from 'lucide-react';
import type { BaseProps, WithChildren } from '@/types';

interface LayoutProps extends BaseProps, WithChildren {
  showHeader?: boolean;
  showFooter?: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Shield },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Password Checker', href: '/password-checker', icon: KeyRound },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Layout = ({ children, className, showHeader = true, showFooter = true }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <header 
          className={cn(
            'fixed top-0 z-50 w-full transition-all duration-300',
            isScrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm' : 'bg-background'
          )}
        >
          <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-8">
            <div className="flex items-center min-w-0">
              <Link to="/" className="flex items-center space-x-2 min-w-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <span className="text-lg sm:text-xl font-semibold text-foreground tracking-tight truncate">VigiLynx</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-2 lg:px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                      isActive 
                        ? 'text-foreground bg-muted' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-1 sm:space-x-3">
              <button className="hidden sm:inline-flex rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="hidden sm:inline-flex rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>            </div>
          </div>
        </header>
      )}

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-50 bg-background/80 backdrop-blur-lg border-b border-border md:hidden"
          >
            <nav className="container mx-auto space-y-1 px-4 py-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-muted text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn('min-h-screen pt-14 sm:pt-16', className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-3 sm:px-4 lg:px-8"
        >
          {children}
        </motion.div>
      </main>

      {showFooter && (
        <footer className="border-t border-border bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">VigiLynx</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced cybersecurity solutions for modern threats.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} VigiLynx. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};