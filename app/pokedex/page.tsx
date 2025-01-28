import PokemonList from "@/components/PokemonList";
import SearchBar from "@/components/SearchBar";
import { getPokemonList, getPokemonTypes } from "@/lib/pokemon";

const getPokemonData = async (page: number = 1) => {
  const pokemons = await getPokemonList(page);

  const pkWithTypes = pokemons.results.map((pokemon) =>
    getPokemonTypes(pokemon.name)
  );
  await Promise.all(pkWithTypes).then((types) => {
    types.forEach((type, index) => {
      pokemons.results[index].types = type;
    });
  });
  return pokemons
};

export default async function Pokedex({
  searchParams = {},
}: {
  searchParams?: { page?: string }
}) {
  const page = searchParams.page === undefined? 1 : parseInt(searchParams.page) as number
  const data = await getPokemonData(page);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Pokedex</h1>
      <SearchBar />
        <PokemonList pokemonData={data} page={page} />
    </main>
  );
}
