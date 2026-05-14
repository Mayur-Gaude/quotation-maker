import React from "react";
import { useNavigate } from "react-router-dom";
import useQuotation from "../hooks/useQuotation";
import { createQuotation } from "../api/quotationApi";
import { getSqlItems } from "../api/sqlItemsApi";
import PresetDescriptionInput from "../components/quotation/PresetDescriptionInput";
import Button from "../components/common/Button";
import { useToast } from "../context/ToastContext";
import { usePreferences } from "../context/PreferencesContext";

const CreateQuotation = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { formatMoney } = usePreferences();
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [itemPresets, setItemPresets] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getSqlItems();
        if (!cancelled) setItemPresets(res.data?.data ?? []);
      } catch {
        if (!cancelled) setItemPresets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    companyDetails,
    setCompanyDetails,
    customerDetails,
    setCustomerDetails,
    items,
    addItem,
    updateItem,
    removeItem,
    applyItemPreset,
    tax,
    setTax,
    discount,
    setDiscount,
    termsAndConditions,
    setTermsAndConditions,
    notes,
    setNotes,
    totals
  } = useQuotation();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    const payload = {
      companyDetails,
      customerDetails,
      items,
      subTotal: totals.subTotal,
      tax: { percentage: Number(tax) || 0, amount: totals.taxAmount },
      discount: { amount: Number(discount) || 0 },
      grandTotal: totals.grandTotal,
      termsAndConditions: termsAndConditions.trim(),
      notes: notes.trim(),
      status: "DRAFT"
    };

    try {
      await createQuotation(payload);
      toast.success("Quotation created successfully!");
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to create quotation";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  const labelBase = "mb-1.5 block text-sm font-medium text-slate-600";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              <span aria-hidden>←</span> Back to quotations
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Create Quotation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Fill in the details below to create a new quotation draft.
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50/70 via-white to-indigo-50/50 px-5 py-4 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-800">
              New quotation
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              Work through each block below — your totals update as you go.
            </p>
          </div>
          <div className="space-y-8 p-5 sm:p-8">
          {/* Company & Customer cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-900/[0.03] sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-800">
                Your company
              </h2>
              <label className={labelBase} htmlFor="company-name">
                Company name
              </label>
              <input
                id="company-name"
                type="text"
                placeholder="e.g. Acme Inc."
                className={inputBase}
                value={companyDetails.name}
                onChange={e =>
                  setCompanyDetails({ ...companyDetails, name: e.target.value })
                }
              />
            </section>

            <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-900/[0.03] sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-800">
                Customer
              </h2>
              <label className={labelBase} htmlFor="customer-name">
                Customer name
              </label>
              <input
                id="customer-name"
                type="text"
                placeholder="e.g. John Smith"
                className={inputBase}
                value={customerDetails.name}
                onChange={e =>
                  setCustomerDetails({ ...customerDetails, name: e.target.value })
                }
              />
            </section>
          </div>

          {/* Line items */}
          <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-900/[0.03] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-800">
                Line items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                <span aria-hidden>+</span> Add item
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </th>
                    <th className="w-24 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Qty
                    </th>
                    <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rate
                    </th>
                    <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                    <th className="w-14 px-2 py-3" aria-label="Remove row" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-2">
                        <PresetDescriptionInput
                          value={item.description}
                          onChange={v => updateItem(i, "description", v)}
                          onSelectPreset={preset => applyItemPreset(i, preset)}
                          presets={itemPresets}
                          inputClassName={`${inputBase} border-slate-100 py-2`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          className={`${inputBase} border-slate-100 py-2 text-right`}
                          value={item.quantity}
                          onChange={e =>
                            updateItem(i, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className={`${inputBase} border-slate-100 py-2 text-right`}
                          value={item.rate}
                          onChange={e =>
                            updateItem(i, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5 text-right text-slate-700 tabular-nums">
                          {item.amount}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                          aria-label={`Remove item ${i + 1}`}
                        >
                          <span className="text-lg leading-none">×</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Notes & terms */}
          <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-900/[0.03] sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Notes & terms
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Optional. Shown on the quotation view and included in PDF / Excel when
              provided.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelBase} htmlFor="quote-notes">
                  Notes
                </label>
                <textarea
                  id="quote-notes"
                  rows={3}
                  placeholder="e.g. Valid 14 days. Delivery ex-works."
                  className={`${inputBase} min-h-[88px] resize-y py-3`}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="quote-terms">
                  Terms &amp; conditions
                </label>
                <textarea
                  id="quote-terms"
                  rows={5}
                  placeholder="Payment terms, warranties, cancellation policy…"
                  className={`${inputBase} min-h-[120px] resize-y py-3`}
                  value={termsAndConditions}
                  onChange={e => setTermsAndConditions(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Totals & actions */}
          <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-900/[0.03] sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-800">
              Totals
            </h2>
            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[140px]">
                <label className={labelBase} htmlFor="tax">
                  Tax (%)
                </label>
                <input
                  id="tax"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  className={inputBase}
                  value={tax}
                  onChange={e => setTax(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className={labelBase} htmlFor="discount">
                  Discount (amount)
                </label>
                <input
                  id="discount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  className={inputBase}
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-6">
              <div className="space-y-1 text-sm">
                <p className="flex justify-between gap-8 text-slate-600">
                  <span>Sub total</span>
                  <span className="font-medium tabular-nums text-slate-800">
                    {formatMoney(totals.subTotal)}
                  </span>
                </p>
                <p className="flex justify-between gap-8 text-lg font-semibold text-slate-800">
                  <span>Grand total</span>
                  <span className="tabular-nums">
                    {formatMoney(totals.grandTotal)}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading || items.length === 0}
                >
                  {loading ? "Saving..." : "Save Quotation"}
                </Button>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotation;
