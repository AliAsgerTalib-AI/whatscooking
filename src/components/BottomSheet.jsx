/**
 * BottomSheet — swipeable modal sheet for mobile filter panels.
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

export function BottomSheet({ open, onClose, title, color = "#f9c74f", children }) {
  const sheetRef   = useRef(null);
  const drag       = useRef({ on:false, startY:0, startT:0 });
  const tyRef      = useRef(100);
  const onCloseRef = useRef(onClose);
  const [ty, setTy]           = useState(100);
  const [visible, setVisible] = useState(false);
  // BP-10: unique title id for aria-labelledby
  const titleId = useId();

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (open) { setVisible(true); requestAnimationFrame(() => { tyRef.current = 0; setTy(0); }); }
    else { tyRef.current = 100; setTy(100); const t = setTimeout(() => setVisible(false), 380); return () => clearTimeout(t); }
  }, [open]);

  // BP-10: trap focus inside the sheet while open
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
      {/* BP-10: backdrop closes sheet on click */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-[200] backdrop-blur-sm transition-[background] duration-[350ms]"
        style={{ background: `rgba(0,0,0,${Math.max(0, 0.6 - ty * 0.008)})` }}
      />
      {/* BP-10: role=dialog, aria-modal, aria-labelledby */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed left-0 right-0 bottom-0 z-[201] bg-sheet rounded-t-[20px] max-h-[88vh] flex flex-col touch-none shadow-[0_-8px_40px_rgba(0,0,0,0.6)]"
        style={{
          borderTop: `2px solid ${color}55`,
          transform: `translateY(${ty}%)`,
          transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div
          onMouseDown={onStart}
          onTouchStart={onStart}
          className="pt-3 pb-2 cursor-grab shrink-0 select-none"
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between px-6 pb-4 shrink-0">
          <div id={titleId} className="text-[1.1rem] font-extrabold">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="w-8 h-8 rounded-full bg-white/[0.08] border-none text-white/60 text-base cursor-pointer flex items-center justify-center font-[inherit]"
          >✕</button>
        </div>
        <div className="overflow-y-auto px-6 pb-8 flex-1" style={{ WebkitOverflowScrolling: "touch" }}>{children}</div>
      </div>
    </>
  );
}
