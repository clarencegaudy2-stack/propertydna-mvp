/**
 * PropertyDNA Deal Calculator
 * Computes all financial metrics for a property deal.
 *
 * FUTURE: OpenAI AI Deal Coach — pass these results to GPT-4 for natural-language analysis
 */

export interface DealInputNumbers {
  purchasePrice: number;
  estimatedRent: number;
  taxes: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  propertyManagement: number;
  utilities: number;
  downPayment: number;
  interestRate: number; // annual percentage, e.g. 7.5
  loanTerm: number;    // years
  rehabBudget: number;
  closingCosts: number;
}

export interface DealResults {
  monthlyMortgage: number;
  totalMonthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
  dscr: number;
  capRate: number;
  noi: number;
  totalInvestment: number;
  dealScore: number;
  dealRating: "Green" | "Yellow" | "Red";
  recommendation: "Proceed" | "Analyze Further" | "Do Not Proceed";
}

export function calculateDeal(input: DealInputNumbers): DealResults {
  const loanAmount = input.purchasePrice - input.downPayment;
  const monthlyRate = input.interestRate / 100 / 12;
  const numPayments = input.loanTerm * 12;

  // Monthly mortgage (principal + interest)
  let monthlyMortgage = 0;
  if (monthlyRate > 0 && loanAmount > 0) {
    monthlyMortgage =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Monthly operating expenses (excluding mortgage)
  const monthlyOpExpenses =
    input.taxes / 12 +
    input.insurance / 12 +
    input.hoa +
    input.maintenance +
    input.propertyManagement +
    input.utilities;

  const totalMonthlyExpenses = monthlyMortgage + monthlyOpExpenses;
  const monthlyCashFlow = input.estimatedRent - totalMonthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Total cash invested
  const totalInvestment =
    input.downPayment + input.rehabBudget + input.closingCosts;

  // Cash-on-cash return
  const cashOnCashReturn =
    totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

  // NOI (Net Operating Income) — rent minus operating expenses, before debt
  const annualOpExpenses = monthlyOpExpenses * 12;
  const noi = input.estimatedRent * 12 - annualOpExpenses;

  // Cap rate = NOI / purchase price
  const capRate =
    input.purchasePrice > 0 ? (noi / input.purchasePrice) * 100 : 0;

  // DSCR = NOI / annual debt service
  const annualDebtService = monthlyMortgage * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;

  // Deal Score (0–100)
  const dealScore = computeDealScore({ cashOnCashReturn, dscr, capRate, monthlyCashFlow });

  // Rating and recommendation
  const { dealRating, recommendation } = rateAndRecommend(dealScore);

  return {
    monthlyMortgage: round2(monthlyMortgage),
    totalMonthlyExpenses: round2(totalMonthlyExpenses),
    monthlyCashFlow: round2(monthlyCashFlow),
    annualCashFlow: round2(annualCashFlow),
    cashOnCashReturn: round2(cashOnCashReturn),
    dscr: round2(dscr),
    capRate: round2(capRate),
    noi: round2(noi),
    totalInvestment: round2(totalInvestment),
    dealScore: round2(dealScore),
    dealRating,
    recommendation,
  };
}

function computeDealScore(metrics: {
  cashOnCashReturn: number;
  dscr: number;
  capRate: number;
  monthlyCashFlow: number;
}): number {
  let score = 0;

  // Cash-on-cash return (max 35 pts)
  if (metrics.cashOnCashReturn >= 15) score += 35;
  else if (metrics.cashOnCashReturn >= 10) score += 28;
  else if (metrics.cashOnCashReturn >= 7) score += 20;
  else if (metrics.cashOnCashReturn >= 5) score += 12;
  else if (metrics.cashOnCashReturn >= 0) score += 5;

  // DSCR (max 30 pts)
  if (metrics.dscr >= 1.5) score += 30;
  else if (metrics.dscr >= 1.25) score += 22;
  else if (metrics.dscr >= 1.1) score += 14;
  else if (metrics.dscr >= 1.0) score += 7;

  // Cap rate (max 25 pts)
  if (metrics.capRate >= 10) score += 25;
  else if (metrics.capRate >= 8) score += 20;
  else if (metrics.capRate >= 6) score += 13;
  else if (metrics.capRate >= 4) score += 7;

  // Monthly cash flow bonus (max 10 pts)
  if (metrics.monthlyCashFlow >= 500) score += 10;
  else if (metrics.monthlyCashFlow >= 300) score += 7;
  else if (metrics.monthlyCashFlow >= 100) score += 4;
  else if (metrics.monthlyCashFlow >= 0) score += 1;

  return Math.min(100, Math.max(0, score));
}

function rateAndRecommend(score: number): {
  dealRating: "Green" | "Yellow" | "Red";
  recommendation: "Proceed" | "Analyze Further" | "Do Not Proceed";
} {
  if (score >= 75) return { dealRating: "Green", recommendation: "Proceed" };
  if (score >= 50) return { dealRating: "Yellow", recommendation: "Analyze Further" };
  return { dealRating: "Red", recommendation: "Do Not Proceed" };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
