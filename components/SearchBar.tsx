"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { getPokemonList } from "@/lib/pokemon"

export default function SearchBar() {
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [pokemonList, setPokemonList] = useState([])
  const router = useRouter()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchPokemonList = async () => {
      const { results } = await getPokemonList(1, 1000)
      setPokemonList(results.map((pokemon) => pokemon.name))
    }
    fetchPokemonList()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (pokemonName: string) => {
    if (pokemonName.trim()) {
      router.push(`/pokemon/${encodeURIComponent(pokemonName.trim())}`)
    }
    setShowDropdown(false)
    setSearch(pokemonName)
  }

  return (
    <div className="relative w-full max-w-xl mx-auto mb-8">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search Pokemon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full"
          />
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg"
            >
              <Command>
                <CommandList>
                  <CommandEmpty>No Pokemon found.</CommandEmpty>
                  <CommandGroup>
                    {pokemonList
                      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
                      .slice(0, 10)
                      .map((name) => (
                        <CommandItem
                          key={name}
                          onSelect={() => handleSearch(name)}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          {name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        <Button type="submit" onClick={() => handleSearch(search)}>
          Search
        </Button>
      </div>
    </div>
  )
}

