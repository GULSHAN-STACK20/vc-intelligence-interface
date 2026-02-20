import companies from '@/data/companies.json';
import { EnrichmentResult } from '@/lib/types';

const pickKeywords = (text: string) => {
  const stop = new Set(['the', 'and', 'for', 'with', 'that', 'from', 'this', 'your', 'into', 'their', 'are', 'was', 'have']);
  const tokens = text.toLowerCase().match(/[a-z]{4,}/g) || [];
  const freq = new Map<string, number>();
  for (const token of tokens) {
    if (stop.has(token)) continue;
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word]) => word);
};

const summarize = (text: string) => {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => s.length > 50);
  return sentences.slice(0, 2).join(' ').slice(0, 320) || 'Public website content was fetched successfully.';
};

const bullets = (text: string) => {
  const lines = text.split(/\n|\./).map((l) => l.trim()).filter((l) => l.length > 40);
  return lines.slice(0, 6);
};

export async function POST(request: Request) {
  try {
    const { companyId } = await request.json();
    // Security note: the client only sends companyId. We look up the canonical
    // website server-side so callers cannot tamper with arbitrary target URLs.
    const company = companies.find((c) => c.id === companyId);
    if (!company) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const base = company.website.replace(/\/$/, '');
    const { companyId, website, name } = await request.json();
    const company = companies.find((c) => c.id === companyId);
    if (!website || !name || !company) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const base = website.replace(/\/$/, '');
    const targets = [base, `${base}/about`, `${base}/blog`, `${base}/careers`];

    const responses = await Promise.all(targets.map(async (url) => {
      try {
        const readerUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
        const res = await fetch(readerUrl, { headers: { Accept: 'text/plain' }, cache: 'no-store' });
        if (!res.ok) return { url, text: '' };
        const text = (await res.text()).slice(0, 16000);
        return { url, text };
      } catch {
        return { url, text: '' };
      }
    }));

    const merged = responses.map((r) => r.text).join('\n');
    const timestamp = new Date().toISOString();

    const derivedSignals: string[] = [];
    if (responses.find((r) => r.url.endsWith('/careers') && r.text.length > 200)) derivedSignals.push('Careers page detected (hiring signal)');
    if (/blog|news|announcement/i.test(merged)) derivedSignals.push('Recent publishing activity inferred');
    if (/github|api|developer|documentation/i.test(merged)) derivedSignals.push('Developer-facing footprint detected');
    if (/enterprise|security|compliance|SOC 2/i.test(merged)) derivedSignals.push('Enterprise readiness language present');

    const result: EnrichmentResult = {
      summary: summarize(merged),
      whatTheyDo: bullets(merged).slice(0, 6),
      keywords: pickKeywords(merged).slice(0, 10),
      derivedSignals: derivedSignals.slice(0, 4),
      sources: responses.filter((r) => r.text).map((r) => ({ url: r.url, timestamp }))
    };

    return Response.json(result);
  } catch {
    return Response.json({ error: 'Enrichment failed' }, { status: 500 });
  }
}
