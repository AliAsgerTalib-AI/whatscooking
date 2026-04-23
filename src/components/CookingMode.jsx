import { useState, useEffect, useRef, useCallback } from "react";
import { parseStepTime } from "../utils/parseStepTime.js";

export function CookingMode({ steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [secondsLeft, setSecondsLeft]   = useState(null);
  const [running, setRunning]           = useState(false);
  const [editing, setEditing]           = useState(false);
  const [editVal, setEditVal]           = useState("");
  const [done, setDone]                 = useState(false);
  const intervalRef = useRef(null);

  const accent = "#f3722c";

  const loadStep = useCallback((idx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setEditing(false);
    setSecondsLeft(parseStepTime(steps[idx]));
  }, [steps]);

  // Load step 0 on mount; clean up interval on unmount
  useEffect(() => {
    loadStep(0);
    return () => clearInterval(intervalRef.current);
  }, [loadStep]);

  // Countdown tick
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          playBell();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (_) { /* silently ignore if AudioContext unavailable */ }
  }

  function fmt(s) {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }

  function commitEdit() {
    let total;
    if (editVal.includes(":")) {
      const parts = editVal.split(":").map(n => parseInt(n, 10) || 0);
      total = parts[0] * 60 + (parts[1] || 0);
    } else {
      total = parseInt(editVal, 10) || 0;
    }
    setSecondsLeft(Math.max(0, total));
    setEditing(false);
  }

  function goNext() {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      loadStep(next);
    } else {
      setDone(true);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      loadStep(prev);
    }
  }

  if (done) {
    return (
      <div style={overlay}>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8 text-center">
          <div className="text-6xl">🎉</div>
          <div className="text-2xl font-bold text-white">All done!</div>
          <div className="text-slate-400 text-sm">Enjoy your meal.</div>
          <button
            onClick={onClose}
            style={{ background: "#22c55e", ...pillBtn }}
          >Back to Recipe</button>
        </div>
      </div>
    );
  }

  const isZero = secondsLeft === 0;

  return (
    <div style={overlay}>

      {/* Top bar: progress + close */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <span className="text-[0.65rem] font-semibold tracking-widest uppercase text-slate-400 shrink-0">
          Step {currentStep + 1} of {steps.length}
        </span>
        <div className="flex flex-1 gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full transition-colors duration-300"
              style={{ background: i <= currentStep ? accent : "#333" }}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 transition-colors text-lg shrink-0 bg-transparent border-none cursor-pointer font-[inherit] leading-none"
        >✕</button>
      </div>

      {/* Step text */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 overflow-y-auto">
        <p className="text-xl leading-relaxed text-slate-100 max-w-lg text-center">
          {steps[currentStep]}
        </p>

        {/* Timer */}
        {secondsLeft !== null && (
          <div className="flex flex-col items-center gap-4 mt-10">
            {editing ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => e.key === "Enter" && commitEdit()}
                placeholder="MM:SS"
                className="bg-white/10 border border-white/20 rounded-xl text-white text-5xl font-mono text-center w-40 px-3 py-1 outline-none"
              />
            ) : (
              <button
                onClick={() => { setEditVal(fmt(secondsLeft)); setEditing(true); setRunning(false); }}
                className="bg-transparent border-none cursor-pointer font-mono text-6xl font-bold tracking-wider transition-colors"
                style={{ color: isZero ? "#ef4444" : "#fff" }}
                title="Tap to edit"
              >{fmt(secondsLeft)}</button>
            )}
            <button
              onClick={() => setRunning(r => !r)}
              style={{ background: running ? "#333" : accent, ...pillBtn, minWidth: "120px" }}
            >{running ? "⏸ Pause" : "▶ Start"}</button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex gap-3 px-5 py-4 border-t border-white/10">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          style={{ background: "#222", ...pillBtn, flex: 1, opacity: currentStep === 0 ? 0.3 : 1 }}
        >← Prev</button>
        <button
          onClick={goNext}
          style={{ background: accent, ...pillBtn, flex: 2 }}
        >{currentStep === steps.length - 1 ? "Finish 🎉" : "Next Step →"}</button>
      </div>

    </div>
  );
}

const overlay = {
  position: "fixed", inset: 0, zIndex: 250,
  background: "#111",
  display: "flex", flexDirection: "column",
  fontFamily: "inherit",
};

const pillBtn = {
  border: "none", borderRadius: "14px",
  color: "#fff", padding: "0.9rem 1.5rem",
  fontSize: "0.875rem", fontWeight: "bold",
  cursor: "pointer", fontFamily: "inherit",
};
