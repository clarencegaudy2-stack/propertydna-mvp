// Shared rating label/color utilities
// Maps internal DB values (Green/Yellow/Red) to professional investor language

export const RATING_LABEL: Record<string, string> = {
  Green: "Strong Deal",
  Yellow: "Review Needed",
  Red: "Reject",
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
