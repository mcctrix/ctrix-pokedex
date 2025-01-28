// Nature definitions with their stat modifiers
export const NATURES = {
  Hardy: { increase: null, decrease: null },
  Lonely: { increase: "attack", decrease: "defense" },
  Brave: { increase: "attack", decrease: "speed" },
  Adamant: { increase: "attack", decrease: "special-attack" },
  Naughty: { increase: "attack", decrease: "special-defense" },
  Bold: { increase: "defense", decrease: "attack" },
  Docile: { increase: null, decrease: null },
  Relaxed: { increase: "defense", decrease: "speed" },
  Impish: { increase: "defense", decrease: "special-attack" },
  Lax: { increase: "defense", decrease: "special-defense" },
  Timid: { increase: "speed", decrease: "attack" },
  Hasty: { increase: "speed", decrease: "defense" },
  Serious: { increase: null, decrease: null },
  Jolly: { increase: "speed", decrease: "special-attack" },
  Naive: { increase: "speed", decrease: "special-defense" },
  Modest: { increase: "special-attack", decrease: "attack" },
  Mild: { increase: "special-attack", decrease: "defense" },
  Quiet: { increase: "special-attack", decrease: "speed" },
  Bashful: { increase: null, decrease: null },
  Rash: { increase: "special-attack", decrease: "special-defense" },
  Calm: { increase: "special-defense", decrease: "attack" },
  Gentle: { increase: "special-defense", decrease: "defense" },
  Sassy: { increase: "special-defense", decrease: "speed" },
  Careful: { increase: "special-defense", decrease: "special-attack" },
  Quirky: { increase: null, decrease: null },
} as const

export type NatureType = keyof typeof NATURES

// Get nature multiplier for a specific stat
export function getNatureMultiplier(nature: NatureType, statName: string): number {
  const natureEffect = NATURES[nature]
  if (natureEffect.increase === statName) return 1.1
  if (natureEffect.decrease === statName) return 0.9
  return 1
}

// Format nature display text
export function formatNatureText(nature: NatureType): string {
  const effect = NATURES[nature]
  if (!effect.increase || !effect.decrease) return nature
  return `${nature} (+${formatStatName(effect.increase)}, -${formatStatName(effect.decrease)})`
}

// Format stat name for display
export function formatStatName(stat: string): string {
  switch (stat) {
    case "attack":
      return "Atk"
    case "defense":
      return "Def"
    case "special-attack":
      return "SpA"
    case "special-defense":
      return "SpD"
    case "speed":
      return "Spe"
    default:
      return stat
  }
}

