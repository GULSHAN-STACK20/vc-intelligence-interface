'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readLocal, writeLocal } from '@/lib/storage';

type SavedSearch = { id: string; query: string; sector: string; createdAt: string };

export default function SavedPage() {
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  useEffect(() => setSaved(readLocal('saved-searches', [])), []);

  const remove = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    setSaved(next);
    writeLocal('saved-searches', next);
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <h1 style={{ margin: 0 }}>Saved Searches</h1>
      <div className="panel">
        <ul>
          {saved.map((item) => (
            <li key={item.id} className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <Link href={`/companies?q=${encodeURIComponent(item.query)}`} style={{ color: '#a7bdff' }}>
                  {item.query || '(blank query)'} · {item.sector}
                </Link>
                <div className="small">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <button className="secondary" onClick={() => remove(item.id)}>Delete</button>
            </li>
          ))}
          {!saved.length && <li className="small">No saved searches yet.</li>}
        </ul>
      </div>
    </div>
  );
}
