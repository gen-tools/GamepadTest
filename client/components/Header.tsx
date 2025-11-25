import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Gamepad Tester', href: '/gamepad-tester' },
  { name: 'GPU Tester', href: '/gpu-tester' },
  { name: 'Mic Tester', href: '/mic-tester' },
  { name: 'MIDI Tester', href: '/midi-tester' },
  { name: 'About', href: '/about' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Blog', href: '/blog' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-[60] w-full border-b bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
            <Gamepad2 className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-xl font-bold text-gradient transition-all duration-300 group-hover:tracking-wide">GamepadTest</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5"
            aria-label="Open main menu"
            aria-controls="mobile-nav"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>
        
        <ul className="hidden lg:flex lg:items-center lg:gap-x-4">
          {navigation.map((item, index) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 hover:text-primary relative px-3 py-2 rounded-md hover-scale group",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* Removed theme toggle to keep light theme only */}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-30 bg-black/40" aria-hidden onClick={() => setMobileMenuOpen(false)}></div>
          <div id="mobile-nav" className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border animate-in slide-in-from-right duration-300 ease-out">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                <Gamepad2 className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gradient">GamepadTest</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 p-2.5"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-6 flow-root">
              <nav className="-my-6 divide-y divide-border">
                <ul className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-accent",
                          location.pathname === item.href
                            ? "text-primary bg-primary/10"
                            : "text-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
