import React, { use } from "react";
import { useEffect, useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import {
  getQuotations,
  deleteQuotation,
  downloadPDF,
  downloadExcel
} from "../api/quotationApi";

const QuotationList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 5;

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await getQuotations({ page, limit, search, status });
      // setQuotations(res.data.data);
      // setTotal(res.data.total);
      setQuotations(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotal(typeof res.data?.total === "number" ? res.data.total : 0);
    }catch (err) {
    console.error("Failed to fetch quotations:", err);
    setQuotations([]);
    setTotal(0);
    }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleDownload = async (id, type) => {
    const response =
      type === "pdf" ? await downloadPDF(id) : await downloadExcel(id);

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `quotation.${type}`;
    link.click();
  };

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quotation?"
    );
    if (!confirmDelete) return;

    try {
      await deleteQuotation(id);
      setQuotations(prev => prev.filter(q => q._id !== id));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Quotations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your quotations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <span aria-hidden>+</span> Create quotation
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label htmlFor="search" className="sr-only">
            Search quotations
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search by quotation number, company or customer..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
            </div>
          ) : quotations?.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500">No quotations found.</p>
              <button
                type="button"
                onClick={() => navigate("/create")}
                className="mt-3 text-sm font-medium text-slate-600 underline hover:text-slate-800"
              >
                Create your first quotation
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Quotation No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map(q => (
                      <tr
                        key={q._id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {q.quotationNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {q.companyDetails?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {q.customerDetails?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                          {Number(q.grandTotal ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              q.status === "FINAL"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/view/${q._id}`)}
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              disabled={q.status === "FINAL"}
                              onClick={() => navigate(`/edit/${q._id}`)}
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(q._id, "pdf")}
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(q._id, "excel")}
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-violet-600 transition hover:bg-violet-50"
                            >
                              Excel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(q._id)}
                              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
                <p className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                  {total > 0 && (
                    <span className="ml-1">
                      ({total} quotation{total !== 1 ? "s" : ""})
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuotationList;
