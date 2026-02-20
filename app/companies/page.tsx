import companies from '@/data/companies.json';
import { CompaniesTable } from '@/components/CompaniesTable';

export default function CompaniesPage({ searchParams }: { searchParams: { q?: string; sector?: string } }) {
  return (
    <div className="grid gap-lg">
      <h1 className="page-title">Company Discovery</h1>
      <p className="small">Discover → profile → enrich → save to list.</p>
      <CompaniesTable
        companies={companies}
        initialQuery={searchParams.q ?? ''}
        initialSector={searchParams.sector ?? 'all'}
      />
    </div>
  );
}
