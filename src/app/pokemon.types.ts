export type PokemonRange = {
  minimum: string;
  maximum: string;
};

export type PokemonAttack = {
  name: string;
  type: string;
  damage: number;
};

export type PokemonAttacks = {
  fast: PokemonAttack[];
  special: PokemonAttack[];
};

export type RecursivePokemonFragment = {
  id: string;
  number: string;
  name: string;
  classification: string;
  types: string[];
  resistant: string[];
  weaknesses: string[];
  fleeRate: number;
  maxCP: number;
  maxHP: number;
  image: string;
  evolutions?: RecursivePokemonFragment[];
};

export type Pokemon = {
  id: string;
  number: string;
  name: string;
  weight: PokemonRange;
  height: PokemonRange;
  classification: string;
  types: string[];
  resistant: string[];
  weaknesses: string[];
  fleeRate: number;
  maxCP: number;
  maxHP: number;
  image: string;
  attacks: PokemonAttacks;
  evolutions: RecursivePokemonFragment[];
};

export type GetPokemonData = {
  pokemon: Pokemon | null;
};

export type GetPokemonVars = {
  id?: string | null;
  name: string;
};