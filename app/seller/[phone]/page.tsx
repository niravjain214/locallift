import { SellerDashboardClient } from "@/components/SellerDashboardClient";

type Props = { params: Promise<{ phone: string }> };

export default async function SellerPage({ params }: Props) {
  const { phone } = await params;
  return <SellerDashboardClient phone={decodeURIComponent(phone)} />;
}
