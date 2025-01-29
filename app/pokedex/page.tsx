import SearchBar from "@/components/SearchBar";

export default async function Pokedex() {

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Pokedex</h1>
      <SearchBar />
    </main>
  );
}
