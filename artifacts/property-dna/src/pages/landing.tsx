import { Link } from "wouter";
import { Dna, TrendingUp, BarChart3, FileText, Shield, ChevronRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Instant Deal Analysis",
    desc: "Paste in the numbers and get a complete deal breakdown in seconds — cash flow, cap rate, DSCR, and more.",
  },
  {
    icon: TrendingUp,
    title: "Deal Score 0–100",
    desc: "A proprietary scoring algorithm gives every deal a clear score and rating: Green, Yellow, or Red.",
  },
  {
    icon: FileText,
    title: "Full Report Tracking",
    desc: "Track every deal through the pipeline from NEW to COMPLETED with status updates at every stage.",
  },
  {
    icon: Shield,
    title: "Built for Investors",
    desc: "Not a spreadsheet. Not a calculator. A real tool designed for serious buyers who analyze multiple deals a week.",
  },
];

const steps = [
  { num: "01", title: "Submit Your Deal", desc: "Enter the property address, purchase price, rents, expenses, and financing terms." },
  { num: "02", title: "Get Your Score", desc: "Our engine computes 10+ financial metrics and assigns a deal score with a Buy / Review / Pass recommendation." },
  { num: "03", title: "Track & Decide", desc: "View your full deal report, track status, and compare deals side by side on your dashboard." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Dna className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-sm sm:text-base">PropertyDNA</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-1.5 whitespace-nowrap">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-xs sm:text-sm font-semibold bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-8 pt-12 sm:pt-20 pb-10 sm:pb-16 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Phase 1 MVP — Now Live
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight mb-4 sm:mb-5 leading-tight">
          Analyze any property deal<br className="hidden sm:block" />{" "}
          <span className="text-primary">in under 2 minutes</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
          PropertyDNA turns raw property numbers into clear investment decisions. Cash flow, DSCR, cap rate, and a 0–100 deal score — automatically calculated and tracked.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md w-full sm:w-auto"
          >
            Start Analyzing Deals
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-3 border border-border rounded-lg hover:bg-muted/50 w-full sm:w-auto"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats bar — 2×2 on mobile, 4-col on desktop */}
      <div className="bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 sm:py-6 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { value: "10+", label: "Financial Metrics" },
            { value: "0–100", label: "Deal Score Range" },
            { value: "4", label: "Status Stages" },
            { value: "Phase 1", label: "MVP Build" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center px-4 py-3 sm:py-0 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features — 1-col mobile, 2-col desktop */}
      <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">Everything you need to analyze a deal</h2>
        <p className="text-muted-foreground text-center mb-7 sm:mb-10 text-sm">No spreadsheet. No guessing. Just numbers that tell you what to do.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3 sm:mb-4">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — stacked on mobile, 3-col on desktop */}
      <section className="bg-card border-y border-border px-4 sm:px-8 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-8 sm:mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="text-center sm:text-center flex sm:block items-start sm:items-center gap-4 sm:gap-0">
                <div className="text-3xl sm:text-4xl font-black text-primary/20 mb-0 sm:mb-3 shrink-0 w-12 sm:w-auto">{num}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-left sm:text-center">{title}</h3>
                  <p className="text-sm text-muted-foreground text-left sm:text-center">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics — 2-col mobile, 4-col desktop */}
      <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">Every metric that matters</h2>
        <p className="text-sm text-muted-foreground text-center mb-6 sm:mb-8">Calculated instantly from the numbers you enter.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {[
            "Monthly Cash Flow", "Annual Cash Flow", "Cash-on-Cash Return",
            "DSCR", "Cap Rate", "Deal Score", "Monthly Mortgage",
            "Net Operating Income", "Total Investment", "Deal Rating",
            "Recommendation", "Total Expenses",
          ].map((metric) => (
            <div key={metric} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2.5 text-xs sm:text-sm text-foreground">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
              <span className="leading-tight">{metric}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 sm:px-8 py-12 sm:py-16 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-3">Ready to analyze your first deal?</h2>
        <p className="text-primary-foreground/80 mb-6 text-sm">Create a free account. No credit card required.</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
        >
          Get Started Free
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 sm:px-8 py-5 sm:py-6 bg-card">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">PropertyDNA</span>
            <span className="text-xs text-muted-foreground ml-1">MVP v1.0</span>
          </div>
          <p className="text-xs text-muted-foreground">Phase 1 — Internal tools only. Integrations coming in Phase 2.</p>
        </div>
      </footer>
    </div>
  );
}
