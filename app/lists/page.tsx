'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import companies from '@/data/companies.json';
import { readLocal, writeLocal } from '@/lib/storage';
import { toast } from '@/lib/toast';

export default function ListsPage() {
  const [lists, setLists] = useState<Record<string, string[]>>({});
  const [name, setName] = useState('');

  useEffect(() => setLists(readLocal('lists', {})), []);

  const createList = () => {
    if (!name.trim()) return;
    const next = { ...lists, [name.trim()]: lists[name.trim()] || [] };
    setLists(next);
    writeLocal('lists', next);
    setName('');
    toast('List created');
  };

  const removeCompany = (listName: string, id: string) => {
    const next = { ...lists, [listName]: lists[listName].filter((item) => item !== id) };
    setLists(next);
    writeLocal('lists', next);
    toast('Company removed from list');
  };

  const exportList = (listName: string, format: 'json' | 'csv') => {
    const ids = lists[listName] || [];
    const rows = companies.filter((c) => ids.includes(c.id));
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const payload = format === 'json'
      ? JSON.stringify(rows, null, 2)
      : ['id,name,sector,stage,location,website', ...rows.map((r) => [r.id, r.name, r.sector, r.stage, r.location, r.website].map(escapeCsv).join(','))].join('\n');
    const blob = new Blob([payload], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listName}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${listName} exported as ${format.toUpperCase()}`);
  };

  const names = useMemo(() => Object.keys(lists), [lists]);

  return (
    <div className="grid gap-lg">
      <h1 className="page-title">Lists</h1>
      <div className="panel row">
        <input className="input" placeholder="New list name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={createList}>Create</button>
      </div>
      {!names.length && <div className="panel empty-state">📁 No lists yet. Create one to start tracking targets.</div>}
      {names.map((listName) => (
        <div className="panel" key={listName}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{listName}</h3>
            <div className="row">
              <button className="secondary" onClick={() => exportList(listName, 'csv')}>Export CSV</button>
              <button className="secondary" onClick={() => exportList(listName, 'json')}>Export JSON</button>
            </div>
          </div>
          <ul>
            {(lists[listName] || []).map((id) => {
              const company = companies.find((c) => c.id === id);
              if (!company) return null;
              return (
                <li key={id} className="row" style={{ justifyContent: 'space-between' }}>
                  <Link href={`/companies/${id}`} style={{ color: '#a7bdff' }}>{company.name}</Link>
                  <button className="secondary" onClick={() => removeCompany(listName, id)}>Remove</button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
