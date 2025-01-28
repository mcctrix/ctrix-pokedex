import { getPokemonDetails } from "@/lib/pokemon"
import PokemonCard from "@/components/PokemonCard"

export default async function PokemonPage({ params }: { params: { name: string } }) {
  const pokemon = await getPokemonDetails(params.name)

  return (
    <div className="container mx-auto p-4">
      <PokemonCard pokemon={pokemon} />
    </div>
  )
}

