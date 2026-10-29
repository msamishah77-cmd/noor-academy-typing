import { useEffect, useMemo, useRef, useState } from "react";
import { calculateStats, formatTime, getBaseKey, getFinger, needsShift } from "./utils.js";
import { keyboardRows } from "./data.js";

function VirtualKeyboard({ expected, pressedKey }) {
  const activeKey = expected === " " ? "space" : getBaseKey(expected);
  const shiftRequired = needsShift(expected);
  const leftHandKeys = "`12345qwertasdfgzxcvb";
  const rightHandKeys = "67890-=yuiop[]\\;'/hnm,.";
  return (
    <div className="keyboard-wrap" aria-label="US QWERTY virtual keyboard">
      {keyboardRows.map((row, rowIndex) => (
        <div className="key-row" key={rowIndex}>
          {row.map((key, index) => (
            <span
              className={`key ${["Backspace", "Tab", "Caps", "Enter", "Shift", "Ctrl", "Alt", "Space"].includes(key) ? "key-wide" : ""} ${leftHandKeys.includes(key.toLowerCase()) ? "key-left" : ""} ${rightHandKeys.includes(key.toLowerCase()) ? "key-right" : ""} ${key.toLowerCase() === activeKey || (shiftRequired && key === "Shift") ? "key-active" : ""} ${pressedKey && key.toLowerCase() === pressedKey.toLowerCase() ? "key-pressed" : ""} ${"asdfjkl;".includes(key.toLowerCase()) && key.length === 1 ? "key-home" : ""}`}
              key={`${key}-${index}`}
            >
              {key === "Space" ? " " : key}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TypingPractice({ exercise, durationMinutes, onComplete, onExit, onNext }) {
  const [typed, setTyped] = useState("");
  const [correctEntries, setCorrectEntries] = useState(0);
  const [incorrectEntries, setIncorrectEntries] = useState(0);
  const [status, setStatus] = useState("ready");
  const [elapsed, setElapsed] = useState(0);
  const [pressedKey, setPressedKey] = useState("");
  const inputRef = useRef(null);
  const startedAtRef = useRef(null);
  const target = exercise.text;
  const expected = target[typed.length];
  const stats = useMemo(() => calculateStats(correctEntries, incorrectEntries, elapsed), [correctEntries, incorrectEntries, elapsed]);
  const isTimed = Number.isFinite(durationMinutes);

  useEffect(() => {
    if (status !== "running") return undefined;
    const intervalId = window.setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsed(seconds);
      if (isTimed && seconds >= durationMinutes * 60) setStatus("complete");
    }, 250);
    return () => window.clearInterval(intervalId);
  }, [status, durationMinutes, isTimed]);

  useEffect(() => {
    if (typed === target && status === "running") setStatus("complete");
  }, [typed, target, status]);

  useEffect(() => {
    if (status === "complete") {
      onComplete({ ...stats, duration: elapsed, text: exercise.title });
    }
  }, [status]);

  useEffect(() => {
    if (status === "running") {
      const guardNavigation = (event) => {
        if ((event.altKey && ["ArrowLeft", "ArrowRight"].includes(event.key)) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r") || event.key === "F5") {
          event.preventDefault();
        }
      };
      window.addEventListener("keydown", guardNavigation, true);
      return () => window.removeEventListener("keydown", guardNavigation, true);
    }
    return undefined;
  }, [status]);

  function start() {
    startedAtRef.current = Date.now() - elapsed * 1000;
    setStatus("running");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function restart() {
    setTyped("");
    setCorrectEntries(0);
    setIncorrectEntries(0);
    setElapsed(0);
    startedAtRef.current = null;
    setStatus("ready");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(event) {
    if (event.key === "Shift") setPressedKey("Shift");
    if (status !== "running") {
      if (event.key === "Enter" || event.key === " ") start();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.key === "Tab") {
      if (event.key === "Tab") event.preventDefault();
      return;
    }
    if (event.key === "Backspace") {
      setPressedKey("Backspace");
      event.preventDefault();
      setTyped((value) => value.slice(0, -1));
      return;
    }
    if (event.key.length === 1) {
      setPressedKey(event.key);
      event.preventDefault();
      const expectedChar = target[typed.length];
      if (event.key === expectedChar) setCorrectEntries((count) => count + 1);
      else setIncorrectEntries((count) => count + 1);
      setTyped((value) => value + event.key);
    }
  }

  function handlePaste(event) {
    if (isTimed) event.preventDefault();
  }

  function handleKeyUp() {
    setPressedKey("");
  }

  function requestExit() {
    if ((status === "running" || status === "paused") && typed.length && !window.confirm("Leave this exercise? Your current attempt will not be saved.")) return;
    onExit();
  }

  const remaining = isTimed ? Math.max(0, durationMinutes * 60 - elapsed) : null;

  return (
    <section className="practice-panel">
      <div className="practice-heading">
        <div>
          <p className="eyebrow">{exercise.category ? `${exercise.category.toUpperCase()} LESSON · ${exercise.code}` : "TYPING TEST"}</p>
          <h2>{exercise.title}</h2>
          <p className="muted">{exercise.instructions}</p>
          {exercise.category && <p className="lesson-key-guide"><b>Key group:</b> {exercise.targetKeys} {exercise.fingerGroup && <>· <b>Finger guide:</b> {exercise.fingerGroup}</>}</p>}
        </div>
        <button className="icon-button" onClick={requestExit} aria-label="Close practice">✕</button>
      </div>
      <div className="live-stats">
        <div><span>{isTimed ? "Remaining" : "Time"}</span><strong>{isTimed ? formatTime(remaining) : formatTime(elapsed)}</strong></div>
        <div><span>Gross WPM</span><strong>{stats.grossWpm}</strong></div>
        <div><span>Net WPM</span><strong>{stats.netWpm}</strong></div>
        <div><span>Accuracy</span><strong>{stats.accuracy}%</strong></div>
        <div><span>Correct</span><strong>{correctEntries}</strong></div>
        <div><span>Errors</span><strong>{incorrectEntries}</strong></div>
      </div>
      {status === "complete" ? (
        <div className="completion-box">
          <div className="completion-mark">✓</div>
          <h3>{isTimed && remaining === 0 ? "Test complete!" : "Nicely done!"}</h3>
          <p>{stats.netWpm} net WPM · {stats.grossWpm} gross WPM · {stats.accuracy}% accuracy · {correctEntries} correct · {incorrectEntries} incorrect · {formatTime(elapsed)}</p>
          <div className="completion-actions">
            <button className="button button-primary" onClick={restart}>Try again</button>
            <button className="button button-secondary" onClick={onNext}>{isTimed ? "Try another passage" : "Next Lesson"} →</button>
            <button className="button button-secondary" onClick={onExit}>{isTimed ? "Back to tests" : "Back to lessons"}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="prompt-box" aria-label="Typing passage">
            {target.split("").map((character, index) => {
              const isTyped = index < typed.length;
              const correct = isTyped && typed[index] === character;
              return <span className={`${isTyped ? (correct ? "char-correct" : "char-wrong") : ""} ${index === typed.length ? "char-current" : ""}`} key={index}>{character}</span>;
            })}
          </div>
          <div className="type-row">
            <label className="sr-only" htmlFor="typing-input">Type the passage shown above</label>
            <textarea
              id="typing-input"
              ref={inputRef}
              className="typing-input"
              value={typed}
              onChange={() => {}}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onPaste={handlePaste}
              onContextMenu={isTimed ? (event) => event.preventDefault() : undefined}
              readOnly
              spellCheck="false"
              autoCapitalize="off"
              placeholder="Select Start, then type here..."
              aria-describedby="typing-help"
            />
            <span id="typing-help" className="muted">Next key: <b className="next-key">{expected === " " ? "Space" : expected || "—"}</b> · {getFinger(expected || "")}</span>
          </div>
          <VirtualKeyboard expected={expected} pressedKey={pressedKey} />
          <div className="practice-footer">
            <span className="muted">{typed.length} / {target.length} characters · {stats.totalEntries} total entries · Backspace corrects the current line</span>
            <div className="button-row">
              {status === "ready" && <button className="button button-primary" onClick={start}>Start typing</button>}
              {status === "running" && <button className="button button-secondary" onClick={() => setStatus("paused")}>Pause</button>}
              {status === "paused" && <button className="button button-primary" onClick={start}>Continue</button>}
              <button className="button button-secondary" onClick={restart}>Restart</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
