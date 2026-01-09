export type TrialData = {
  id: number;
  problem: string;      // The raw problem string (e.g., "13/20 vs 0.35")
  left: string;         // Left value (e.g., "13/20")
  right: string;        // Right value (e.g., "0.35")
  correct_value: number;// The numeric value of the correct/larger answer
  type: string;         // The type of comparison
  distance: string;     // Difficulty/Distance metric
};

export const TRIALS: TrialData[] = [
  // --- Block 1: Pre-Instruction (From your CSV) ---
  { 
    id: 1, 
    problem: "13/20 vs 0.35", 
    left: "13/20", 
    right: "0.35", 
    correct_value: 0.65, 
    type: "Fraction > Decimal", 
    distance: "Large" 
  },
  { 
    id: 2, 
    problem: "13/20 vs 35%", 
    left: "13/20", 
    right: "35%", 
    correct_value: 0.65, 
    type: "Fraction > Percentage", 
    distance: "Large" 
  },
  { 
    id: 3, 
    problem: "0.65 vs 7/20", 
    left: "0.65", 
    right: "7/20", 
    correct_value: 0.65, 
    type: "Decimal > Fraction", 
    distance: "Large" 
  },
  { 
    id: 4, 
    problem: "0.65 vs 35%", 
    left: "0.65", 
    right: "35%", 
    correct_value: 0.65, 
    type: "Decimal > Percentage", 
    distance: "Large" 
  },
  { 
    id: 5, 
    problem: "65% vs 7/20", 
    left: "65%", 
    right: "7/20", 
    correct_value: 0.65, 
    type: "Percentage > Fraction", 
    distance: "Large" 
  },
  { 
    id: 6, 
    problem: "65% vs 0.35", 
    left: "65%", 
    right: "0.35", 
    correct_value: 0.65, 
    type: "Percentage > Decimal", 
    distance: "Large" 
  },

  // --- Example from Block 2 (Logic) ---
  { 
    id: 7, 
    problem: "7/10 vs 0.3", 
    left: "7/10", 
    right: "0.3", 
    correct_value: 0.7, 
    type: "Fraction > Decimal", 
    distance: "Large" 
  },
  { 
    id: 8, 
    problem: "7/10 vs 30%", 
    left: "7/10", 
    right: "30%", 
    correct_value: 0.7, 
    type: "Fraction > Percentage", 
    distance: "Large" 
  },
  
  // --- From the end of your file (Post-Instruction) ---
  {
    id: 61,
    problem: "11/20 vs 0.48",
    left: "11/20",
    right: "0.48",
    correct_value: 0.55,
    type: "Fraction > Decimal",
    distance: "Small"
  },
  {
    id: 62,
    problem: "11/20 vs 48%",
    left: "11/20",
    right: "48%",
    correct_value: 0.55,
    type: "Fraction > Percentage",
    distance: "Small"
  }
];