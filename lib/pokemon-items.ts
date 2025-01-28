export interface Item {
  name: string
  description: string
  category: "held" | "battle" | "berry"
  effect?: string
}

export const HELD_ITEMS: Item[] = [
  // Stat-boosting items
  { name: "Choice Band", description: "Boosts Attack by 50%, but locks into one move", category: "held" },
  { name: "Choice Specs", description: "Boosts Special Attack by 50%, but locks into one move", category: "held" },
  { name: "Choice Scarf", description: "Boosts Speed by 50%, but locks into one move", category: "held" },
  { name: "Life Orb", description: "Boosts moves' power by 30%, but costs 10% HP", category: "held" },
  { name: "Expert Belt", description: "Powers up super-effective moves by 20%", category: "held" },
  { name: "Muscle Band", description: "Powers up physical moves by 10%", category: "held" },
  { name: "Wise Glasses", description: "Powers up special moves by 10%", category: "held" },

  // Type-enhancing items
  { name: "Charcoal", description: "Powers up Fire-type moves", category: "held" },
  { name: "Mystic Water", description: "Powers up Water-type moves", category: "held" },
  { name: "Magnet", description: "Powers up Electric-type moves", category: "held" },
  { name: "Miracle Seed", description: "Powers up Grass-type moves", category: "held" },
  { name: "Never-Melt Ice", description: "Powers up Ice-type moves", category: "held" },
  { name: "Black Belt", description: "Powers up Fighting-type moves", category: "held" },
  { name: "Poison Barb", description: "Powers up Poison-type moves", category: "held" },
  { name: "Soft Sand", description: "Powers up Ground-type moves", category: "held" },
  { name: "Sharp Beak", description: "Powers up Flying-type moves", category: "held" },
  { name: "Twisted Spoon", description: "Powers up Psychic-type moves", category: "held" },
  { name: "Silver Powder", description: "Powers up Bug-type moves", category: "held" },
  { name: "Hard Stone", description: "Powers up Rock-type moves", category: "held" },
  { name: "Spell Tag", description: "Powers up Ghost-type moves", category: "held" },
  { name: "Dragon Fang", description: "Powers up Dragon-type moves", category: "held" },
  { name: "Black Glasses", description: "Powers up Dark-type moves", category: "held" },
  { name: "Metal Coat", description: "Powers up Steel-type moves", category: "held" },
  { name: "Silk Scarf", description: "Powers up Normal-type moves", category: "held" },

  // Berries
  { name: "Oran Berry", description: "Restores 10 HP when HP falls below 50%", category: "berry" },
  { name: "Sitrus Berry", description: "Restores 25% of max HP when HP falls below 50%", category: "berry" },
  { name: "Lum Berry", description: "Cures any status condition", category: "berry" },
  { name: "Chesto Berry", description: "Wakes up from sleep", category: "berry" },
  { name: "Pecha Berry", description: "Cures poison", category: "berry" },
  { name: "Rawst Berry", description: "Heals burn", category: "berry" },
  { name: "Cheri Berry", description: "Cures paralysis", category: "berry" },
  { name: "Aspear Berry", description: "Thaws out frozen Pokémon", category: "berry" },

  // Other competitive items
  { name: "Leftovers", description: "Restores HP by 1/16th max HP each turn", category: "held" },
  { name: "Rocky Helmet", description: "Damages attackers on contact", category: "held" },
  { name: "Air Balloon", description: "Makes the holder immune to Ground-type moves until hit", category: "held" },
  { name: "Eviolite", description: "Increases Defense and Sp. Defense of not fully evolved Pokémon", category: "held" },
  { name: "Assault Vest", description: "Raises Sp. Defense but prevents status moves", category: "held" },
  {
    name: "Focus Sash",
    description: "Holder survives any single attack that would cause fainting if at full HP",
    category: "held",
  },
  { name: "Focus Band", description: "Holder may survive an attack that would cause fainting", category: "held" },
  { name: "Quick Claw", description: "Holder may move first", category: "held" },
  { name: "King's Rock", description: "Moves may cause flinching", category: "held" },
  { name: "Bright Powder", description: "Lowers accuracy of attacks against the holder", category: "held" },
  { name: "Light Clay", description: "Extends duration of Light Screen and Reflect", category: "held" },
  { name: "Mental Herb", description: "Removes effects of infatuation and Taunt", category: "held" },
  { name: "Power Herb", description: "Allows immediate use of moves that charge first", category: "held" },
  { name: "White Herb", description: "Restores lowered stats", category: "held" },
  { name: "Safety Goggles", description: "Protects from powder moves and weather damage", category: "held" },
  { name: "Heavy-Duty Boots", description: "Prevents entry hazard damage", category: "held" },
]

