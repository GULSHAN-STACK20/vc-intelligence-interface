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
  const [sector, setSector] = useState(initialSector || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'employees'>('name');
  const [page, setPage] = useState(1);
  const [savedCount, setSavedCount] = useState(0);

  const sectors = useMemo(
    () => Array.from(new Set(companies.map((c) => c.sector))),
    [companies]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return companies
      .filter((c) => (sector === 'all' ? true : c.sector === sector))
      .filter((c) =>
        [c.name, c.description, c.location]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .sort((a, b) =>
        sortBy === 'name'
          ? a.name.localeCompare(b.name)
          : b.employees - a.employees
      );
  }, [companies, query, sector, sortBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    const searches = readLocal<Array<{ id: string }>>(
      'saved-searches',
      []
    );
    setSavedCount(searches.length);
  }, []);

  const saveSearch = () => {
    const existing = readLocal<
      Array<{ id: string; query: string; sector: string; createdAt: string }>
    >('saved-searches', []);

    const item = {
      id: crypto.randomUUID(),
      query,
      sector,
      createdAt: new Date().toISOString()
    };

    writeLocal('saved-searches', [item, ...existing]);
    setSavedCount(existing.length + 1);
    toast('Saved search added');
  };

  return (
    <div className="panel grid" style={{ gap: 12 }}>
      <div className="row">
        <input
          className="input"
          placeholder="Search companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
        >
          <option value="all">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'name' | 'employees')
          }
        >
          <option value="name">Sort: Name</option>
          <option value="employees">Sort: Employees</option>
        </select>

        <button className="primary" onClick={saveSearch}>
          Save Search
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Sector</th>
            <th>Stage</th>
            <th>Location</th>
            <th>Employees</th>
          </tr>
        </thead>
        <tbody>
          {!slice.length && (
            <tr>
              <td colSpan={5}>
                <div className="empty-state">
                  🔎 No results found.
                </div>
              </td>
            </tr>
          )}

          {slice.map((c) => (
            <tr key={c.id}>
              <td>
                <Link
                  href={`/companies/${c.id}`}
                  style={{ color: '#9eb4ff' }}
                >
                  {c.name}
                </Link>
              </td>
              <td>{c.sector}</td>
              <td>{c.stage}</td>
              <td>{c.location}</td>
              <td>{c.employees}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row">
        <button
          className="secondary"
          onClick={() =>
            setPage((p) => Math.max(1, p - 1))
          }
        >
          Prev
        </button>
        <span className="small">
          Page {page} / {pages}
        </span>
        <button
          className="secondary"
          onClick={() =>
            setPage((p) => Math.min(pages, p + 1))
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
