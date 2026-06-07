import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import { useCreateDeal } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDealsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  DollarSign,
  Landmark,
  Upload,
  Info,
  ChevronRight,
  Loader2,
} from "lucide-react";

type Section = "property" | "financials" | "financing";

function CurrencyInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  hint,
  suffix,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground block mb-1.5">{label}</label>
      <div className="relative">
        {!suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        )}
        <input
          type="number"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          step="any"
          className={cn(
            "w-full py-2.5 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition",
            suffix ? "px-3 pr-8" : "pl-7 pr-3"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default function NewDealPage() {
  const { user } = useAuth();
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

  if (!user) { navigate("/login"); return null; }

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const sections: { key: Section; label: string; icon: typeof MapPin }[] = [
    { key: "property", label: "Property Details", icon: MapPin },
    { key: "financials", label: "Income & Expenses", icon: DollarSign },
    { key: "financing", label: "Financing", icon: Landmark },
  ];

  function validate(): boolean {
    const errs: string[] = [];
    if (!form.address.trim()) errs.push("Property address is required.");
    if (!form.purchasePrice || Number(form.purchasePrice) <= 0) errs.push("Purchase price must be greater than 0.");
    if (!form.estimatedRent || Number(form.estimatedRent) <= 0) errs.push("Estimated rent must be greater than 0.");
    if (!form.downPayment || Number(form.downPayment) <= 0) errs.push("Down payment must be greater than 0.");
    if (!form.interestRate || Number(form.interestRate) <= 0) errs.push("Interest rate must be greater than 0.");
    if (!form.loanTerm || Number(form.loanTerm) <= 0) errs.push("Loan term must be greater than 0.");
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

  return (
    <Layout title="New Deal Analysis">
      <div className="px-8 py-7 max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-foreground">Submit Property Deal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enter the property details to get your deal score and full analysis.</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                section === key
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Property Details */}
          {section === "property" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Property Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  placeholder="124 Maple Street, Austin, TX 78701"
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes")(e.target.value)}
                  placeholder="3/2 SFR, good school district, tenant in place..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                />
              </div>

              {/* FUTURE: Document & Photo Upload placeholder */}
              {/* FUTURE: Google Drive / S3 object storage for property photos, inspection reports, rehab photos */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Document & Photo Upload</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">Phase 2</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload property photos, inspection reports, and rehab documentation.
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  Coming in Phase 2 — will support Google Drive, S3 storage, and AI-powered rehab photo analysis.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-3 text-xs font-medium text-muted-foreground/50 px-4 py-2 border border-border rounded-md cursor-not-allowed"
                >
                  Upload Files (Coming Soon)
                </button>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setSection("financials")} className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Next: Income & Expenses <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Financials */}
          {section === "financials" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <CurrencyInput label="Purchase Price *" name="purchasePrice" value={form.purchasePrice} onChange={set("purchasePrice")} placeholder="285000" />
                <CurrencyInput label="Estimated Monthly Rent *" name="estimatedRent" value={form.estimatedRent} onChange={set("estimatedRent")} placeholder="2400" hint="Gross monthly rental income" />
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Monthly Operating Expenses</span>
                  <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CurrencyInput label="Annual Property Taxes" name="taxes" value={form.taxes} onChange={set("taxes")} placeholder="4200" hint="Enter annual amount" />
                  <CurrencyInput label="Annual Insurance" name="insurance" value={form.insurance} onChange={set("insurance")} placeholder="1200" hint="Enter annual amount" />
                  <CurrencyInput label="HOA (monthly)" name="hoa" value={form.hoa} onChange={set("hoa")} placeholder="0" />
                  <CurrencyInput label="Maintenance (monthly)" name="maintenance" value={form.maintenance} onChange={set("maintenance")} placeholder="150" />
                  <CurrencyInput label="Property Management (monthly)" name="propertyManagement" value={form.propertyManagement} onChange={set("propertyManagement")} placeholder="192" hint="~8–10% of rent" />
                  <CurrencyInput label="Utilities (monthly)" name="utilities" value={form.utilities} onChange={set("utilities")} placeholder="0" />
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setSection("property")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => setSection("financing")} className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Next: Financing <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Financing */}
          {section === "financing" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <CurrencyInput label="Down Payment *" name="downPayment" value={form.downPayment} onChange={set("downPayment")} placeholder="57000" />
                <CurrencyInput label="Interest Rate (%) *" name="interestRate" value={form.interestRate} onChange={set("interestRate")} placeholder="7.25" suffix="%" hint="Annual rate, e.g. 7.25" />
                <CurrencyInput label="Loan Term (years) *" name="loanTerm" value={form.loanTerm} onChange={set("loanTerm")} placeholder="30" suffix="yrs" />
                <CurrencyInput label="Rehab Budget" name="rehabBudget" value={form.rehabBudget} onChange={set("rehabBudget")} placeholder="12000" hint="Total renovation estimate" />
                <CurrencyInput label="Closing Costs" name="closingCosts" value={form.closingCosts} onChange={set("closingCosts")} placeholder="5700" hint="~2–3% of purchase price" />
              </div>

              {errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 space-y-1">
                  {errors.map((e) => (
                    <p key={e} className="text-xs text-destructive">{e}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <button type="button" onClick={() => setSection("financials")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={createDeal.isPending}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {createDeal.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
                  ) : (
                    <>Analyze This Deal</>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
