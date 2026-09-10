import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Gamepad2, ChevronDown, Monitor, Mic, Music, Touchpad } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const mainNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Gamepad Tester', href: '/gamepad-tester' },
  { name: 'Stick Drift Test', href: '/stick-drift-test' },
];

const otherTools = [
  {
    name: 'Touch Screen Tester',
    href: '/touch-screen-test',
    description: 'Single & multi-touch screen testing',
    icon: Touchpad,
  },
  {
    name: 'GPU Tester',
    href: '/gpu-tester',
    description: 'WebGL graphics performance analysis',
    icon: Monitor,
  },
  {
    name: 'Mic Tester',
    href: '/mic-tester',
    description: 'Microphone level & audio feedback',
    icon: Mic,
  },
  {
    name: 'MIDI Tester',
    href: '/midi-tester',
    description: 'MIDI signal & controller input check',
    icon: Music,
  },
];

const secondaryNavigation = [
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Privacy Policy', href: '/privacy' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isOtherToolsActive = otherTools.some(
    (tool) => location.pathname === tool.href || (tool.href === '/touch-screen-test' && location.pathname === '/touch-tester')
  );

  return (
    <header className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-3 sm:p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1 items-center shrink-0">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
            <Gamepad2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 shrink-0" />
            <span className="text-lg sm:text-xl font-bold text-gradient transition-all duration-300 group-hover:tracking-wide whitespace-nowrap">
              GamepadTest
            </span>
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

        <ul className="hidden lg:flex lg:items-center lg:gap-x-1 xl:gap-x-2">
          {/* Main nav items */}
          {mainNavigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 px-3 py-2 rounded-md hover:text-primary whitespace-nowrap",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}

          {/* Other Tools Dropdown */}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-md hover:text-primary outline-none whitespace-nowrap cursor-pointer",
                    isOtherToolsActive
                      ? "text-primary bg-primary/10 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span>Other Tools</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64 p-2 shadow-xl border border-gray-200/80 bg-white"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Hardware Testing Tools
                </div>
                {otherTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive =
                    location.pathname === tool.href ||
                    (tool.href === '/touch-screen-test' && location.pathname === '/touch-tester');
                  return (
                    <DropdownMenuItem key={tool.name} asChild className="cursor-pointer my-0.5 rounded-lg">
                      <Link
                        to={tool.href}
                        className={cn(
                          "flex items-start gap-3 p-2.5 transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-md shrink-0 mt-0.5",
                            isActive ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-700"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none text-gray-900">
                            {tool.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {tool.description}
                          </span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>

          {/* Secondary nav items */}
          {secondaryNavigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 px-3 py-2 rounded-md hover:text-primary whitespace-nowrap",
                  location.pathname === item.href
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {/* Header Right spacer */}
        </div>
      </nav>

      {/* Mobile menu */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-nav-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[999999] lg:hidden flex justify-end"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
                aria-hidden="true"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Side drawer panel */}
              <motion.div
                id="mobile-nav"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative z-10 w-full max-w-xs sm:max-w-sm h-full h-[100dvh] bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-5 sm:p-6 shadow-2xl border-l border-border overflow-y-auto flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <Gamepad2 className="h-7 w-7 text-primary shrink-0" />
                      <span className="text-lg font-bold text-gradient">GamepadTest</span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-10 w-10 min-w-[40px] p-0 flex items-center justify-center rounded-lg hover:bg-muted"
                      aria-label="Close menu"
                    >
                      <X className="h-6 w-6" aria-hidden="true" />
                    </Button>
                  </div>

                  <nav className="space-y-6">
                    {/* Primary Tools */}
                    <div>
                      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Primary Tools
                      </div>
                      <div className="space-y-1">
                        {mainNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center min-h-[44px] rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                              location.pathname === item.href
                                ? "text-primary bg-primary/10 font-bold"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Other Hardware Tools */}
                    <div>
                      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Other Testing Tools
                      </div>
                      <div className="space-y-1">
                        {otherTools.map((tool) => {
                          const Icon = tool.icon;
                          const isActive =
                            location.pathname === tool.href ||
                            (tool.href === '/touch-screen-test' && location.pathname === '/touch-tester');
                          return (
                            <Link
                              key={tool.name}
                              to={tool.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 min-h-[44px] rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                                isActive
                                  ? "text-primary bg-primary/10 font-bold"
                                  : "text-foreground hover:bg-muted"
                              )}
                            >
                              <Icon className="h-5 w-5 text-primary shrink-0" />
                              <span>{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Secondary Pages */}
                    <div>
                      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Pages
                      </div>
                      <div className="space-y-1">
                        {secondaryNavigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center min-h-[44px] rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                              location.pathname === item.href
                                ? "text-primary bg-primary/10 font-bold"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </nav>
                </div>

                <div className="pt-6 mt-6 border-t border-border text-xs text-muted-foreground text-center">
                  © {new Date().getFullYear()} GamepadTest. All rights reserved.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}

