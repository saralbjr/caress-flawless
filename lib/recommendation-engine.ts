import { ISkinAnalysis } from "@/models/SkinAnalysis";
import { IProduct } from "@/models/Product";
import mongoose from "mongoose";

// Define weights for different factors
const WEIGHTS = {
  SKIN_TYPE: 50,
  SKIN_CONCERNS: 20,
  INGREDIENTS_PREFERRED: 15,
  INGREDIENTS_AVOID: -30, // Negative weight for ingredients to avoid
  BUDGET_MATCH: 10,
  ROUTINE_COMPLEXITY: 5,
};

// Interface for product with score
interface ScoredProduct {
  product: IProduct;
  score: number;
  matchReasons: string[];
}

/**
 * Calculate relevance score for a product based on skin analysis
 */
function calculateProductScore(
  product: IProduct,
  skinAnalysis: ISkinAnalysis
): ScoredProduct {
  let score = 0;
  const matchReasons: string[] = [];

  // Check if product is in the beauty category
  if (product.category !== "beauty") {
    return { product, score: 0, matchReasons: [] };
  }

  // Extract product attributes from description (in a real app, these would be structured fields)
  const description = product.description.toLowerCase();

  // Score based on skin type match
  if (description.includes(skinAnalysis.skinType.toLowerCase())) {
    score += WEIGHTS.SKIN_TYPE;
    matchReasons.push(`Formulated for ${skinAnalysis.skinType} skin`);
  }

  // Score based on skin concerns
  skinAnalysis.skinConcerns.forEach((concern) => {
    if (description.includes(concern.toLowerCase())) {
      score += WEIGHTS.SKIN_CONCERNS;
      matchReasons.push(`Addresses ${concern}`);
    }
  });

  // Score based on preferred ingredients
  skinAnalysis.routinePreferences.preferredIngredients.forEach((ingredient) => {
    if (description.includes(ingredient.toLowerCase())) {
      score += WEIGHTS.INGREDIENTS_PREFERRED;
      matchReasons.push(`Contains ${ingredient}`);
    }
  });

  // Penalize for avoided ingredients
  skinAnalysis.routinePreferences.avoidIngredients.forEach((ingredient) => {
    if (description.includes(ingredient.toLowerCase())) {
      score += WEIGHTS.INGREDIENTS_AVOID;
      matchReasons.push(`Contains ${ingredient} (which you prefer to avoid)`);
    }
  });

  // Budget match (assuming price ranges: low < Rs.20, medium Rs.20-Rs.50, high > Rs.50)
  const budget = skinAnalysis.routinePreferences.budget;
  if (
    (budget === "low" && product.price < 20) ||
    (budget === "medium" && product.price >= 20 && product.price <= 50) ||
    (budget === "high" && product.price > 50)
  ) {
    score += WEIGHTS.BUDGET_MATCH;
    matchReasons.push(`Matches your budget preference`);
  }

  // Handle edge case: if score is negative, set to 0
  if (score < 0) score = 0;

  return {
    product,
    score,
    matchReasons: matchReasons.filter((reason) => !reason.includes("avoid")), // Filter out negative reasons
  };
}

/**
 * Get product recommendations based on skin analysis
 */
export async function getRecommendations(
  skinAnalysis: ISkinAnalysis,
  products: IProduct[],
  limit: number = 10
): Promise<ScoredProduct[]> {
  // Calculate scores for all products
  const scoredProducts = products.map((product) =>
    calculateProductScore(product, skinAnalysis)
  );

  // Sort by score (descending) and take top results
  return scoredProducts
    .filter((item) => item.score > 0) // Only include products with positive scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Save recommendations to skin analysis document
 */
export async function saveRecommendations(
  skinAnalysisId: string,
  recommendedProductIds: mongoose.Types.ObjectId[]
): Promise<void> {
  const SkinAnalysis = mongoose.models.SkinAnalysis;

  await SkinAnalysis.findByIdAndUpdate(skinAnalysisId, {
    recommendedProducts: recommendedProductIds,
  });
}
