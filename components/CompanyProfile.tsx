'use client';

import { useEffect, useState } from 'react';
import { Company, EnrichmentResult } from '@/lib/types';
import { readLocal, writeLocal } from '@/lib/storage';
import { toast } from '@/lib/toast';

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
    toast('Notes saved');
  };

  const saveToList = () => {
    const lists = readLocal<Record<string, string[]>>('lists', {});
    lists[listName] = Array.from(new Set([...(lists[listName] || []), company.id]));
    writeLocal('lists', lists);
    toast(`Saved to ${listName}`);
  };

  const enrich = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          website: company.website,
          name: company.name
        })
      });

      if (!response.ok) throw new Error('Unable to enrich');

      const result: EnrichmentResult = await response.json();
      setData(result);

      const cache = readLocal<Record<string, EnrichmentResult>>('enrichment-cache', {});
      cache[company.id] = result;
      writeLocal('enrichment-cache', cache);

      toast('Enrichment complete');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const stageClass =
    company.stage.toLowerCase().includes('seed')
      ? 'stage-badge seed'
      : company.stage.toLowerCase().includes('series a') ||
        company.stage.toLowerCase().includes('series b')
      ? 'stage-badge growth'
      : 'stage-badge late';

  return (
    <div className="grid gap-lg">
      <div className="company-header panel">
        <div>
          <h1 className="page-title">{company.name}</h1>
          <p className="small">
            {company.sector} · {company.location}
          </p>
        </div>
        <div className="row">
          <span className={stageClass}>{company.stage}</span>
          <span className="small">{company.employees} employees</span>
          <a
            className="badge"
            href={company.website}
            target="_blank"
            rel="noreferrer noopener"
          >
            Website
          </a>
        </div>
      </div>

      <div className="panel grid two">
        <div>
          <h2 className="section-title">Overview</h2>
          <p>{company.description}</p>

          <h2 className="section-title">Signals timeline</h2>
          <ul>
            {company.signals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="section-title">Notes & Lists</h2>

          <div className="row" style={{ marginBottom: 10 }}>
            <input
              className="input"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <button onClick={saveToList}>Save to List</button>
          </div>

          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Investment notes"
          />

          <div style={{ marginTop: 8 }}>
            <button className="secondary" onClick={saveNotes}>
              Save Notes
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Live Enrichment</h3>
          <button onClick={enrich} disabled={loading}>
            {loading ? 'Enriching...' : 'Enrich'}
          </button>
        </div>

        {error && <p style={{ color: '#f87171' }}>{error}</p>}

        {data && (
          <div className="grid" style={{ gap: 8 }}>
            <p>
              <strong>Summary:</strong> {data.summary}
            </p>

            <div>
              <strong>What they do:</strong>
              <ul>
                {data.whatTheyDo.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Keywords:</strong>
              {data.keywords.map((k) => (
                <span className="badge" key={k}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
