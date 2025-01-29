export default function PokedexLayout({
  children,
  pokemonlist,
}: {
  children: React.ReactNode;
  pokemonlist: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {pokemonlist}
    </div>
  );
}
