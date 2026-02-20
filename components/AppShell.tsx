'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import type { ToastKind } from '@/lib/toast';
import { FormEvent, ReactNode, useState } from 'react';

const nav = [
  { href: '/companies', label: 'Companies' },
  { href: '/lists', label: 'Lists' },
  { href: '/saved', label: 'Saved Searches' }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(true);
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);

  useEffect(() => {
    setVisible(false);
    const timeout = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      setToast(detail);
      setTimeout(() => setToast(null), 2500);
    };
    window.addEventListener('app-toast', onToast);
    return () => window.removeEventListener('app-toast', onToast);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/companies?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon" aria-hidden>◉</span>
          ScoutOS VC
        </div>
        <div className="brand">ScoutOS VC</div>
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={`nav-link ${pathname.startsWith(item.href) ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="main">
        <div className={`container ${visible ? 'fade-in' : 'fade-out'}`}>
          <form onSubmit={onSearch} style={{ marginBottom: 16 }}>
            <input
              className="search-bar"
              placeholder="Global company search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          {children}
        </div>
        {toast && <div className={`toast ${toast.kind}`}>{toast.message}</div>}
        <form onSubmit={onSearch} style={{ marginBottom: 16 }}>
          <input
            className="search-bar"
            placeholder="Global company search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        {children}
      </main>
    </div>
  );
}
