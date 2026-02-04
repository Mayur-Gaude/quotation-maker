import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useQuotation from "../hooks/useQuotation";
import {
  getQuotation,
  updateQuotation,
  finalizeQuotation
} from "../api/quotationApi";

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    tax,
    setTax,
    discount,
    setDiscount,
    totals
  } = useQuotation();

  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setItems(
          Array.isArray(q.items) && q.items.length > 0
            ? q.items.map(item => ({
                description: item.description ?? "",
                quantity: item.quantity ?? 0,
                rate: item.rate ?? 0,
                amount: (item.quantity ?? 0) * (item.rate ?? 0)
              }))
            : [{ description: "", quantity: 1, rate: 0, amount: 0 }]
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quotation");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const handleUpdate = async () => {
    setError(null);
    const payload = {
      companyDetails,
      customerDetails,
      items,
      subTotal: totals.subTotal,
      tax: { percentage: Number(tax) || 0, amount: totals.taxAmount },
      discount: { amount: Number(discount) || 0 },
      grandTotal: totals.grandTotal
    };

    try {
      await updateQuotation(id, payload);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update quotation"
      );
    }
  };

  const handleFinalize = async () => {
    setError(null);
    try {
      await finalizeQuotation(id);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to finalize quotation"
      );
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
              Edit Quotation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {disabled
                ? "This quotation is finalized and cannot be edited."
                : "Update the details below and save or finalize."}
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

        {disabled && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This quotation is <strong>FINAL</strong> and cannot be edited.
          </div>
        )}

        <div className="space-y-6">
          {/* Company & Customer */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                        <input
                          type="text"
                          placeholder="Item description"
                          className={`${inputBase} border-slate-100 py-2`}
                          disabled={disabled}
                          value={item.description}
                          onChange={e =>
                            updateItem(i, "description", e.target.value)
                          }
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

          {/* Totals & actions */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                    {Number(totals.subTotal).toFixed(2)}
                  </span>
                </p>
                <p className="flex justify-between gap-8 text-lg font-semibold text-slate-800">
                  <span>Grand total</span>
                  <span className="tabular-nums">
                    {Number(totals.grandTotal).toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                >
                  Cancel
                </button>
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    Update quotation
                  </button>
                )}
                {status === "DRAFT" && (
                  <button
                    type="button"
                    onClick={handleFinalize}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Finalize quotation
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditQuotation;
