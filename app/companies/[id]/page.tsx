import { notFound } from 'next/navigation';
import companies from '@/data/companies.json';
import { CompanyProfile } from '@/components/CompanyProfile';

export default function CompanyPage({ params }: { params: { id: string } }) {
  const company = companies.find((c) => c.id === params.id);
  if (!company) return notFound();
  return <CompanyProfile company={company} />;
}
