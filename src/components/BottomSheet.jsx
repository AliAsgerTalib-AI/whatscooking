/**
 * BottomSheet — swipeable modal sheet for mobile filter panels.
 * color prop retained in API but ignored — sheet always uses primary border.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   title: string,
 *   color?: string,
 *   children: React.ReactNode
 * }} props
 */
import { useState, useRef, useEffect, useCallback, useId } from "react";

export function BottomSheet({ open, onClose, title, children }) {
  const sheetRef   = useRef(null);
  const drag       = useRef({ on:false, startY:0, startT:0 });
  const tyRef      = useRef(100);
  const onCloseRef = useRef(onClose);
  const [ty, setTy]           = useState(100);
  const [visible, setVisible] = useState(false);
  const titleId = useId();

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (open) { setVisible(true); requestAnimationFrame(() => { tyRef.current = 0; setTy(0); }); }
    else { tyRef.current = 100; setTy(100); const t = setTimeout(() => setVisible(false), 380); return () => clearTimeout(t); }
  }, [open]);

  useEffect(() => {
    if (!open || !sheetRef.current) return;
    const focusable = sheetRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) /** @type {HTMLElement} */ (focusable[0]).focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") { onCloseRef.current(); return; }
      if (e.key !== "Tab" || !focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); /** @type {HTMLElement} */ (last).focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); /** @type {HTMLElement} */ (first).focus(); } }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const getY = e => e.touches ? e.touches[0].clientY : e.clientY;

  const onStart = useCallback(e => {
    drag.current = { on:true, startY:getY(e), startT:tyRef.current };
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  }, []);

  const onMove = useCallback(e => {
    if (!drag.current.on) return;
    const next = Math.max(0, drag.current.startT + ((getY(e) - drag.current.startY) / window.innerHeight) * 100);
    tyRef.current = next;
    setTy(next);
  }, []);

  const onEnd = useCallback(() => {
    if (!drag.current.on) return;
    drag.current.on = false;
    if (sheetRef.current) sheetRef.current.style.transition = "";
    tyRef.current > 35 ? onCloseRef.current() : (tyRef.current = 0, setTy(0));
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive:true });
    window.addEventListener("touchend",  onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
  }, [onMove, onEnd]);

  if (!visible) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[200] transition-[background] duration-100 ease-linear"
        style={{ background: `rgba(0,0,0,${Math.max(0, 0.4 - ty * 0.005)})` }}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed left-0 right-0 bottom-0 z-[201] bg-surface border-t-2 border-primary max-h-[88vh] flex flex-col touch-none"
        style={{
          transform:  `translateY(${ty}%)`,
          transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div onMouseDown={onStart} onTouchStart={onStart} className="pt-3 pb-2 cursor-grab shrink-0 select-none">
          <div className="w-8 h-[2px] bg-primary mx-auto" aria-hidden="true" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3 border-b border-primary shrink-0">
          <div id={titleId} className="text-label-md uppercase tracking-label font-bold">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="border border-primary w-7 h-7 flex items-center justify-center text-body-md cursor-pointer font-[inherit] bg-surface hover:bg-primary hover:text-on-primary transition-colors duration-100 ease-linear"
          >✕</button>
        </div>
        <div className="overflow-y-auto px-6 py-4 flex-1" style={{ WebkitOverflowScrolling: "touch" }}>{children}</div>
      </div>
    </>
  );
}
