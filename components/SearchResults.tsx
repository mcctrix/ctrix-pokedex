"use client"

import { useState, useEffect } from "react"
import { getPokemonList } from "@/lib/pokemon"
import Link from "next/link"
import Image from "next/image"

export default function SearchResults({ searchParams }: { searchParams: { name: string } }) {
  const [filteredPokemon, setFilteredPokemon] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAndFilterPokemon = async () => {
      setLoading(true)
      const { results } = await getPokemonList(1, 1000)
      const filtered = results.filter((pokemon: { name: string }) =>
        pokemon.name.toLowerCase().includes(searchParams.name.toLowerCase()),
      )
      setFilteredPokemon(filtered)
      setLoading(false)
    }
    fetchAndFilterPokemon()
  }, [searchParams.name])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPokemon.map((pokemon: { name: string; url: string }) => (
        <Link href={`/pokemon/${pokemon.name}`} key={pokemon.name} className="block">
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <Image
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split("/")[6]}.png`}
              alt={pokemon.name}
              width={96}
              height={96}
              className="mx-auto"
            />
            <h2 className="text-center mt-2 capitalize">{pokemon.name}</h2>
          </div>
        </Link>
      ))}
      {filteredPokemon.length === 0 && (
        <p className="text-center text-gray-500 col-span-full">No Pokemon found matching "{searchParams.name}"</p>
      )}
    </div>
  )
}

