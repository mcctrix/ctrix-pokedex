// import { useState } from "react"
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { PokemonListResponse } from "@/lib/pokemon";
import { PokemonDialog } from "@/components/PokemonDialog";

export default function PokemonList({
  pokemonData,
  page,
}: {
  pokemonData: PokemonListResponse;
  page: number;
}) {
  // const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null)

  const totalPages = Math.ceil(pokemonData.count / 20);

  // const handlePokemonClick = (pokemonName: string) => {
  //   setSelectedPokemon(pokemonName)
  // }

  const getPageNumberRange = (page: number, totalPages: number) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (page >= totalPages - 2) {
      return [
        totalPages - 1,
        totalPages,
      ];
    }

    return [page - 1, page, page + 1];
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemonData.results.map((pokemon) => (
          <div
            key={pokemon.name}
            className="border rounded-lg py-4 px-2 hover:shadow-lg transition-shadow cursor-pointer"
            // onClick={() => handlePokemonClick(pokemon.name)}
          >
            <Image
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
                pokemon.url.split("/")[6]
              }.png`}
              alt={pokemon.name}
              width={200}
              height={200}
              className="mx-auto"
            />
            <h2 className="text-center mt-2 capitalize">{pokemon.name}</h2>
            <div className="flex justify-center gap-2 mt-2">
              {pokemon.types.map((type) => (
                <Badge
                  key={type}
                  className={`capitalize bg-${type.toLowerCase()} text-white`}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Pagination className="mt-8">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious href={`/pokedex?page=${page - 1}`} />
            </PaginationItem>
          )}
          <PaginationItem>
            {getPageNumberRange(page, totalPages).map((pageNumber) => (
              <PaginationLink
                href={`/pokedex?page=${pageNumber}`}
                isActive={page === pageNumber ? true : false}
                className={page === pageNumber ? "shadow-2xl" : ""}
              >
                {pageNumber}
              </PaginationLink>
            ))}
          </PaginationItem>
          {page < totalPages && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href={`/pokedex?page=${page + 1}`} />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
      {/* <PokemonDialog pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} /> */}
    </div>
  );
}
