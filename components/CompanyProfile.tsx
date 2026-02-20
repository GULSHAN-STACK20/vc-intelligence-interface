'use client';

import { useEffect, useState } from 'react';
import { Company, EnrichmentResult } from '@/lib/types';
import { readLocal, writeLocal } from '@/lib/storage';

export function CompanyProfile({ company }: { company: Company }) {
  const [notes, setNotes] = useState('');
  const [listName, setListName] = useState('Pipeline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<EnrichmentResult | null>(null);

  useEffect(() => {
    const allNotes = readLocal<Record<string, string>>('company-notes', {});
    setNotes(allNotes[company.id] ?? '');
    const cache = readLocal<Record<string, EnrichmentResult>>('enrichment-cache', {});
    if (cache[company.id]) setData(cache[company.id]);
  }, [company.id]);

  const saveNotes = () => {
    const allNotes = readLocal<Record<string, string>>('company-notes', {});
    allNotes[company.id] = notes;
    writeLocal('company-notes', allNotes);
  };

  const saveToList = () => {
    const lists = readLocal<Record<string, string[]>>('lists', {});
    lists[listName] = Array.from(new Set([...(lists[listName] || []), company.id]));
    writeLocal('lists', lists);
    alert(`Saved to ${listName}`);
  };

  const enrich = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, website: company.website, name: company.name })
      });
      if (!response.ok) throw new Error('Unable to enrich');
      const result: EnrichmentResult = await response.json();
      setData(result);
      const cache = readLocal<Record<string, EnrichmentResult>>('enrichment-cache', {});
      cache[company.id] = result;
      writeLocal('enrichment-cache', cache);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <h1 style={{ margin: 0 }}>{company.name}</h1>
      <div className="panel grid two">
        <div>
          <p>{company.description}</p>
          <p className="small">{company.sector} · {company.stage} · {company.location}</p>
          <a className="badge" href={company.website} target="_blank">Website</a>
        </div>
        <div>
          <div className="row" style={{ marginBottom: 10 }}>
            <input className="input" value={listName} onChange={(e) => setListName(e.target.value)} />
            <button onClick={saveToList}>Save to List</button>
          </div>
          <textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Investment notes" />
          <div style={{ marginTop: 8 }}><button className="secondary" onClick={saveNotes}>Save Notes</button></div>
        </div>
      </div>

      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Signals timeline</h3>
          <button onClick={enrich} disabled={loading}>{loading ? 'Enriching...' : 'Enrich'}</button>
        </div>
        <ul>{company.signals.map((s) => <li key={s}>{s}</li>)}</ul>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        {data && (
          <div className="grid" style={{ gap: 8 }}>
            <p><strong>Summary:</strong> {data.summary}</p>
            <div><strong>What they do:</strong><ul>{data.whatTheyDo.map((b) => <li key={b}>{b}</li>)}</ul></div>
            <div className="row"><strong>Keywords:</strong>{data.keywords.map((k) => <span className="badge" key={k}>{k}</span>)}</div>
            <div><strong>Derived signals:</strong><ul>{data.derivedSignals.map((s) => <li key={s}>{s}</li>)}</ul></div>
            <div>
              <strong>Sources:</strong>
              <ul>{data.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" style={{ color: '#a7bdff' }}>{s.url}</a> <span className="small">({new Date(s.timestamp).toLocaleString()})</span></li>)}</ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
