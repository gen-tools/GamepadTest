import { Link } from 'react-router-dom';
import { Gamepad2, Github, Twitter, Mail } from 'lucide-react';

const navigation = {
  testers: [
    { name: 'Gamepad Tester', href: '/gamepad-tester' },
    { name: 'GPU Tester', href: '/gpu-tester' },
    { name: 'Mic Tester', href: '/mic-tester' },
    { name: 'MIDI Tester', href: '/midi-tester' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
  social: [
    {
      name: 'GitHub',
      href: '#',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'Email',
      href: 'mailto:hello@gamepadtester.com',
      icon: Mail,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gradient">GamepadTest</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              The ultimate online testing suite for your gaming and audio hardware. 
              Test gamepads, GPUs, microphones, and MIDI devices with precision and ease.
            </p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-foreground">Hardware Testers</h3>
                <ul role="list" className="mt-4 space-y-2">
                  {navigation.testers.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-foreground">Company</h3>
                <ul role="list" className="mt-4 space-y-2">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 sm:mt-12 lg:mt-16">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; 2025 GamepadTest. All rights reserved. Built for gamers, by gamers.
          </p>
        </div>
      </div>
    </footer>
  );
}
