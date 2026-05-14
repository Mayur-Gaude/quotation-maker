import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSqlItems,
  createSqlItem,
  deleteSqlItem
} from "../api/sqlItemsApi";
import Button from "../components/common/Button";
import { TrashIcon } from "../components/common/Icons";
import { useToast } from "../context/ToastContext";

const SavedItems = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [defaultRate, setDefaultRate] = useState("");
  const [unit, setUnit] = useState("");

  const load = async () => {
    try {
      const res = await getSqlItems();
      setRows(res.data?.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load saved items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    const rate = Number(defaultRate);
    if (!name.trim() || Number.isNaN(rate) || rate < 0) {
      toast.error("Enter a name and a valid default rate");
      return;
    }
    setSaving(true);
    try {
      await createSqlItem({
        name: name.trim(),
        defaultRate: rate,
        unit: unit.trim()
      });
      setName("");
      setDefaultRate("");
      setUnit("");
      toast.success("Saved item added");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Remove this saved item?")) return;
    try {
      await deleteSqlItem(id);
      toast.success("Removed");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const input =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";
  const label = "mb-1 block text-xs font-medium text-slate-600";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-2 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          ← Back to quotations
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Item library
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Presets appear when you type in a line item description on create or edit
          quotation. Rates fill in automatically when you pick one.
        </p>

        <form
          onSubmit={handleAdd}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-800">Add preset</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="preset-name">
                Name
              </label>
              <input
                id="preset-name"
                className={input}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Site visit — half day"
              />
            </div>
            <div>
              <label className={label} htmlFor="preset-rate">
                Default rate
              </label>
              <input
                id="preset-rate"
                type="number"
                min={0}
                step="0.01"
                className={input}
                value={defaultRate}
                onChange={e => setDefaultRate(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="sm:col-span-3">
              <label className={label} htmlFor="preset-unit">
                Unit (optional)
              </label>
              <input
                id="preset-unit"
                className={input}
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. hr, day, license"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              Save preset
            </Button>
          </div>
        </form>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Your presets</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500">No saved items yet. Add one above.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="w-14 px-2 py-3" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr
                      key={row._id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {Number(row.defaultRate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.unit || "—"}</td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(row._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${row.name}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SavedItems;
