export type Company = {
  id: string;
  name: string;
  website: string;
  sector: string;
  stage: string;
  location: string;
  employees: number;
  description: string;
  signals: string[];
};

export type EnrichmentResult = {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  derivedSignals: string[];
  sources: Array<{ url: string; timestamp: string }>;
};
