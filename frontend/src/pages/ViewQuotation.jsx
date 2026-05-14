import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getQuotation,
  downloadPDF,
  downloadExcel,
  duplicateQuotation
} from "../api/quotationApi";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { LoadingScreen } from "../components/common/Spinner";
import { useToast } from "../context/ToastContext";
import { usePreferences } from "../context/PreferencesContext";
import { ArrowLeftIcon, DownloadIcon, CopyIcon } from "../components/common/Icons";

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currencySymbol, formatMoney } = usePreferences();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await getQuotation(id);
        setQuotation(res.data.data);
      } catch (err) {
        toast.error("Failed to load quotation");
        console.error("Failed to fetch quotation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const handleDownload = async type => {
    if (type === "pdf") {
      setDownloadingPDF(true);
    } else {
      setDownloadingExcel(true);
    }

    try {
      const response =
        type === "pdf"
          ? await downloadPDF(id, currencySymbol)
          : await downloadExcel(id);

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${quotation.quotationNumber}.${type}`;
      link.click();

      toast.success(`${type.toUpperCase()} downloaded successfully`);
    } catch (err) {
      console.error(`Failed to download ${type}:`, err);
      toast.error(`Failed to download ${type.toUpperCase()}`);
    } finally {
      if (type === "pdf") {
        setDownloadingPDF(false);
      } else {
        setDownloadingExcel(false);
      }
    }
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const res = await duplicateQuotation(id);
      const newId = res.data?.data?._id;
      if (!newId) {
        toast.error("Duplicate failed: missing new quotation id");
        return;
      }
      toast.success("Draft created — you can edit the new quotation");
      navigate(`/edit/${newId}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to duplicate quotation";
      toast.error(msg);
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading quotation..." />;
  }

  if (!quotation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-slate-600">Quotation not found.</p>
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="mt-3"
          >
            Back to quotations
          </Button>
        </div>
      </div>
    );
  }

  const statusVariant =
    quotation.status === "FINAL"
      ? "success"
      : quotation.status === "SENT"
        ? "info"
        : "neutral";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              icon={<ArrowLeftIcon className="h-4 w-4" />}
              className="mb-2"
            >
              Back to quotations
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Quotation {quotation.quotationNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Created {new Date(quotation.quotationDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              onClick={handleClone}
              loading={cloning}
              disabled={
                cloning || downloadingPDF || downloadingExcel
              }
              icon={<CopyIcon className="h-4 w-4" />}
            >
              {cloning ? "Cloning…" : "Clone this quotation"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleDownload("pdf")}
              loading={downloadingPDF}
              disabled={downloadingPDF || downloadingExcel || cloning}
              icon={<DownloadIcon className="h-4 w-4" />}
            >
              {downloadingPDF ? "Downloading..." : "Download PDF"}
            </Button>
            <Button
              variant="success"
              onClick={() => handleDownload("excel")}
              loading={downloadingExcel}
              disabled={downloadingPDF || downloadingExcel || cloning}
              icon={<DownloadIcon className="h-4 w-4" />}
            >
              {downloadingExcel ? "Downloading..." : "Download Excel"}
            </Button>
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
                  <Badge variant={statusVariant}>{quotation.status}</Badge>
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
                        {formatMoney(item.rate)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {formatMoney(item.amount)}
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
                  {formatMoney(quotation.subTotal)}
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
                  {formatMoney(quotation.grandTotal)}
                </span>
              </p>
            </div>
          </section>

          {(quotation.notes?.trim() || quotation.termsAndConditions?.trim()) && (
            <div className="space-y-6">
              {quotation.notes?.trim() && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Notes
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {quotation.notes.trim()}
                  </p>
                </section>
              )}
              {quotation.termsAndConditions?.trim() && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Terms &amp; conditions
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {quotation.termsAndConditions.trim()}
                  </p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;
