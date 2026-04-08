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
        style={{ position:"fixed", inset:0, zIndex:200, background:`rgba(0,0,0,${Math.max(0, 0.6 - ty * 0.008)})`, backdropFilter:"blur(2px)", transition:"background 0.35s" }}
      />
      {/* BP-10: role=dialog, aria-modal, aria-labelledby */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:201, background:"linear-gradient(180deg,#1a1730,#141128)", borderTop:`2px solid ${color}55`, borderRadius:"20px 20px 0 0", maxHeight:"88vh", display:"flex", flexDirection:"column", transform:`translateY(${ty}%)`, transition:"transform 0.38s cubic-bezier(0.32,0.72,0,1)", boxShadow:"0 -8px 40px rgba(0,0,0,0.6)", touchAction:"none" }}
      >
        <div onMouseDown={onStart} onTouchStart={onStart} style={{ padding:"12px 0 8px", cursor:"grab", flexShrink:0, userSelect:"none" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)", margin:"0 auto" }} aria-hidden="true" />
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1.5rem 1rem", flexShrink:0 }}>
          <div id={titleId} style={{ fontSize:"1.1rem", fontWeight:800 }}>{title}</div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.6)", fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}
          >✕</button>
        </div>
        <div style={{ overflowY:"auto", padding:"0 1.5rem 2rem", flex:1, WebkitOverflowScrolling:"touch" }}>{children}</div>
      </div>
    </>
  );
}
