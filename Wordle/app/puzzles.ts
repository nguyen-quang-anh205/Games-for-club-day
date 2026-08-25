export type PuzzleCategory = "general-one" | "general-two" | "usth";

export type Puzzle = {
  answer: string;
  intel: string;
  category: PuzzleCategory;
};

export const puzzles: Record<PuzzleCategory, Puzzle[]> = {
  "general-one": [
    { answer: "APPLE", category: "general-one", intel: "A familiar fruit and a friendly opening word." },
    { answer: "WATER", category: "general-one", intel: "The substance that supports every known form of life." },
    { answer: "HOUSE", category: "general-one", intel: "A building made to be lived in." },
    { answer: "DREAM", category: "general-one", intel: "A sequence of images and ideas experienced during sleep." },
    { answer: "LIGHT", category: "general-one", intel: "Visible energy that lets people see." },
  ],
  "general-two": [
    { answer: "BRICK", category: "general-two", intel: "A rectangular block used for building." },
    { answer: "MUSIC", category: "general-two", intel: "Organized sound shaped through rhythm and melody." },
    { answer: "TRACE", category: "general-two", intel: "A small sign left behind by an event or action." },
    { answer: "LASER", category: "general-two", intel: "A focused beam used in science, medicine, and communication." },
    { answer: "SOLAR", category: "general-two", intel: "Something related to energy from the Sun." },
  ],
  usth: [
    { answer: "ROBOT", category: "usth", intel: "Robotics combines software, electronics, and engineering." },
    { answer: "SPACE", category: "usth", intel: "Space science is one of the research directions explored at USTH." },
    { answer: "SOLAR", category: "usth", intel: "Solar energy connects physics, materials, and sustainable technology." },
    { answer: "CELLS", category: "usth", intel: "Cells are the fundamental units studied in life science." },
    { answer: "GENES", category: "usth", intel: "Genes carry biological information and are central to biotechnology." },
    { answer: "OCEAN", category: "usth", intel: "Ocean study connects climate, Earth observation, and environmental science." },
    { answer: "EARTH", category: "usth", intel: "Earth science uses data to understand our changing planet." },
    { answer: "LASER", category: "usth", intel: "Laser technology is used across physics, chemistry, and engineering laboratories." },
  ],
};

export function pickPuzzle(category: PuzzleCategory, random: () => number = Math.random) {
  const options = puzzles[category];
  return options[Math.floor(random() * options.length)];
}
