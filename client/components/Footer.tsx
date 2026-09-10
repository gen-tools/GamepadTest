import { Link } from 'react-router-dom';
import { Gamepad2, Github, Twitter, Mail } from 'lucide-react';

const navigation = {
  testers: [
    { name: 'Gamepad Tester', href: '/gamepad-tester' },
    { name: 'Stick Drift Test', href: '/stick-drift-test' },
    { name: 'GPU Tester', href: '/gpu-tester' },
    { name: 'Mic Tester', href: '/mic-tester' },
    { name: 'MIDI Tester', href: '/midi-tester' },
    { name: 'Touch Screen', href: '/touch-screen-test' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
  moreTools: [
    { name: "Etsy Fee Calculator", href: "https://etsy-fee-calculator-c.vercel.app/" },
    { name: "v2rayN", href: "https://v2rayn-download.vercel.app/" },
  ],
  social: [
    {
      name: 'GitHub',
      href: 'https://github.com/gen-tools/GamepadTest',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'Email',
      href: 'mailto:sa0663787@gmail.com',
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
              <div>
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
            <div>
              <h3 className="text-sm font-semibold leading-6 text-foreground">More Tools</h3>
              <ul role="list" className="mt-4 space-y-2">
                {navigation.moreTools.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; 2026 GamepadTest. All rights reserved. Developed by Sheztech.
          </p>
        </div>
      </div>
    </footer>
  );
}
