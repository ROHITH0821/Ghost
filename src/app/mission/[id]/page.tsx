import { MissionPageClient } from "@/components/mission/MissionPageClient";

interface MissionPageProps {
  params: Promise<{ id: string }>;
}

export default async function MissionPage({ params }: MissionPageProps) {
  const { id } = await params;
  return <MissionPageClient missionId={id} />;
}
