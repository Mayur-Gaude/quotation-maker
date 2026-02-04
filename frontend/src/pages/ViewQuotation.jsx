import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuotation,
  downloadPDF,
  downloadExcel
} from "../api/quotationApi";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await getQuotation(id);
        setQuotation(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const handleDownload = async type => {
    const response =
      type === "pdf" ? await downloadPDF(id) : await downloadExcel(id);

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${quotation.quotationNumber}.${type}`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-slate-600">Quotation not found.</p>
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
              Quotation {quotation.quotationNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Created {new Date(quotation.quotationDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDownload("pdf")}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => handleDownload("excel")}
              className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Download Excel
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Meta card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Quotation number
                </p>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {quotation.quotationNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </p>
                <p className="mt-0.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      quotation.status === "FINAL"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {quotation.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Date
                </p>
                <p className="mt-0.5 font-medium text-slate-800">
                  {new Date(quotation.quotationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </section>

          {/* Company & Customer */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Your company
              </h2>
              <p className="font-medium text-slate-800">
                {quotation.companyDetails?.name ?? "—"}
              </p>
              {quotation.companyDetails?.address && (
                <p className="mt-1 text-sm text-slate-600">
                  {quotation.companyDetails.address}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Customer
              </h2>
              <p className="font-medium text-slate-800">
                {quotation.customerDetails?.name ?? "—"}
              </p>
              {quotation.customerDetails?.address && (
                <p className="mt-1 text-sm text-slate-600">
                  {quotation.customerDetails.address}
                </p>
              )}
            </section>
          </div>

          {/* Line items */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Line items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </th>
                    <th className="w-20 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Qty
                    </th>
                    <th className="w-24 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rate
                    </th>
                    <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items?.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-slate-800">
                        {item.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                        {Number(item.rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {Number(item.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Totals */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Totals
            </h2>
            <div className="ml-auto max-w-xs space-y-2 text-right">
              <p className="flex justify-between gap-4 text-slate-600">
                <span>Sub total</span>
                <span className="tabular-nums">
                  {Number(quotation.subTotal).toFixed(2)}
                </span>
              </p>
              {quotation.tax?.amount != null && quotation.tax.amount !== 0 && (
                <p className="flex justify-between gap-4 text-slate-600">
                  <span>Tax</span>
                  <span className="tabular-nums">
                    {Number(quotation.tax.amount).toFixed(2)}
                  </span>
                </p>
              )}
              {quotation.discount?.amount != null &&
                quotation.discount.amount !== 0 && (
                  <p className="flex justify-between gap-4 text-slate-600">
                    <span>Discount</span>
                    <span className="tabular-nums">
                      -{Number(quotation.discount.amount).toFixed(2)}
                    </span>
                  </p>
                )}
              <p className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-lg font-semibold text-slate-800">
                <span>Grand total</span>
                <span className="tabular-nums">
                  {Number(quotation.grandTotal).toFixed(2)}
                </span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
