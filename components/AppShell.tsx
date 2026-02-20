'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/companies?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">ScoutOS VC</div>
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className={`nav-link ${pathname.startsWith(item.href) ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="main">
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
