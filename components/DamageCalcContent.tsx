"use client"

import { useState, useEffect } from "react"
import { getPokemonList, getPokemonDetails } from "@/lib/pokemon"
import DamageCalculator from "@/components/DamageCalculator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function DamageCalcContent() {
  const [pokemonList, setPokemonList] = useState([])
  const [attacker, setAttacker] = useState(null)
  const [defender, setDefender] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPokemonList = async () => {
      const { results } = await getPokemonList(1, 1000)
      setPokemonList(results.map((pokemon) => pokemon.name))
      setLoading(false)
    }
    fetchPokemonList()
  }, [])

  const handlePokemonSelect = async (pokemonName, isAttacker) => {
    const pokemon = await getPokemonDetails(pokemonName)
    if (isAttacker) {
      setAttacker(pokemon)
    } else {
      setDefender(pokemon)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="bg-secondary/10">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Pokémon 1</h2>
            <Select onValueChange={(value) => handlePokemonSelect(value, true)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Pokémon" />
              </SelectTrigger>
              <SelectContent>
                {pokemonList.map((name) => (
                  <SelectItem key={`attacker-${name}`} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Pokémon 2</h2>
            <Select onValueChange={(value) => handlePokemonSelect(value, false)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Pokémon" />
              </SelectTrigger>
              <SelectContent>
                {pokemonList.map((name) => (
                  <SelectItem key={`defender-${name}`} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {attacker && defender && <DamageCalculator attacker={attacker} defender={defender} />}
      </CardContent>
    </Card>
  )
}

