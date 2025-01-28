"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft } from "lucide-react"

export default function PokemonCard({ pokemon }) {
  const [activeTab, setActiveTab] = useState("info")
  const [isShiny, setIsShiny] = useState(false)

  if (!pokemon) {
    return <div>Error: Pokemon data not available</div>
  }

  const renderTypeEffectiveness = (types, title) => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {types.map(({ type, multiplier }) => (
          <div key={type} className="flex items-center">
            <Badge className={`capitalize ${type ? `bg-${type.toLowerCase()}` : "bg-gray-500"} text-white`}>
              {type || "Unknown"}
            </Badge>
            <span className="ml-1 bg-gray-700 rounded-full px-2 py-1 text-xs text-white">{multiplier}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const toggleShiny = () => {
    setIsShiny(!isShiny)
  }

  const getImageUrl = () => {
    if (isShiny) {
      return (
        pokemon.sprites?.other?.["official-artwork"]?.front_shiny || pokemon.sprites?.front_shiny || "/placeholder.svg"
      )
    }
    return (
      pokemon.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon.sprites?.front_default ||
      "/placeholder.svg"
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 relative">
          <Image
            src={getImageUrl() || "/placeholder.svg"}
            alt={`${pokemon.name} ${isShiny ? "shiny" : "normal"}`}
            width={400}
            height={400}
            className="w-full h-auto"
          />
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={toggleShiny}
            title={isShiny ? "Show normal version" : "Show shiny version"}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold mb-4 capitalize">{pokemon.name || "Unknown Pokemon"}</h2>
          <div className="flex gap-2 mb-4">
            {pokemon.types?.map((type) => (
              <Badge key={type.type.name} className={`capitalize bg-${type.type.name.toLowerCase()} text-white`}>
                {type.type.name}
              </Badge>
            )) || <Badge className="bg-gray-500 text-white">Unknown Type</Badge>}
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="moves">Moves</TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p>{pokemon.description || "No description available."}</p>
              <h3 className="text-xl font-semibold mt-4 mb-2">Location</h3>
              <p>{pokemon.location || "Unknown"}</p>
            </TabsContent>
            <TabsContent value="stats" className="space-y-6">
              {renderTypeEffectiveness(pokemon.resistances || [], "Resistances")}
              {renderTypeEffectiveness(pokemon.weaknesses || [], "Weaknesses")}

              <div>
                <h3 className="text-xl font-semibold mb-4">Base Stats</h3>
                <div className="space-y-4">
                  {pokemon.stats?.map((stat) => (
                    <div key={stat.stat.name}>
                      <div className="flex justify-between mb-1">
                        <span className="capitalize font-medium">{stat.stat.name.replace("-", " ")}</span>
                        <span>{stat.base_stat}</span>
                      </div>
                      <Progress
                        value={(stat.base_stat / 255) * 100}
                        className="h-2 bg-secondary"
                        indicatorClassName="bg-primary"
                      />
                    </div>
                  )) || <p>No stats available</p>}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="moves">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {pokemon.moves?.map((move) => (
                    <div key={move.name} className="flex items-center gap-4 p-2 bg-secondary rounded-lg">
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{move.name}</span>
                          <Badge className={`${move.type ? `bg-${move.type.toLowerCase()}` : "bg-gray-500"}`}>
                            {move.category || "Unknown"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {move.power && `Power: ${move.power} `}
                          Accuracy: {move.accuracy || "?"}% PP: {move.pp || "?"}
                        </div>
                      </div>
                    </div>
                  )) || <p>No moves available</p>}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

