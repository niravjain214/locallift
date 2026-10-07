import { Suspense } from "react";
import { BrowseClient } from "@/components/BrowseClient";

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowseClient />
    </Suspense>
  );
}
