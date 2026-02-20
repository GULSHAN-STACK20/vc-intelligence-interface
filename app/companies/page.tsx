import companies from '@/data/companies.json';
import { CompaniesTable } from '@/components/CompaniesTable';

export default function CompaniesPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="grid" style={{ gap: 14 }}>
      <h1 style={{ margin: 0 }}>Company Discovery</h1>
      <p className="small">Discover → profile → enrich → save to list.</p>
      <CompaniesTable companies={companies} initialQuery={searchParams.q ?? ''} />
    </div>
  );
}
