'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Company } from '@/lib/types';
import { readLocal, writeLocal } from '@/lib/storage';
import { toast } from '@/lib/toast';

const PAGE_SIZE = 5;

export function CompaniesTable({
  companies,
  initialQuery,
  initialSector
}: {
  companies: Company[];
  initialQuery: string;
  initialSector: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'name' | 'employees'>('name');
  const [page, setPage] = useState(1);
  const [savedCount, setSavedCount] = useState(0);

  const sectors = useMemo(() => Array.from(new Set(companies.map((c) => c.sector))), [companies]);
  const [sector, setSector] = useState(sectors.includes(initialSector) ? initialSector : 'all');

  useEffect(() => {
    setQuery(initialQuery);
    setSector(sectors.includes(initialSector) ? initialSector : 'all');
  }, [initialQuery, initialSector, sectors]);

  useEffect(() => {
    setPage(1);
  }, [query, sector, sortBy]);

  useEffect(() => {
    const searches = readLocal<Array<{ id: string }>>('saved-searches', []);
    setSavedCount(searches.length);
  }, []);

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
    setSavedCount(existing.length + 1);
    toast('Saved search added');
  };

  const stageClass = (stage: string) => {
    const key = stage.toLowerCase();
    if (key.includes('seed')) return 'stage-badge seed';
    if (key.includes('series a') || key.includes('series b')) return 'stage-badge growth';
    if (key.includes('late') || key.includes('series c')) return 'stage-badge late';
    return 'stage-badge';
  };

  return (
    <div className="grid gap-lg">
      <div className="stats-grid">
        <div className="stat-card"><div className="small">Total Companies</div><div className="stat-value">{companies.length}</div></div>
        <div className="stat-card"><div className="small">Filtered Results</div><div className="stat-value">{filtered.length}</div></div>
        <div className="stat-card"><div className="small">Saved Searches</div><div className="stat-value">{savedCount}</div></div>
      </div>

      <div className="panel filter-card row">
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
        <button className="primary" onClick={saveSearch}>Save Search</button>
      </div>

      <div className="panel">
        <table className="table">
          <thead><tr><th>Company</th><th>Sector</th><th>Stage</th><th>Location</th><th className="employees">Employees</th></tr></thead>
          <tbody>
            {!slice.length && (
              <tr><td colSpan={5}><div className="empty-state">🔎 No results found. Try a different query or sector filter.</div></td></tr>
            )}
            {slice.map((c) => (
              <tr key={c.id}>
                <td><Link href={`/companies/${c.id}`} style={{ color: '#9eb4ff' }}>{c.name}</Link></td>
                <td>{c.sector}</td>
                <td><span className={stageClass(c.stage)}>{c.stage}</span></td>
                <td>{c.location}</td>
                <td className="employees">{c.employees}</td>
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
    </div>
  );
}
