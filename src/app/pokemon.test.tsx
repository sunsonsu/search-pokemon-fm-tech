import { Pokemon } from "./pokemon.types";

export const mockBulbasaur: Pokemon = {
  id: "bulbasaur-id",
  number: "001",
  name: "Bulbasaur",
  weight: { minimum: "6.04kg", maximum: "7.76kg" },
  height: { minimum: "0.61m", maximum: "0.79m" },
  classification: "Seed Pokémon",
  types: ["Grass", "Poison"],
  resistant: ["Water", "Electric", "Grass", "Fighting", "Fairy"],
  weaknesses: ["Fire", "Ice", "Flying", "Psychic"],
  fleeRate: 0.1,
  maxCP: 951,
  maxHP: 1071,
  image: "https://img.pokemondb.net/artwork/bulbasaur.jpg",
  attacks: {
    fast: [
      { name: "Tackle", type: "Normal", damage: 12 },
      { name: "Vine Whip", type: "Grass", damage: 7 }
    ],
    special: [
      { name: "Power Whip", type: "Grass", damage: 70 },
      { name: "Sludge Bomb", type: "Poison", damage: 55 }
    ]
  },
  evolutions: []
};

export const mockCharmander: Pokemon = {
  id: "charmander-id",
  number: "004",
  name: "Charmander",
  weight: { minimum: "7.44kg", maximum: "9.56kg" },
  height: { minimum: "0.53m", maximum: "0.68m" },
  classification: "Lizard Pokémon",
  types: ["Fire"],
  resistant: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"],
  weaknesses: ["Water", "Ground", "Rock"],
  fleeRate: 0.1,
  maxCP: 841,
  maxHP: 955,
  image: "https://img.pokemondb.net/artwork/charmander.jpg",
  attacks: {
    fast: [
      { name: "Scratch", type: "Normal", damage: 6 },
      { name: "Ember", type: "Fire", damage: 10 }
    ],
    special: [
      { name: "Flame Burst", type: "Fire", damage: 30 },
      { name: "Flamethrower", type: "Fire", damage: 55 }
    ]
  },
  evolutions: []
};

export const mockSquirtle: Pokemon = {
  id: "squirtle-id",
  number: "007",
  name: "Squirtle",
  weight: { minimum: "7.88kg", maximum: "10.13kg" },
  height: { minimum: "0.44m", maximum: "0.56m" },
  classification: "Tiny Turtle Pokémon",
  types: ["Water"],
  resistant: ["Fire", "Water", "Ice", "Steel"],
  weaknesses: ["Electric", "Grass"],
  fleeRate: 0.1,
  maxCP: 891,
  maxHP: 1008,
  image: "https://img.pokemondb.net/artwork/squirtle.jpg",
  attacks: {
    fast: [
      { name: "Tackle", type: "Normal", damage: 12 },
      { name: "Bubble", type: "Water", damage: 15 }
    ],
    special: [
      { name: "Aqua Tail", type: "Water", damage: 45 },
      { name: "Water Pulse", type: "Water", damage: 35 }
    ]
  },
  evolutions: []
};

describe("Pokemon Type Assertions", () => {
  test("assert Bulbasaur has correct Grass and Poison types", () => {
    expect(mockBulbasaur.types).toEqual(["Grass", "Poison"]);
  });

  test("assert Charmander has correct Fire type", () => {
    expect(mockCharmander.types).toEqual(["Fire"]);
  });

  test("assert Squirtle has correct Water type", () => {
    expect(mockSquirtle.types).toEqual(["Water"]);
  });
});
