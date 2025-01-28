"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { getPokemonList, getPokemonDetails } from "@/lib/pokemon"
import { NATURES, type NatureType, getNatureMultiplier, formatNatureText } from "@/lib/pokemon-utils"
import { HELD_ITEMS } from "@/lib/pokemon-items"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Pokemon {
  name: string
  types: { type: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
  moves: any[]
  abilities: any[]
}

interface PokemonWithStats extends Pokemon {
  level: number
  nature: NatureType
  ability: string
  item: string
  status: string
  currentHP: number
  maxHP: number
  stats: {
    base_stat: number
    stat: { name: string }
    iv: number
    ev: number
    total: number
  }[]
}

interface MoveResult {
  name: string
  damageRange: [number, number] // min-max damage percentage
  recovery?: [number, number] // min-max recovery percentage
  selected?: boolean
}

interface PokemonMoveResults {
  pokemon: string
  moves: MoveResult[]
}

const DamageCalculator = ({ attacker, defender }: { attacker: Pokemon; defender: Pokemon }) => {
  const [pokemon1, setPokemon1] = useState<PokemonWithStats>(initializePokemon(attacker))
  const [pokemon2, setPokemon2] = useState<PokemonWithStats>(initializePokemon(defender))
  const [fieldConditions, setFieldConditions] = useState({
    weather: "none",
    terrain: "none",
    spikes: 0,
    stealthRock: false,
    lightScreen: false,
    reflect: false,
    auroraVeil: false,
    helpingHand: false,
    friendGuard: false,
  })
  const [selectedMoves, setSelectedMoves] = useState<string[]>([])
  const [damageResults, setDamageResults] = useState<{ move: string; damage: number[] }[]>([])
  const [pokemon1Moves, setPokemon1Moves] = useState<MoveResult[]>([])
  const [pokemon2Moves, setPokemon2Moves] = useState<MoveResult[]>([])
  const [selectedMove1, setSelectedMove1] = useState<string | null>(null)
  const [selectedMove2, setSelectedMove2] = useState<string | null>(null)

  function initializePokemon(pokemon: Pokemon): PokemonWithStats {
    const stats = pokemon.stats.map((stat) => ({
      ...stat,
      iv: 31,
      ev: 0,
      total: calculateStat(
        stat.base_stat,
        31,
        0,
        100,
        getNatureMultiplier("Hardy", stat.stat.name),
        stat.stat.name === "hp",
      ),
    }))

    return {
      ...pokemon,
      level: 100,
      nature: "Hardy",
      ability: pokemon.abilities?.[0]?.ability?.name || "",
      item: "",
      status: "Healthy",
      currentHP: calculateHP(pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 0, 31, 0, 100),
      maxHP: calculateHP(pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat || 0, 31, 0, 100),
      stats,
    }
  }

  function calculateHP(base: number, iv: number, ev: number, level: number): number {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
  }

  function calculateStat(base: number, iv: number, ev: number, level: number, nature: number, isHP = false): number {
    if (isHP) {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
    }
    return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature)
  }

  function updatePokemonStats(
    pokemon: PokemonWithStats,
    setPokemon: (pokemon: PokemonWithStats) => void,
    statName?: string,
  ) {
    setPokemon((prev) => ({
      ...prev,
      stats: prev.stats.map((stat) => ({
        ...stat,
        total: calculateStat(
          stat.base_stat,
          stat.iv,
          stat.ev,
          prev.level,
          getNatureMultiplier(prev.nature, stat.stat.name),
          stat.stat.name === "hp",
        ),
      })),
    }))
  }

  function calculateDamageRange(move: any, attacker: PokemonWithStats, defender: PokemonWithStats): number[] {
    const damages: number[] = []
    for (let i = 85; i <= 100; i++) {
      const damage = calculateDamage(move, attacker, defender, i / 100)
      damages.push(damage)
    }
    return damages
  }

  function calculateDamage(move: any, attacker: PokemonWithStats, defender: PokemonWithStats, random: number): number {
    // Base damage formula
    const attack =
      attacker.stats.find((s) => s.stat.name === (move.category === "PHYSICAL" ? "attack" : "special-attack"))?.total ||
      0
    const defense =
      defender.stats.find((s) => s.stat.name === (move.category === "PHYSICAL" ? "defense" : "special-defense"))
        ?.total || 0

    let damage = Math.floor((((2 * attacker.level) / 5 + 2) * move.power * attack) / defense / 50 + 2)

    // STAB
    if (attacker.types.some((t) => t.type.name === move.type)) {
      damage = Math.floor(damage * 1.5)
    }

    // Type effectiveness
    const effectiveness = calculateTypeEffectiveness(
      move.type,
      defender.types.map((t) => t.type.name),
    )
    damage = Math.floor(damage * effectiveness)

    // Random factor
    damage = Math.floor(damage * random)

    // Weather
    if (fieldConditions.weather === "sun" && move.type === "fire") damage = Math.floor(damage * 1.5)
    if (fieldConditions.weather === "rain" && move.type === "water") damage = Math.floor(damage * 1.5)

    // Terrain
    if (fieldConditions.terrain === "electric" && move.type === "electric") damage = Math.floor(damage * 1.3)
    if (fieldConditions.terrain === "psychic" && move.type === "psychic") damage = Math.floor(damage * 1.3)
    if (fieldConditions.terrain === "grassy" && move.type === "grass") damage = Math.floor(damage * 1.3)

    return damage
  }

  function calculateTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
    // Simplified type chart - expand this with full type effectiveness data
    const typeChart: { [key: string]: { [key: string]: number } } = {
      normal: { rock: 0.5, ghost: 0, steel: 0.5 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      // Add more types...
    }

    let effectiveness = 1
    defenderTypes.forEach((type) => {
      if (typeChart[moveType]?.[type]) {
        effectiveness *= typeChart[moveType][type]
      }
    })
    return effectiveness
  }

  function handleNatureChange(value: NatureType, setPokemon: (pokemon: PokemonWithStats) => void) {
    setPokemon((prev) => {
      const newPokemon = {
        ...prev,
        nature: value,
        stats: prev.stats.map((stat) => ({
          ...stat,
          total: calculateStat(
            stat.base_stat,
            stat.iv,
            stat.ev,
            prev.level,
            getNatureMultiplier(value, stat.stat.name),
            stat.stat.name === "hp",
          ),
        })),
      }
      return newPokemon
    })
  }

  function calculateRecovery(move: any, damage: number, maxHP: number): [number, number] | undefined {
    if (!move.recovery_percent) return undefined
    const minRecovery = damage * (move.recovery_percent / 100)
    const maxRecovery = damage * (move.recovery_percent / 100)
    return [Number(((minRecovery / maxHP) * 100).toFixed(1)), Number(((maxRecovery / maxHP) * 100).toFixed(1))]
  }

  function calculateMoveResults(move: any, attacker: PokemonWithStats, defender: PokemonWithStats): MoveResult {
    const damageRange = calculateDamageRange(move, attacker, defender)
    const minDamage = Math.min(...damageRange)
    const maxDamage = Math.max(...damageRange)
    const minPercent = Number(((minDamage / defender.maxHP) * 100).toFixed(1))
    const maxPercent = Number(((maxDamage / defender.maxHP) * 100).toFixed(1))

    const recovery = calculateRecovery(move, maxDamage, attacker.maxHP)

    return {
      name: move.name,
      damageRange: [minPercent, maxPercent],
      recovery: recovery,
      selected: false,
    }
  }

  const MovesList = ({
    moves,
    onMoveSelect,
    selectedMove,
  }: {
    moves: MoveResult[]
    onMoveSelect: (move: string) => void
    selectedMove: string | null
  }) => {
    return (
      <div className="space-y-2">
        {moves.map((move) => (
          <button
            key={move.name}
            onClick={() => onMoveSelect(move.name)}
            className={`w-full text-left p-2 rounded transition-colors ${
              selectedMove === move.name ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium capitalize">{move.name}</span>
              <span>
                {move.damageRange[0]} - {move.damageRange[1]}%
                {move.recovery && ` (${move.recovery[0]} - ${move.recovery[1]}% recovered)`}
              </span>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Pokemon 1 Stats */}
      <Card className="bg-secondary/5">
        <CardContent className="p-4">
          <div className="mb-4">
            <Label>Level</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={pokemon1.level}
              onChange={(e) => {
                const level = Math.min(100, Math.max(1, Number.parseInt(e.target.value) || 1))
                setPokemon1((prev) => ({
                  ...prev,
                  level,
                  stats: prev.stats.map((stat) => ({
                    ...stat,
                    total: calculateStat(
                      stat.base_stat,
                      stat.iv,
                      stat.ev,
                      level,
                      getNatureMultiplier(prev.nature, stat.stat.name),
                      stat.stat.name === "hp",
                    ),
                  })),
                }))
              }}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2 text-sm font-medium">
              <div>Stat</div>
              <div>Base</div>
              <div>IV</div>
              <div>EV</div>
              <div className="text-right">Total</div>
              <div></div>
            </div>
            {pokemon1.stats.map((stat) => (
              <div key={stat.stat.name} className="grid grid-cols-6 gap-2 items-center">
                <div className="capitalize text-sm">{stat.stat.name}</div>
                <div className="text-sm">{stat.base_stat}</div>
                <Input
                  type="number"
                  min="0"
                  max="31"
                  value={stat.iv}
                  onChange={(e) => {
                    const newIV = Math.min(31, Math.max(0, Number.parseInt(e.target.value) || 0))
                    setPokemon1((prev) => ({
                      ...prev,
                      stats: prev.stats.map((s) =>
                        s.stat.name === stat.stat.name
                          ? {
                              ...s,
                              iv: newIV,
                              total: calculateStat(
                                s.base_stat,
                                newIV,
                                s.ev,
                                prev.level,
                                getNatureMultiplier(prev.nature, s.stat.name),
                                s.stat.name === "hp",
                              ),
                            }
                          : s,
                      ),
                    }))
                  }}
                  className="w-12 text-sm"
                />
                <Input
                  type="number"
                  min="0"
                  max="252"
                  value={stat.ev}
                  onChange={(e) => {
                    const newEV = Math.min(252, Math.max(0, Number.parseInt(e.target.value) || 0))
                    const currentTotal = pokemon1.stats.reduce(
                      (sum, s) => sum + (s.stat.name === stat.stat.name ? newEV : s.ev),
                      0,
                    )
                    if (currentTotal <= 510) {
                      setPokemon1((prev) => ({
                        ...prev,
                        stats: prev.stats.map((s) =>
                          s.stat.name === stat.stat.name
                            ? {
                                ...s,
                                ev: newEV,
                                total: calculateStat(
                                  s.base_stat,
                                  s.iv,
                                  newEV,
                                  prev.level,
                                  getNatureMultiplier(prev.nature, s.stat.name),
                                  s.stat.name === "hp",
                                ),
                              }
                            : s,
                        ),
                      }))
                    }
                  }}
                  className="w-12 text-sm"
                />
                <div className="text-right text-sm">{stat.total}</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(stat.ev / 252) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="text-sm text-muted-foreground">
              EVs remaining: {510 - pokemon1.stats.reduce((sum, stat) => sum + stat.ev, 0)}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Select
              value={pokemon1.nature}
              onValueChange={(value: NatureType) => handleNatureChange(value, setPokemon1)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nature" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(NATURES).map((nature) => (
                  <SelectItem key={nature} value={nature}>
                    {formatNatureText(nature as NatureType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={pokemon1.ability}
              onValueChange={(value) => setPokemon1((prev) => ({ ...prev, ability: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ability" />
              </SelectTrigger>
              <SelectContent>
                {attacker.abilities?.map((ability) => (
                  <SelectItem key={ability.ability.name} value={ability.ability.name}>
                    {ability.ability.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pokemon1.item} onValueChange={(value) => setPokemon1((prev) => ({ ...prev, item: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Item" />
              </SelectTrigger>
              <SelectContent>
                {HELD_ITEMS.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Field Conditions */}
      <Card className="bg-secondary/5">
        <CardContent className="p-4">
          <Tabs defaultValue="field">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="field">Field</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
            </TabsList>
            <TabsContent value="field" className="space-y-4">
              <Select
                value={fieldConditions.weather}
                onValueChange={(value) => setFieldConditions((prev) => ({ ...prev, weather: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Clear</SelectItem>
                  <SelectItem value="sun">Sun</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="sand">Sandstorm</SelectItem>
                  <SelectItem value="snow">Snow</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={fieldConditions.terrain}
                onValueChange={(value) => setFieldConditions((prev) => ({ ...prev, terrain: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Terrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="grassy">Grassy</SelectItem>
                  <SelectItem value="misty">Misty</SelectItem>
                  <SelectItem value="psychic">Psychic</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="conditions" className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={fieldConditions.stealthRock}
                  onCheckedChange={(checked) =>
                    setFieldConditions((prev) => ({ ...prev, stealthRock: checked as boolean }))
                  }
                />
                <Label>Stealth Rock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={fieldConditions.lightScreen}
                  onCheckedChange={(checked) =>
                    setFieldConditions((prev) => ({ ...prev, lightScreen: checked as boolean }))
                  }
                />
                <Label>Light Screen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={fieldConditions.reflect}
                  onCheckedChange={(checked) =>
                    setFieldConditions((prev) => ({ ...prev, reflect: checked as boolean }))
                  }
                />
                <Label>Reflect</Label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pokemon 2 Stats */}
      <Card className="bg-secondary/5">
        <CardContent className="p-4">
          <div className="mb-4">
            <Label>Level</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={pokemon2.level}
              onChange={(e) => {
                const level = Math.min(100, Math.max(1, Number.parseInt(e.target.value) || 1))
                setPokemon2((prev) => ({
                  ...prev,
                  level,
                  stats: prev.stats.map((stat) => ({
                    ...stat,
                    total: calculateStat(
                      stat.base_stat,
                      stat.iv,
                      stat.ev,
                      level,
                      getNatureMultiplier(prev.nature, stat.stat.name),
                      stat.stat.name === "hp",
                    ),
                  })),
                }))
              }}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2 text-sm font-medium">
              <div>Stat</div>
              <div>Base</div>
              <div>IV</div>
              <div>EV</div>
              <div className="text-right">Total</div>
              <div></div>
            </div>
            {pokemon2.stats.map((stat) => (
              <div key={stat.stat.name} className="grid grid-cols-6 gap-2 items-center">
                <div className="capitalize text-sm">{stat.stat.name}</div>
                <div className="text-sm">{stat.base_stat}</div>
                <Input
                  type="number"
                  min="0"
                  max="31"
                  value={stat.iv}
                  onChange={(e) => {
                    const newIV = Math.min(31, Math.max(0, Number.parseInt(e.target.value) || 0))
                    setPokemon2((prev) => ({
                      ...prev,
                      stats: prev.stats.map((s) =>
                        s.stat.name === stat.stat.name
                          ? {
                              ...s,
                              iv: newIV,
                              total: calculateStat(
                                s.base_stat,
                                newIV,
                                s.ev,
                                prev.level,
                                getNatureMultiplier(prev.nature, s.stat.name),
                                s.stat.name === "hp",
                              ),
                            }
                          : s,
                      ),
                    }))
                  }}
                  className="w-12 text-sm"
                />
                <Input
                  type="number"
                  min="0"
                  max="252"
                  value={stat.ev}
                  onChange={(e) => {
                    const newEV = Math.min(252, Math.max(0, Number.parseInt(e.target.value) || 0))
                    const currentTotal = pokemon2.stats.reduce(
                      (sum, s) => sum + (s.stat.name === stat.stat.name ? newEV : s.ev),
                      0,
                    )
                    if (currentTotal <= 510) {
                      setPokemon2((prev) => ({
                        ...prev,
                        stats: prev.stats.map((s) =>
                          s.stat.name === stat.stat.name
                            ? {
                                ...s,
                                ev: newEV,
                                total: calculateStat(
                                  s.base_stat,
                                  s.iv,
                                  newEV,
                                  prev.level,
                                  getNatureMultiplier(prev.nature, s.stat.name),
                                  s.stat.name === "hp",
                                ),
                              }
                            : s,
                        ),
                      }))
                    }
                  }}
                  className="w-12 text-sm"
                />
                <div className="text-right text-sm">{stat.total}</div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(stat.ev / 252) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="text-sm text-muted-foreground">
              EVs remaining: {510 - pokemon2.stats.reduce((sum, stat) => sum + stat.ev, 0)}
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Select
              value={pokemon2.nature}
              onValueChange={(value: NatureType) => handleNatureChange(value, setPokemon2)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nature" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(NATURES).map((nature) => (
                  <SelectItem key={nature} value={nature}>
                    {formatNatureText(nature as NatureType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={pokemon2.ability}
              onValueChange={(value) => setPokemon2((prev) => ({ ...prev, ability: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ability" />
              </SelectTrigger>
              <SelectContent>
                {defender.abilities?.map((ability) => (
                  <SelectItem key={ability.ability.name} value={ability.ability.name}>
                    {ability.ability.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pokemon2.item} onValueChange={(value) => setPokemon2((prev) => ({ ...prev, item: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Item" />
              </SelectTrigger>
              <SelectContent>
                {HELD_ITEMS.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Move Selection and Results */}
      <Card className="col-span-full bg-secondary/5">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pokemon 1 Moves */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{pokemon1.name}'s Moves</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <Select
                      key={index}
                      value={selectedMoves[index]}
                      onValueChange={(value) => {
                        const newMoves = [...selectedMoves]
                        newMoves[index] = value
                        setSelectedMoves(newMoves)

                        // Calculate results for this move
                        const move = attacker.moves.find((m) => m.name === value)
                        if (move) {
                          const result = calculateMoveResults(move, pokemon1, pokemon2)
                          setPokemon1Moves((prev) => {
                            const existing = prev.findIndex((m) => m.name === value)
                            if (existing >= 0) {
                              const newMoves = [...prev]
                              newMoves[existing] = result
                              return newMoves
                            }
                            return [...prev, result]
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select move" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[200px]">
                          {attacker.moves.map((move) => (
                            <SelectItem key={move.name} value={move.name}>
                              {move.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  ))}
              </div>
              {pokemon1Moves.length > 0 && (
                <MovesList moves={pokemon1Moves} onMoveSelect={setSelectedMove1} selectedMove={selectedMove1} />
              )}
            </div>

            {/* Pokemon 2 Moves */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{pokemon2.name}'s Moves</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Array(4)
                  .fill(null)
                  .map((_, index) => (
                    <Select
                      key={index}
                      value={selectedMoves[index]}
                      onValueChange={(value) => {
                        const newMoves = [...selectedMoves]
                        newMoves[index] = value
                        setSelectedMoves(newMoves)

                        // Calculate results for this move
                        const move = defender.moves.find((m) => m.name === value)
                        if (move) {
                          const result = calculateMoveResults(move, pokemon2, pokemon1)
                          setPokemon2Moves((prev) => {
                            const existing = prev.findIndex((m) => m.name === value)
                            if (existing >= 0) {
                              const newMoves = [...prev]
                              newMoves[existing] = result
                              return newMoves
                            }
                            return [...prev, result]
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select move" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-[200px]">
                          {defender.moves.map((move) => (
                            <SelectItem key={move.name} value={move.name}>
                              {move.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  ))}
              </div>
              {pokemon2Moves.length > 0 && (
                <MovesList moves={pokemon2Moves} onMoveSelect={setSelectedMove2} selectedMove={selectedMove2} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DamageCalculator

