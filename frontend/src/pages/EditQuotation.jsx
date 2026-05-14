import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useQuotation from "../hooks/useQuotation";
import {
  getQuotation,
  updateQuotation,
  finalizeQuotation,
  markQuotationSent
} from "../api/quotationApi";
import { getSqlItems } from "../api/sqlItemsApi";
import PresetDescriptionInput from "../components/quotation/PresetDescriptionInput";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { useToast } from "../context/ToastContext";
import { usePreferences } from "../context/PreferencesContext";

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { formatMoney } = usePreferences();

  const {
    companyDetails,
    setCompanyDetails,
    customerDetails,
    setCustomerDetails,
    items,
    setItems,
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

  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [markingSent, setMarkingSent] = useState(false);
  const [error, setError] = useState(null);
  const [itemPresets, setItemPresets] = useState([]);

  useEffect(() => {
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

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await getQuotation(id);
        const q = res.data.data;

        setCompanyDetails(q.companyDetails || { name: "" });
        setCustomerDetails(q.customerDetails || { name: "" });
        setStatus(q.status || "DRAFT");
        setTax(q.tax?.percentage ?? 0);
        setDiscount(q.discount?.amount ?? 0);
        setTermsAndConditions(q.termsAndConditions ?? "");
        setNotes(q.notes ?? "");
        setItems(
          Array.isArray(q.items) && q.items.length > 0
            ? q.items.map(item => ({
                description: item.description ?? "",
                quantity: item.quantity ?? 0,
                rate: item.rate ?? 0,
                unit: item.unit ?? "",
                amount: (item.quantity ?? 0) * (item.rate ?? 0)
              }))
            : [{ description: "", quantity: 1, rate: 0, unit: "", amount: 0 }]
        );
      } catch (err) {
        const message = err.response?.data?.message || "Failed to load quotation";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const handleUpdate = async () => {
    setError(null);
    setSaving(true);
    const payload = {
      companyDetails,
      customerDetails,
      items,
      subTotal: totals.subTotal,
      tax: { percentage: Number(tax) || 0, amount: totals.taxAmount },
      discount: { amount: Number(discount) || 0 },
      grandTotal: totals.grandTotal,
      termsAndConditions: termsAndConditions.trim(),
      notes: notes.trim()
    };

    try {
      await updateQuotation(id, payload);
      toast.success("Quotation updated");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update quotation"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSent = async () => {
    setError(null);
    setMarkingSent(true);
    try {
      const res = await markQuotationSent(id);
      setStatus(res.data?.data?.status || "SENT");
      toast.success("Marked as sent");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not update status"
      );
      toast.error(err.response?.data?.message || "Could not mark as sent");
    } finally {
      setMarkingSent(false);
    }
  };

  const handleFinalize = async () => {
    setError(null);
    setFinalizing(true);
    try {
      await finalizeQuotation(id);
      toast.success("Quotation finalized");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to finalize quotation"
      );
      toast.error(err.response?.data?.message || "Failed to finalize");
    } finally {
      setFinalizing(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

  const labelBase = "mb-1.5 block text-sm font-medium text-slate-600";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  if (error && !companyDetails?.name && !customerDetails?.name) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 text-sm font-medium text-slate-600 underline hover:text-slate-800"
          >
            Back to quotations
          </button>
        </div>
      </div>
    );
  }

  const disabled = status === "FINAL";
  const statusVariant =
    status === "FINAL" ? "success" : status === "SENT" ? "info" : "neutral";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              <span aria-hidden>←</span> Back to quotations
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Edit quotation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {disabled
                ? "This quotation is finalized and cannot be edited."
                : "Update details, mark as sent when you email it, then finalize when accepted."}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant={statusVariant}>{status}</Badge>
            {status === "DRAFT" && !disabled && (
              <Button
                variant="secondary"
                size="sm"
                loading={markingSent}
                disabled={markingSent || saving || finalizing}
                onClick={handleMarkSent}
              >
                Mark as sent
              </Button>
            )}
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

        {disabled && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This quotation is <strong>FINAL</strong> and cannot be edited.
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50/70 via-white to-indigo-50/50 px-5 py-4 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-800">
              Quotation body
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              All sections below belong to this quote — keep totals accurate before
              sending.
            </p>
          </div>
          <div className="space-y-8 p-5 sm:p-8">
          {/* Company & Customer */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 ring-1 ring-slate-900/[0.03] sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-slate-800">
                Your company
              </h2>
              <label className={labelBase} htmlFor="edit-company-name">
                Company name
              </label>
              <input
                id="edit-company-name"
                type="text"
                placeholder="e.g. Acme Inc."
                className={inputBase}
                disabled={disabled}
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
              <label className={labelBase} htmlFor="edit-customer-name">
                Customer name
              </label>
              <input
                id="edit-customer-name"
                type="text"
                placeholder="e.g. John Smith"
                className={inputBase}
                disabled={disabled}
                value={customerDetails.name}
                onChange={e =>
                  setCustomerDetails({
                    ...customerDetails,
                    name: e.target.value
                  })
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
              {!disabled && (
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  <span aria-hidden>+</span> Add item
                </button>
              )}
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
                    {!disabled && (
                      <th className="w-14 px-2 py-3" aria-label="Remove row" />
                    )}
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
                          disabled={disabled}
                          inputClassName={`${inputBase} border-slate-100 py-2`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          className={`${inputBase} border-slate-100 py-2 text-right`}
                          disabled={disabled}
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
                          disabled={disabled}
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
                      {!disabled && (
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
                      )}
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
                <label className={labelBase} htmlFor="edit-quote-notes">
                  Notes
                </label>
                <textarea
                  id="edit-quote-notes"
                  rows={3}
                  placeholder="e.g. Valid 14 days. Delivery ex-works."
                  className={`${inputBase} min-h-[88px] resize-y py-3`}
                  disabled={disabled}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="edit-quote-terms">
                  Terms &amp; conditions
                </label>
                <textarea
                  id="edit-quote-terms"
                  rows={5}
                  placeholder="Payment terms, warranties, cancellation policy…"
                  className={`${inputBase} min-h-[120px] resize-y py-3`}
                  disabled={disabled}
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
              <div className="min-w-[140px] flex-1">
                <label className={labelBase} htmlFor="edit-tax">
                  Tax (%)
                </label>
                <input
                  id="edit-tax"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  className={inputBase}
                  disabled={disabled}
                  value={tax}
                  onChange={e => setTax(e.target.value)}
                />
              </div>
              <div className="min-w-[140px] flex-1">
                <label className={labelBase} htmlFor="edit-discount">
                  Discount (amount)
                </label>
                <input
                  id="edit-discount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  className={inputBase}
                  disabled={disabled}
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-6">
              <div className="space-y-1 text-sm">
                <p className="flex justify-between gap-8 text-slate-600">
                  <span>Sub total</span>
                  <span className="tabular-nums font-medium text-slate-800">
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
                  disabled={saving || finalizing || markingSent}
                >
                  Cancel
                </Button>
                {!disabled && (
                  <Button
                    variant="primary"
                    onClick={handleUpdate}
                    loading={saving}
                    disabled={saving || finalizing || markingSent || items.length === 0}
                  >
                    {saving ? "Updating..." : "Update Quotation"}
                  </Button>
                )}
                {(status === "DRAFT" || status === "SENT") && !disabled && (
                  <Button
                    variant="success"
                    onClick={handleFinalize}
                    loading={finalizing}
                    disabled={saving || finalizing || markingSent}
                  >
                    {finalizing ? "Finalizing..." : "Finalize quotation"}
                  </Button>
                )}
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuotation;
