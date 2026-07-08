import { ResultsPageClient } from "@/components/results/ResultsPageClient";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  return <ResultsPageClient missionId={id} />;
}
