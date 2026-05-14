import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { usePreferences, CURRENCIES } from "../context/PreferencesContext";
import { ArrowLeftIcon } from "../components/common/Icons";

const Settings = () => {
  const navigate = useNavigate();
  const { currencyCode, setCurrencyByCode } = usePreferences();

  const inputRow =
    "w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to quotations
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Preferences apply to this browser. PDF exports use the selected
          currency symbol.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Currency</h2>
          <p className="mt-1 text-sm text-slate-500">
            Shown on the dashboard and quotation list. PDFs include this symbol
            for amounts.
          </p>
          <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Display currency
          </label>
          <select
            className={`${inputRow} mt-2`}
            value={currencyCode}
            onChange={e => setCurrencyByCode(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </section>

        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate("/")}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
