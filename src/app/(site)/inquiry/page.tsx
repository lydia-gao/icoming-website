import { Suspense } from "react";
import { InquiryView } from "@/views/InquiryView";

export default function Page() {
  return (
    <Suspense>
      <InquiryView locale="en" />
    </Suspense>
  );
}
