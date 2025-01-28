import { Suspense } from "react"
import DamageCalcContent from "@/components/DamageCalcContent"

export default function DamageCalcPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Damage Calculator</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DamageCalcContent />
      </Suspense>
    </div>
  )
}

