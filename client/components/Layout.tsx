import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Header />
      <ScrollToTop />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
