"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PokemonCard from "@/components/PokemonCard";
import { getPokemonDetails } from "@/lib/pokemon";
import { motion } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";

export function PokemonDialog({
  pokemonName,
  onClose,
}: {
  pokemonName: any;
  onClose: () => void;
}) {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pokemonName) {
      const fetchPokemonDetails = async () => {
        try {
          const details = await getPokemonDetails(pokemonName);
          setPokemonDetails(details);
          setError(null);
        } catch (err) {
          console.error("Error fetching Pokemon details:", err);
          setError("Failed to load Pokemon details. Please try again.");
        }
      };
      fetchPokemonDetails();
    }
  }, [pokemonName]);

  return (
    <Dialog open={!!pokemonName} onOpenChange={() => {
      setPokemonDetails(null);
      onClose();
    }}>
      <DialogContent className="max-w-4xl" >
        <motion.div
          initial={{ y: 300, opacity: 0 }} // Start from the bottom
          animate={{ y: 0, opacity: 1 }} // Move to center
          exit={{ y: 300, opacity: 0 }} // Exit back to bottom
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
        >
          <VisuallyHidden>
          <DialogTitle title={pokemonName} />
            </VisuallyHidden>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : pokemonDetails ? (
            <PokemonCard pokemon={pokemonDetails} />
          ) : (
            <div>Loading...</div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
