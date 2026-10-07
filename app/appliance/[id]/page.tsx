import { ApplianceDetailClient } from "@/components/ApplianceDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function AppliancePage({ params }: Props) {
  const { id } = await params;
  return <ApplianceDetailClient id={id} />;
}
