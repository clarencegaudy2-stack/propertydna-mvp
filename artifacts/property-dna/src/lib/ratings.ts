// Shared rating label/color utilities
// Maps internal DB values (Green/Yellow/Red) to professional investor language
//
// Thresholds: ≥75 = Strong Deal/Proceed/Green
//             50–74 = Review/Analyze Further/Yellow
//             <50   = Reject/Do Not Proceed/Red

export const RATING_LABEL: Record<string, string> = {
  Green: "Strong Deal",
  Yellow: "Review",
  Red: "Reject",
};

export const RECOMMENDATION_LABEL: Record<string, string> = {
  Proceed: "Proceed",
  "Analyze Further": "Analyze Further",
  "Do Not Proceed": "Do Not Proceed",
  // legacy fallbacks
  Buy: "Proceed",
  Review: "Analyze Further",
  Pass: "Do Not Proceed",
};

export const RECOMMENDATION_COLOR: Record<string, string> = {
  Proceed: "bg-emerald-100 text-emerald-700",
  "Analyze Further": "bg-amber-100 text-amber-700",
  "Do Not Proceed": "bg-red-100 text-red-700",
  Buy: "bg-emerald-100 text-emerald-700",
  Review: "bg-amber-100 text-amber-700",
  Pass: "bg-red-100 text-red-700",
};

export const RATING_BADGE_CLASS: Record<string, string> = {
  Green: "bg-emerald-100 text-emerald-700",
  Yellow: "bg-amber-100 text-amber-700",
  Red: "bg-red-100 text-red-700",
};

export const RATING_VERDICT_CLASS: Record<string, string> = {
  Green: "bg-emerald-50 border-emerald-200",
  Yellow: "bg-amber-50 border-amber-200",
  Red: "bg-red-50 border-red-200",
};

export const RATING_TEXT_CLASS: Record<string, string> = {
  Green: "text-emerald-700",
  Yellow: "text-amber-700",
  Red: "text-red-700",
};

export const RATING_SUBTEXT_CLASS: Record<string, string> = {
  Green: "text-emerald-600",
  Yellow: "text-amber-600",
  Red: "text-red-600",
};

export const RATING_TABLE_CLASS: Record<string, string> = {
  Green: "text-emerald-600 font-semibold",
  Yellow: "text-amber-600 font-semibold",
  Red: "text-red-600 font-semibold",
};

export function ratingLabel(rating: string | null | undefined): string {
  if (!rating) return "—";
  return RATING_LABEL[rating] ?? rating;
}

export function recommendationLabel(rec: string | null | undefined): string {
  if (!rec) return "—";
  return RECOMMENDATION_LABEL[rec] ?? rec;
}
