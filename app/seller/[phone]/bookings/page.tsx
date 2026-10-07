import { SellerBookingsClient } from "@/components/SellerBookingsClient";

type Props = { params: Promise<{ phone: string }> };

export default async function SellerBookingsPage({ params }: Props) {
  const { phone } = await params;
  return <SellerBookingsClient phone={decodeURIComponent(phone)} />;
}
