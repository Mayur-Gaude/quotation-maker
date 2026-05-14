import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getQuotations,
  getDashboardStats,
  deleteQuotation,
  downloadPDF,
  downloadExcel
} from "../api/quotationApi";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Alert from "../components/common/Alert";
import Spinner from "../components/common/Spinner";
import { useToast } from "../context/ToastContext";
import { usePreferences } from "../context/PreferencesContext";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DownloadIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "../components/common/Icons";

const QuotationList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const toast = useToast();
  const { formatMoney, currencySymbol } = usePreferences();

  const [quotations, setQuotations] = useState([]);
  const [dashboard, setDashboard] = useState({
    totalQuotes: 0,
    totalValue: 0,
    draftsPending: 0
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const limit = 10;

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardStats();
      const d = res.data?.data;
      if (d) {
        setDashboard({
          totalQuotes: d.totalQuotes ?? 0,
          totalValue: d.totalValue ?? 0,
          draftsPending: d.draftsPending ?? 0
        });
      }
    } catch {
      /* optional */
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    fetchDashboard();
    try {
      const res = await getQuotations({ page, limit, search, status });
      setQuotations(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotal(typeof res.data?.total === "number" ? res.data.total : 0);
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
      setError("Failed to load quotations. Please try again.");
      toast.error("Failed to load quotations");
      setQuotations([]);
      setTotal(0);
    } finally {
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

  const statusBadge = s => {
    if (s === "FINAL") return { variant: "success", label: "FINAL" };
    if (s === "SENT") return { variant: "info", label: "SENT" };
    return { variant: "neutral", label: s === "DRAFT" ? "DRAFT" : s || "—" };
  };

  const iconBtn =
    "inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40";

  const handleDownload = async (id, type, quotationNumber) => {
    setDownloadingId(`${id}-${type}`);
    try {
      const response =
        type === "pdf"
          ? await downloadPDF(id, currencySymbol)
          : await downloadExcel(id);

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${quotationNumber || "quotation"}.${type}`;
      link.click();
      
      toast.success(`${type.toUpperCase()} downloaded successfully`);
    } catch (err) {
      console.error(`Failed to download ${type}:`, err);
      toast.error(`Failed to download ${type.toUpperCase()}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async id => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quotation? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteQuotation(id);
      setQuotations(prev => prev.filter(q => q._id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      fetchDashboard();
      toast.success("Quotation deleted successfully");
    } catch (err) {
      console.error("Failed to delete quotation:", err);
      toast.error("Failed to delete quotation");
    }
  };

//   return (
//     <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-6xl">
//         {/* Header */}
//         <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//               Quotations
//             </h1>
//             <p className="mt-2 text-sm text-slate-600">
//               {status
//                 ? `Showing ${status.toLowerCase()} quotations`
//                 : "View and manage all your quotations"}
//             </p>
//           </div>
//           <Button
//             variant="primary"
//             onClick={() => navigate("/create")}
//             icon={<PlusIcon className="h-5 w-5" />}
//           >
//             Create Quotation
//           </Button>
//         </div>

//         {error && (
//           <Alert
//             variant="error"
//             className="mb-6"
//             onClose={() => setError(null)}
//           >
//             {error}
//           </Alert>
//         )}

//         {/* Search */}
//         <div className="mb-6">
//           <div className="relative">
//             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
//               <SearchIcon className="h-5 w-5 text-slate-400" />
//             </div>
//             <input
//               id="search"
//               type="search"
//               placeholder="Search by quotation number, company, or customer..."
//               className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Stats */}
//         {!loading && (
//           <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
//             <span className="font-medium">{total}</span>
//             <span>
//               {total === 1 ? "quotation" : "quotations"} found
//             </span>
//           </div>
//         )}

//         {/* Table card */}
//         <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           {loading ? (
//             <div className="flex items-center justify-center py-20">
//               <Spinner size="lg" />
//             </div>
//           ) : quotations?.length === 0 ? (
//             <div className="py-20 text-center">
//               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
//                 <PlusIcon className="h-8 w-8 text-slate-400" />
//               </div>
//               <h3 className="mb-1 text-lg font-semibold text-slate-900">
//                 No quotations found
//               </h3>
//               <p className="mb-4 text-sm text-slate-500">
//                 {search
//                   ? "Try adjusting your search terms"
//                   : "Get started by creating your first quotation"}
//               </p>
//               {!search && (
//                 <Button
//                   variant="primary"
//                   onClick={() => navigate("/create")}
//                   icon={<PlusIcon className="h-5 w-5" />}
//                 >
//                   Create Quotation
//                 </Button>
//               )}
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[640px] border-collapse">
//                   <thead>
//                     <tr className="border-b border-slate-200 bg-slate-50/80">
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                         Quotation No
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                         Company
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                         Customer
//                       </th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
//                         Total
//                       </th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {quotations.map(q => (
//                       <tr
//                         key={q._id}
//                         className="transition-colors hover:bg-slate-50/50"
//                       >
//                         <td className="px-6 py-4 font-semibold text-slate-900">
//                           {q.quotationNumber}
//                         </td>
//                         <td className="px-6 py-4 text-slate-700">
//                           {q.companyDetails?.name ?? "—"}
//                         </td>
//                         <td className="px-6 py-4 text-slate-700">
//                           {q.customerDetails?.name ?? "—"}
//                         </td>
//                         <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-900">
//                           ${Number(q.grandTotal ?? 0).toFixed(2)}
//                         </td>
//                         <td className="px-6 py-4">
//                           <Badge
//                             variant={
//                               q.status === "FINAL" ? "success" : "default"
//                             }
//                           >
//                             {q.status}
//                           </Badge>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center justify-end gap-2">
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => navigate(`/view/${q._id}`)}
//                               icon={<EyeIcon className="h-4 w-4" />}
//                             >
//                               View
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               disabled={q.status === "FINAL"}
//                               onClick={() => navigate(`/edit/${q._id}`)}
//                               icon={<PencilIcon className="h-4 w-4" />}
//                             >
//                               Edit
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() =>
//                                 handleDownload(q._id, "pdf", q.quotationNumber)
//                               }
//                               loading={downloadingId === `${q._id}-pdf`}
//                               disabled={downloadingId === `${q._id}-pdf`}
//                             >
//                               PDF
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() =>
//                                 handleDownload(q._id, "excel", q.quotationNumber)
//                               }
//                               loading={downloadingId === `${q._id}-excel`}
//                               disabled={downloadingId === `${q._id}-excel`}
//                             >
//                               Excel
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleDelete(q._id)}
//                               icon={
//                                 <TrashIcon className="h-4 w-4 text-red-500" />
//                               }
//                             />
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="border-t border-slate-200 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <p className="text-sm text-slate-600">
//                       Page {page} of {totalPages}
//                     </p>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         disabled={page === 1}
//                         onClick={() => setPage(p => Math.max(1, p - 1))}
//                         icon={<ChevronLeftIcon className="h-4 w-4" />}
//                       >
//                         Previous
//                       </Button>
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         disabled={page === totalPages}
//                         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                         icon={<ChevronRightIcon className="h-4 w-4" />}
//                       >
//                         Next
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// };

// export default QuotationList;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Quotations
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {status
                ? `Filtered: ${status.toLowerCase()}`
                : "Overview and list"}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/create")}
            icon={<PlusIcon className="h-5 w-5" />}
          >
            Create quotation
          </Button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total quotes
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {dashboard.totalQuotes}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Combined value
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {formatMoney(dashboard.totalValue)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Drafts pending
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-700">
              {dashboard.draftsPending}
            </p>
          </div>
        </div>

        {error && (
          <Alert
            variant="error"
            className="mb-6"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <div className="mb-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="search"
              type="search"
              placeholder="Search number, company, or customer…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {!loading && (
          <p className="mb-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{total}</span>{" "}
            {total === 1 ? "quotation" : "quotations"} in this view
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : quotations?.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <PlusIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-900">
                No quotations found
              </h3>
              <p className="mb-4 text-sm text-slate-500">
                {search
                  ? "Try adjusting your search terms"
                  : "Get started by creating your first quotation"}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  onClick={() => navigate("/create")}
                  icon={<PlusIcon className="h-5 w-5" />}
                >
                  Create Quotation
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90">
                      <th className="w-[11%] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        No.
                      </th>
                      <th className="w-[18%] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Company
                      </th>
                      <th className="w-[18%] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>
                      <th className="w-[12%] px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </th>
                      <th className="w-[11%] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="w-[30%] min-w-[11rem] px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotations.map(q => {
                      const sb = statusBadge(q.status);
                      return (
                        <tr
                          key={q._id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-3 py-2.5 font-semibold text-slate-900">
                            {q.quotationNumber}
                          </td>
                          <td className="px-3 py-2.5 truncate text-slate-700">
                            {q.companyDetails?.name ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 truncate text-slate-700">
                            {q.customerDetails?.name ?? "—"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium tabular-nums text-slate-900">
                            {formatMoney(q.grandTotal ?? 0)}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge variant={sb.variant}>{sb.label}</Badge>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <button
                                type="button"
                                className={iconBtn}
                                title="View"
                                onClick={() => navigate(`/view/${q._id}`)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className={iconBtn}
                                title="Edit"
                                disabled={q.status === "FINAL"}
                                onClick={() => navigate(`/edit/${q._id}`)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className={iconBtn}
                                title="Download PDF"
                                disabled={downloadingId === `${q._id}-pdf`}
                                onClick={() =>
                                  handleDownload(
                                    q._id,
                                    "pdf",
                                    q.quotationNumber
                                  )
                                }
                              >
                                <span className="text-[10px] font-bold leading-none text-slate-500">
                                  PDF
                                </span>
                              </button>
                              <button
                                type="button"
                                className={iconBtn}
                                title="Download Excel"
                                disabled={downloadingId === `${q._id}-excel`}
                                onClick={() =>
                                  handleDownload(
                                    q._id,
                                    "excel",
                                    q.quotationNumber
                                  )
                                }
                              >
                                <DownloadIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className={`${iconBtn} border-red-100 text-red-600 hover:border-red-200 hover:bg-red-50`}
                                title="Delete"
                                onClick={() => handleDelete(q._id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        icon={<ChevronLeftIcon className="h-4 w-4" />}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        icon={<ChevronRightIcon className="h-4 w-4" />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuotationList;