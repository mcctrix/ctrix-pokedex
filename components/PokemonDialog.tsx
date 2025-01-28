"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import PokemonCard from "@/components/PokemonCard"
import { getPokemonDetails } from "@/lib/pokemon"

export function PokemonDialog({ pokemon, onClose }) {
  const [pokemonDetails, setPokemonDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (pokemon) {
      const fetchPokemonDetails = async () => {
        try {
          const details = await getPokemonDetails(pokemon.name)
          setPokemonDetails(details)
          setError(null)
        } catch (err) {
          console.error("Error fetching Pokemon details:", err)
          setError("Failed to load Pokemon details. Please try again.")
        }
      }
      fetchPokemonDetails()
    }
  }, [pokemon])

  return (
    <Dialog open={!!pokemon} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : pokemonDetails ? (
          <PokemonCard pokemon={pokemonDetails} />
        ) : (
          <div>Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

