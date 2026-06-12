import { Suspense } from "react";
import { IaTools } from "./ia-tools";

export default function IaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        IA Americana
      </h1>
      <Suspense fallback={null}>
        <IaTools />
      </Suspense>
    </div>
  );
}
