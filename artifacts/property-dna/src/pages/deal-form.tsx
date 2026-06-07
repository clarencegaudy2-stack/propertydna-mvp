import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import { useCreateDeal } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDealsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Upload, ChevronRight, Loader2 } from "lucide-react";

type Section = "property" | "financials" | "financing";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-foreground block mb-1.5">{children}</label>;
}

function TextInput({
  value, onChange, placeholder, type = "text", required = false,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
    />
  );
}

function CurrencyInput({
  label, value, onChange, placeholder, hint, suffix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; suffix?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {!suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">$</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          step="any"
          inputMode="decimal"
          className={cn(
            "w-full py-2.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition",
            suffix ? "px-3 pr-10" : "pl-7 pr-3"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

const SECTIONS: { key: Section; label: string; short: string }[] = [
  { key: "property", label: "Property Details", short: "Property" },
  { key: "financials", label: "Income & Expenses", short: "Financials" },
  { key: "financing", label: "Financing", short: "Financing" },
];

export default function NewDealPage() {
  const { isLoaded } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const createDeal = useCreateDeal();

  const [section, setSection] = useState<Section>("property");
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState({
    address: "",
    notes: "",
    purchasePrice: "",
    estimatedRent: "",
    taxes: "",
    insurance: "",
    hoa: "",
    maintenance: "",
    propertyManagement: "",
    utilities: "",
    downPayment: "",
    interestRate: "",
    loanTerm: "30",
    rehabBudget: "",
    closingCosts: "",
  });

  if (!isLoaded) return null;

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  function validate(): boolean {
    const errs: string[] = [];
    if (!form.address.trim()) errs.push("Property address is required.");
    if (!form.purchasePrice || Number(form.purchasePrice) <= 0) errs.push("Purchase price must be > 0.");
    if (!form.estimatedRent || Number(form.estimatedRent) <= 0) errs.push("Estimated rent must be > 0.");
    if (!form.downPayment || Number(form.downPayment) <= 0) errs.push("Down payment must be > 0.");
    if (!form.interestRate || Number(form.interestRate) <= 0) errs.push("Interest rate must be > 0.");
    if (!form.loanTerm || Number(form.loanTerm) <= 0) errs.push("Loan term must be > 0.");
    setErrors(errs);
    return errs.length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) { setSection("property"); return; }
    createDeal.mutate(
      {
        data: {
          address: form.address,
          purchasePrice: Number(form.purchasePrice),
          estimatedRent: Number(form.estimatedRent),
          taxes: Number(form.taxes) || 0,
          insurance: Number(form.insurance) || 0,
          hoa: Number(form.hoa) || 0,
          maintenance: Number(form.maintenance) || 0,
          propertyManagement: Number(form.propertyManagement) || 0,
          utilities: Number(form.utilities) || 0,
          downPayment: Number(form.downPayment),
          interestRate: Number(form.interestRate),
          loanTerm: Number(form.loanTerm),
          rehabBudget: Number(form.rehabBudget) || 0,
          closingCosts: Number(form.closingCosts) || 0,
          notes: form.notes || null,
        },
      },
      {
        onSuccess: (deal) => {
          qc.invalidateQueries({ queryKey: getListDealsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          navigate(`/deals/${deal.id}`);
        },
      }
    );
  }

  const sectionIndex = SECTIONS.findIndex((s) => s.key === section);

  return (
    <Layout title="New Deal Analysis">
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 max-w-3xl mx-auto">
        <div className="mb-5">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Submit Property Deal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enter property details to get your deal score.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-5">
          {SECTIONS.map(({ key, short }, i) => {
            const active = key === section;
            const done = i < sectionIndex;
            return (
              <div key={key} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => setSection(key)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors w-full justify-center",
                    active ? "bg-primary text-primary-foreground" :
                    done ? "bg-primary/10 text-primary" :
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0",
                    active ? "bg-white/30 text-white" :
                    done ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{short}</span>
                </button>
                {i < SECTIONS.length - 1 && (
                  <div className={cn("h-px flex-1 mx-1", done ? "bg-primary/30" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Property Details ── */}
          {section === "property" && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
              <div>
                <FieldLabel>Property Address *</FieldLabel>
                <TextInput
                  value={form.address}
                  onChange={set("address")}
                  placeholder="124 Maple Street, Austin, TX 78701"
                  required
                />
              </div>
              <div>
                <FieldLabel>Notes</FieldLabel>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  placeholder="3/2 SFR, good school district, tenant in place..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>

              {/* FUTURE: Document & Photo Upload — Phase 2 */}
              <div className="border-2 border-dashed border-border rounded-xl p-5 text-center bg-muted/30">
                <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                  <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">Document & Photo Upload</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">Phase 2</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload property photos, inspection reports, and rehab documentation.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSection("financials")}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
                >
                  Next: Income & Expenses <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Financials ── */}
          {section === "financials" && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput label="Purchase Price *" value={form.purchasePrice} onChange={set("purchasePrice")} placeholder="285000" />
                <CurrencyInput label="Estimated Monthly Rent *" value={form.estimatedRent} onChange={set("estimatedRent")} placeholder="2400" hint="Gross monthly rental income" />
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Monthly Operating Expenses</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CurrencyInput label="Annual Property Taxes" value={form.taxes} onChange={set("taxes")} placeholder="4200" hint="Enter annual amount" />
                  <CurrencyInput label="Annual Insurance" value={form.insurance} onChange={set("insurance")} placeholder="1200" hint="Enter annual amount" />
                  <CurrencyInput label="HOA (monthly)" value={form.hoa} onChange={set("hoa")} placeholder="0" />
                  <CurrencyInput label="Maintenance (monthly)" value={form.maintenance} onChange={set("maintenance")} placeholder="150" />
                  <CurrencyInput label="Property Mgmt (monthly)" value={form.propertyManagement} onChange={set("propertyManagement")} placeholder="192" hint="~8–10% of rent" />
                  <CurrencyInput label="Utilities (monthly)" value={form.utilities} onChange={set("utilities")} placeholder="0" />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-1">
                <button type="button" onClick={() => setSection("property")} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 text-center sm:text-left">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setSection("financing")}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Next: Financing <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Financing ── */}
          {section === "financing" && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyInput label="Down Payment *" value={form.downPayment} onChange={set("downPayment")} placeholder="57000" />
                <CurrencyInput label="Interest Rate *" value={form.interestRate} onChange={set("interestRate")} placeholder="7.25" suffix="%" hint="Annual rate, e.g. 7.25" />
                <CurrencyInput label="Loan Term *" value={form.loanTerm} onChange={set("loanTerm")} placeholder="30" suffix="yrs" />
                <CurrencyInput label="Rehab Budget" value={form.rehabBudget} onChange={set("rehabBudget")} placeholder="12000" hint="Total renovation estimate" />
                <CurrencyInput label="Closing Costs" value={form.closingCosts} onChange={set("closingCosts")} placeholder="5700" hint="~2–3% of purchase price" />
              </div>

              {errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 space-y-1">
                  {errors.map((e) => (
                    <p key={e} className="text-xs text-destructive">{e}</p>
                  ))}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-1">
                <button type="button" onClick={() => setSection("financials")} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 text-center sm:text-left">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={createDeal.isPending}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {createDeal.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
                  ) : "Analyze This Deal"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
