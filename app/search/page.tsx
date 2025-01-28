import { Suspense } from "react"
import SearchResults from "@/components/SearchResults"

export default function SearchPage({ searchParams }: { searchParams: { name: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{searchParams.name}"</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

