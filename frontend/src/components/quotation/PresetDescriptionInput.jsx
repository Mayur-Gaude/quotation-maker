import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback
} from "react";
import { createPortal } from "react-dom";
import Fuse from "fuse.js";

const MAX_SUGGESTIONS = 12;

/**
 * Description field with fuzzy-matched presets (name, unit, default rate).
 * Dropdown is portaled to avoid clipping inside scrollable tables.
 */
const PresetDescriptionInput = ({
  value,
  onChange,
  onSelectPreset,
  presets = [],
  disabled = false,
  inputClassName = ""
}) => {
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const fuse = useMemo(
    () =>
      new Fuse(presets, {
        keys: ["name", "unit"],
        threshold: 0.38,
        ignoreLocation: true
      }),
    [presets]
  );

  const trimmed = typeof value === "string" ? value.trim() : "";

  const suggestions = useMemo(() => {
    if (!presets.length) return [];
    if (!trimmed) return presets.slice(0, MAX_SUGGESTIONS);
    return fuse.search(trimmed).map(r => r.item).slice(0, MAX_SUGGESTIONS);
  }, [presets, trimmed, fuse]);

  const updateMenuPosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 220)
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, updateMenuPosition, value, suggestions.length]);

  useEffect(() => {
    setHighlighted(0);
  }, [trimmed, suggestions.length, open]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = e => {
      if (inputRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const pick = preset => {
    onSelectPreset(preset);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = e => {
    if (!open || !suggestions.length) {
      if (e.key === "ArrowDown" && presets.length && !disabled) {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const row = suggestions[highlighted];
      if (row) {
        e.preventDefault();
        pick(row);
      }
    }
  };

  const showMenu = open && suggestions.length > 0 && !disabled;

  const menu =
    showMenu &&
    createPortal(
      <ul
        ref={menuRef}
        role="listbox"
        className="z-[100] max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        style={{
          position: "fixed",
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width
        }}
      >
        {suggestions.map((row, idx) => (
          <li key={row._id || `${row.name}-${idx}`} role="option" aria-selected={idx === highlighted}>
            <button
              type="button"
              className={[
                "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition",
                idx === highlighted ? "bg-slate-100" : "hover:bg-slate-50"
              ].join(" ")}
              onMouseDown={e => {
                e.preventDefault();
                pick(row);
              }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <span className="font-medium text-slate-800">{row.name}</span>
              <span className="text-xs text-slate-500">
                {Number(row.defaultRate).toFixed(2)}
                {row.unit ? ` · ${row.unit}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>,
      document.body
    );

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        placeholder="Item description"
        disabled={disabled}
        className={inputClassName}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => {
          if (!disabled && presets.length) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showMenu}
      />
      {menu}
    </>
  );
};

export default PresetDescriptionInput;
