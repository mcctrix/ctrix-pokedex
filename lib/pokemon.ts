import { Pokemon, PokemonSpecies, Type } from "@/types"
import { cache } from "react"

const API_BASE = "https://pokeapi.co/api/v2"

// 
// Fetch Pokemon list with optional limit
export interface PokemonListResponse {
  count: number,
  next: string,
  previous: string,
  results: {name: string, url: string,types: string[]}[]
}
export const getPokemonList = cache(async (page = 1, limit = 20): Promise<PokemonListResponse> => {

  const response = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${(page - 1) * limit}`, {
    next: { revalidate: 604800 }, // Cache for 7 days
  })
  return response.json()
})
//

export const getPokemonTypes = cache(async (name: string) => {
  let data: Pokemon
  try {

    const response = await fetch(`${API_BASE}/pokemon/${name}`, {
      next: { revalidate: 604800 }, // Cache for 7 days
    })
    const data: Pokemon = await response.json()
    return data.types.map((type: { type: { name: string } }) => type.type.name)
  } catch (error) {
    console.error(name,error)
  }
  return []
})

export const getPokemonDetails = cache(async (name: string) => {
  const [pokemonResponse, speciesResponse] = await Promise.all([
    fetch(`${API_BASE}/pokemon/${name}`, { next: { revalidate: 604800 } }),
    fetch(`${API_BASE}/pokemon-species/${name}`, { next: { revalidate: 604800 } }),
  ])

  const data = await Promise.all([pokemonResponse.json(), speciesResponse.json()])
  const pokemon: Pokemon = data[0]
  const species: PokemonSpecies = data[1]

  // Get type effectiveness
  const typePromises: Promise<Type>[] = pokemon.types.map((type) =>
    fetch(type.type.url, { next: { revalidate: 604800 } }).then((res) => res.json()),
  )
  const typeDetails = await Promise.all(typePromises)

  // Calculate resistances and weaknesses
  const effectiveness = new Map<string,number>()
  typeDetails.forEach((type) => {
    type.damage_relations.double_damage_from.forEach((t) =>
      effectiveness.set(t.name, (effectiveness.get(t.name) || 1) * 2),
    )
    type.damage_relations.half_damage_from.forEach((t) =>
      effectiveness.set(t.name, (effectiveness.get(t.name) || 1) * 0.5),
    )
    type.damage_relations.no_damage_from.forEach((t) => effectiveness.set(t.name, 0))
  })
  console.log("Effectivenes: ",effectiveness)

  const resistances: { type: string; multiplier: string }[]  = []
  const weaknesses: { type: string; multiplier: string }[] = []
  effectiveness.forEach((multiplier, type) => {
    if (multiplier < 1) {
      resistances.push({ type, multiplier: multiplier === 0 ? "0" : "½×" })
    } else if (multiplier > 1) {
      weaknesses.push({ type, multiplier: `${multiplier}×` })
    }
  })

  // Process moves
  const movePromises = pokemon.moves.map((move) =>
    fetch(move.move.url, { next: { revalidate: 604800 } }).then((res) => res.json()),
  )
  const moveDetails = await Promise.all(movePromises)

  const moves = moveDetails.map((moveDetail, index) => {
    const move = pokemon.moves[index]
    const levelUpDetails = move.version_group_details.find((detail) => detail.move_learn_method.name === "level-up")
    const tmDetails = move.version_group_details.find((detail) => detail.move_learn_method.name === "machine")
    const eggDetails = move.version_group_details.find((detail) => detail.move_learn_method.name === "egg")
    const tutorDetails = move.version_group_details.find((detail) => detail.move_learn_method.name === "tutor")

    let moveType = "level-up"
    const level = levelUpDetails?.level_learned_at

    if (!levelUpDetails && tmDetails) {
      moveType = "tm"
    } else if (!levelUpDetails && eggDetails) {
      moveType = "egg"
    } else if (!levelUpDetails && tutorDetails) {
      moveType = "tutor"
    }

    return {
      name: moveDetail.name,
      type: moveDetail.type.name,
      category: moveDetail.damage_class.name.toUpperCase(),
      power: moveDetail.power,
      accuracy: moveDetail.accuracy,
      pp: moveDetail.pp,
      moveType,
      level,
    }
  })

  return {
    ...pokemon,
    moves,
    resistances,
    weaknesses,
    description: species.flavor_text_entries.find((entry) => entry.language.name === "en")?.flavor_text || "",
    egg_groups: species.egg_groups.map((group) => group.name),
    capture_rate: species.capture_rate,
    gender_rate: species.gender_rate,
    growth_rate: species.growth_rate.name,
    generation: species.generation.name,
  }
})

