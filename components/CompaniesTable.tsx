'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Company } from '@/lib/types';
import { readLocal, writeLocal } from '@/lib/storage';

const PAGE_SIZE = 3;

export function CompaniesTable({ companies, initialQuery }: { companies: Company[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [sector, setSector] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'employees'>('name');
  const [page, setPage] = useState(1);

  const sectors = Array.from(new Set(companies.map((c) => c.sector)));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return companies
      .filter((c) => (sector === 'all' ? true : c.sector === sector))
      .filter((c) => [c.name, c.description, c.location].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (sortBy === 'name' ? a.name.localeCompare(b.name) : b.employees - a.employees));
  }, [companies, query, sector, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const saveSearch = () => {
    const existing = readLocal<Array<{ id: string; query: string; sector: string; createdAt: string }>>('saved-searches', []);
    const item = { id: crypto.randomUUID(), query, sector, createdAt: new Date().toISOString() };
    writeLocal('saved-searches', [item, ...existing]);
    alert('Saved search added.');
  };

  return (
    <div className="panel grid" style={{ gap: 12 }}>
      <div className="row">
        <input className="input" placeholder="Search companies..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="all">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'employees')}>
          <option value="name">Sort: Name</option>
          <option value="employees">Sort: Employees</option>
        </select>
        <button className="secondary" onClick={saveSearch}>Save Search</button>
      </div>
      <table className="table">
        <thead><tr><th>Company</th><th>Sector</th><th>Stage</th><th>Location</th><th>Employees</th></tr></thead>
        <tbody>
          {slice.map((c) => (
            <tr key={c.id}>
              <td><Link href={`/companies/${c.id}`} style={{ color: '#9eb4ff' }}>{c.name}</Link></td>
              <td>{c.sector}</td><td>{c.stage}</td><td>{c.location}</td><td>{c.employees}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row">
        <button className="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span className="small">Page {page} / {pages}</span>
        <button className="secondary" onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</button>
      </div>
    </div>
  );
}
