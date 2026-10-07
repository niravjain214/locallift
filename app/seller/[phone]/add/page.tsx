import { AddApplianceClient } from "@/components/AddApplianceClient";

type Props = { params: Promise<{ phone: string }> };

export default async function AddAppliancePage({ params }: Props) {
  const { phone } = await params;
  return <AddApplianceClient phone={decodeURIComponent(phone)} />;
}
