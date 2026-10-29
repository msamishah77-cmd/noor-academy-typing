import { useEffect, useState } from "react";
import TypingPractice from "./TypingPractice.jsx";
import LessonPath from "./components/LessonPath.jsx";
import { keyboardRows, testPassages } from "./data.js";
import { getFirstIncompleteLesson, getNextLesson, isLessonLocked, lessonCategories, typingLessons } from "./data/typingLessons.js";
import { formatTime, getTodayKey, loadProgress, saveProgress } from "./utils.js";

const navigation = [
  ["Dashboard", "⌂"],
  ["Lessons", "▤"],
  ["Typing test", "◷"],
  ["My progress", "↗"],
  ["Teacher view", "▦"],
];

function App() {
  const [progress, setProgress] = useState(() => {
    const saved = loadProgress();
    const validIds = new Set(typingLessons.map((lesson) => lesson.id));
    const completedLessons = [...new Set(saved.completedLessons.filter((id) => validIds.has(id)))];
    return {
      ...saved,
      completedLessons,
      currentLessonId: validIds.has(saved.currentLessonId) ? saved.currentLessonId : getFirstIncompleteLesson(completedLessons).id,
      lessonResults: Object.fromEntries(
        Object.entries(saved.lessonResults).filter(([id, result]) => validIds.has(id) && result && typeof result === "object"),
      ),
    };
  });
  const [page, setPage] = useState("Dashboard");
  const [activeExercise, setActiveExercise] = useState(null);
  const [theme, setTheme] = useState("light");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [testDuration, setTestDuration] = useState(1);
  const [passageIndex, setPassageIndex] = useState(() => Math.floor(Math.random() * testPassages.Beginner.length));

  useEffect(() => saveProgress(progress), [progress]);

  const currentLesson = typingLessons.find((lesson) => lesson.id === progress.currentLessonId) || getFirstIncompleteLesson(progress.completedLessons);
  const nextLesson = getFirstIncompleteLesson(progress.completedLessons);
  const passage = testPassages[difficulty][passageIndex % testPassages[difficulty].length];
  const percentComplete = Math.round((progress.completedLessons.length / typingLessons.length) * 100);

  function beginLesson(lesson) {
    if (progress.sequentialUnlocking && !progress.completedLessons.includes(lesson.id) && isLessonLocked(lesson, progress.completedLessons)) return;
    setProgress((current) => ({ ...current, currentLessonId: lesson.id }));
    setActiveExercise({ ...lesson, text: lesson.practiceTexts[0] });
  }

  function finishExercise(result) {
    setProgress((current) => {
      const isLesson = Boolean(activeExercise?.category);
      const completedLessons = isLesson && !current.completedLessons.includes(activeExercise.id)
        ? [...current.completedLessons, activeExercise.id]
        : current.completedLessons;
      const tests = isLesson ? current.tests : [{ ...result, date: new Date().toISOString() }, ...current.tests].slice(0, 10);
      const previousResult = isLesson ? current.lessonResults[activeExercise.id] : null;
      const lessonResults = isLesson
        ? {
          ...current.lessonResults,
          [activeExercise.id]: {
            bestWpm: Math.max(previousResult?.bestWpm || 0, result.netWpm),
            bestAccuracy: Math.max(previousResult?.bestAccuracy || 0, result.accuracy),
            attempts: (previousResult?.attempts || 0) + 1,
          },
        }
        : current.lessonResults;
      const currentLessonId = isLesson
        ? getNextLesson(activeExercise, completedLessons)?.id || getFirstIncompleteLesson(completedLessons).id
        : current.currentLessonId;
      return {
        ...current,
        completedLessons,
        currentLessonId,
        lessonResults,
        bestWpm: Math.max(current.bestWpm, result.netWpm),
        bestAccuracy: Math.max(current.bestAccuracy, result.accuracy),
        practiceSeconds: current.practiceSeconds + result.elapsedSeconds,
        practiceDate: getTodayKey(),
        dailyPracticeSeconds: (current.practiceDate === getTodayKey() ? current.dailyPracticeSeconds : 0) + result.elapsedSeconds,
        tests,
      };
    });
  }

  function startTest() {
    setActiveExercise({ title: `${testDuration}-minute ${difficulty.toLowerCase()} test`, instructions: "Type the passage exactly as shown. Pasting is disabled during timed tests.", text: passage });
  }

  function nextExercise() {
    if (activeExercise?.category) {
      const next = getNextLesson(activeExercise, progress.completedLessons);
      if (next) {
        beginLesson(next);
        return;
      }
      setActiveExercise(null);
      setPage("Lessons");
      return;
    }
    const nextIndex = (passageIndex + 1) % testPassages[difficulty].length;
    setPassageIndex(nextIndex);
    setActiveExercise({ ...activeExercise, text: testPassages[difficulty][nextIndex] });
  }

  function resetProgress() {
    if (window.confirm("Reset all lessons, typing records, and practice time on this computer? This cannot be undone.")) {
      setProgress({ completedLessons: [], currentLessonId: "classic-01", bestWpm: 0, bestAccuracy: 0, practiceSeconds: 0, practiceDate: getTodayKey(), dailyPracticeSeconds: 0, lessonResults: {}, sequentialUnlocking: false, tests: [] });
    }
  }

  function navigate(label) {
    if (activeExercise && !window.confirm("Leave this exercise? Your current attempt will not be saved.")) return;
    setActiveExercise(null);
    setPage(label);
  }

  function downloadResults() {
    const rows = [["Date", "Passage", "Net WPM", "Gross WPM", "Accuracy", "Errors", "Duration"]];
    progress.tests.forEach((test) => rows.push([
      new Date(test.date).toLocaleString(),
      test.text,
      test.netWpm,
      test.grossWpm,
      `${test.accuracy}%`,
      test.incorrectEntries,
      `${test.elapsedSeconds}s`,
    ]));
    const csv = rows.map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "noor-academy-typing-results.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-card">
          <div className="welcome-copy">
            <span className="welcome-kicker">NOOR ACADEMY LARKANA</span>
            <h2>Every keystroke brings you closer.</h2>
            <p>Learn touch typing one comfortable step at a time.</p>
            <div className="button-row">
              <button className="button button-white" onClick={() => beginLesson(nextLesson)}>▶ &nbsp;Start learning</button>
              <button className="button button-glass" onClick={() => beginLesson(currentLesson)}>Continue lesson</button>
            </div>
          </div>
          <div className="welcome-art" aria-hidden="true"><div className="art-key">A</div><div className="art-key">S</div><div className="art-key">D</div><div className="art-key">F</div><div className="art-spark">✦</div></div>
        </section>
        <section className="metric-grid">
          <Metric label="Lessons completed" value={`${progress.completedLessons.length} / ${typingLessons.length}`} icon="✓" />
          <Metric label="Best typing speed" value={`${progress.bestWpm} WPM`} icon="↗" />
          <Metric label="Best accuracy" value={`${progress.bestAccuracy}%`} icon="◎" />
          <Metric label="Practice time" value={`${Math.floor(progress.practiceSeconds / 60)} min`} icon="◷" />
        </section>
        <div className="content-grid">
          <section className="card progress-overview">
            <div className="section-heading"><div><p className="eyebrow">YOUR JOURNEY</p><h3>Learning progress</h3></div><button className="text-button" onClick={() => setPage("My progress")}>View progress →</button></div>
            <div className="progress-label"><span>{percentComplete}% complete</span><span>{progress.completedLessons.length} of {typingLessons.length} lessons</span></div>
            <div className="progress-track"><div style={{ width: `${percentComplete}%` }} /></div>
            <div className="level-strip">{lessonCategories.map((path) => {
              const complete = path.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
              return <button key={path.name} className="level-tile" onClick={() => setPage("Lessons")}><span className="level-number">{path.name.toUpperCase()}</span><b>{path.name} Lessons</b><span>{complete} / {path.lessons.length} complete</span></button>;
            })}</div>
          </section>
          <section className="card next-card">
            <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h3>{nextLesson.code} — {nextLesson.title}</h3><p className="muted">{nextLesson.category} Lessons</p>
            <button className="button button-primary full-button" onClick={() => beginLesson(nextLesson)}>Continue learning <span>→</span></button>
          </section>
        </div>
        <section className="card recent-card">
          <div className="section-heading"><div><p className="eyebrow">KEEP IT UP</p><h3>Recent typing tests</h3></div><button className="text-button" onClick={() => setPage("Typing test")}>Take a test →</button></div>
          {progress.tests.length ? <TestRows tests={progress.tests.slice(0, 3)} /> : <p className="empty-note">Your test results will appear here after your first typing test.</p>}
        </section>
      </>
    );
  }

  function renderLessons() {
    return (
      <div className="page-stack">
        <PageIntro eyebrow="YOUR LEARNING PATH" title="Typing lessons" text="Choose a lesson and practice each key group with focused exercises." />
        {lessonCategories.map((path) => (
          <LessonPath
            key={path.name}
            path={path}
            completedLessons={progress.completedLessons}
            currentLessonId={progress.currentLessonId}
            lessonResults={progress.lessonResults}
            sequentialUnlocking={progress.sequentialUnlocking}
            onStart={beginLesson}
          />
        ))}
      </div>
    );
  }

  function renderTest() {
    return <div className="page-stack">
      <PageIntro eyebrow="CHALLENGE YOURSELF" title="Typing test" text="Choose a time and difficulty, then type a fresh passage. Results are saved on this computer." />
      <div className="test-settings card">
        <label>Test duration<select value={testDuration} onChange={(event) => setTestDuration(Number(event.target.value))}>{[1, 2, 3, 5].map((duration) => <option value={duration} key={duration}>{duration} minute{duration > 1 ? "s" : ""}</option>)}</select></label>
        <label>Difficulty<select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setPassageIndex(Math.floor(Math.random() * testPassages[event.target.value].length)); }}>{Object.keys(testPassages).map((name) => <option key={name}>{name}</option>)}</select></label>
        <button className="button button-primary" onClick={startTest}>Start typing test <span>→</span></button>
      </div>
      <section className="card passage-card"><div className="section-heading"><div><p className="eyebrow">PASSAGE PREVIEW</p><h3>{difficulty} practice</h3></div><button className="text-button" onClick={() => setPassageIndex((index) => index + 1)}>Choose another passage ↻</button></div><p>{passage}</p></section>
      <section className="card recent-card"><div className="section-heading"><div><p className="eyebrow">YOUR PRACTICE</p><h3>Recent results</h3></div></div>
        {progress.tests.length ? <TestRows tests={progress.tests} /> : <p className="empty-note">Finish a test to see your WPM, accuracy, and history here.</p>}
      </section>
    </div>;
  }

  function renderProgress() {
    return <div className="page-stack">
      <PageIntro eyebrow="YOUR ACHIEVEMENTS" title="My progress" text="Your practice record is stored in this browser on this computer." />
      <section className="metric-grid progress-metrics"><Metric label="Lessons completed" value={progress.completedLessons.length} icon="✓" /><Metric label="Best net speed" value={`${progress.bestWpm} WPM`} icon="↗" /><Metric label="Best accuracy" value={`${progress.bestAccuracy}%`} icon="◎" /><Metric label="Time practiced" value={formatTime(progress.practiceSeconds)} icon="◷" /></section>
      {lessonCategories.map((path) => <section className="card recent-card" key={path.name}><div className="section-heading"><div><p className="eyebrow">{path.name.toUpperCase()} PATH</p><h3>{path.name} lesson checklist</h3></div><span className="muted">{path.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length}/{path.lessons.length}</span></div>
        <div className="checklist">{path.lessons.map((lesson) => <div className="check-row" key={lesson.id}><span className={progress.completedLessons.includes(lesson.id) ? "check-dot checked" : "check-dot"}>{progress.completedLessons.includes(lesson.id) ? "✓" : ""}</span><span>{lesson.code}: {lesson.title}</span><span className="muted">{progress.completedLessons.includes(lesson.id) ? `${progress.lessonResults[lesson.id]?.bestWpm || 0} WPM` : "Not started"}</span></div>)}</div>
      </section>
      )}
      <div className="danger-zone"><div><b>Start over?</b><p>This removes saved lesson progress and test results from this browser.</p></div><button className="button button-danger" onClick={resetProgress}>Reset my progress</button></div>
    </div>;
  }

  function renderTeacher() {
    return <div className="page-stack">
      <PageIntro eyebrow="LOCAL TEACHER VIEW" title="Practice overview" text="A simple summary of records saved on this computer." />
      <div className="notice"><b>Local data only</b><span>These records belong to this browser. They are not shared across lab computers or linked to student accounts.</span></div>
      <section className="card unlock-settings"><div><b>Sequential lesson unlocking</b><p>When enabled, each lesson in its path unlocks after the previous lesson is completed.</p></div><label className="toggle-label"><input type="checkbox" checked={progress.sequentialUnlocking} onChange={(event) => setProgress((current) => ({ ...current, sequentialUnlocking: event.target.checked }))} /><span>{progress.sequentialUnlocking ? "On" : "Off"}</span></label></section>
      <section className="metric-grid"><Metric label="Lessons completed" value={`${progress.completedLessons.length} / ${typingLessons.length}`} icon="✓" /><Metric label="Best net speed" value={`${progress.bestWpm} WPM`} icon="↗" /><Metric label="Best accuracy" value={`${progress.bestAccuracy}%`} icon="◎" /><Metric label="Tests recorded" value={progress.tests.length} icon="▤" /></section>
      <section className="card recent-card"><div className="section-heading"><div><p className="eyebrow">LOCAL TEST HISTORY</p><h3>Typing test records</h3></div><button className="button button-secondary" onClick={downloadResults}>Download CSV</button></div>
        {progress.tests.length ? <TestRows tests={progress.tests} /> : <p className="empty-note">No test results have been saved on this computer yet.</p>}
      </section>
    </div>;
  }

  const content = {
    Dashboard: renderDashboard,
    Lessons: renderLessons,
    "Typing test": renderTest,
    "My progress": renderProgress,
    "Teacher view": renderTeacher,
  }[page]();

  return (
    <div className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">N</div><div><b>NOOR ACADEMY</b><span>TYPING TUTOR</span></div></div>
        <div className="academy-name">Where Knowledge Meets Technology</div>
        <nav aria-label="Main navigation">{navigation.map(([label, icon]) => <button key={label} title={label} className={`nav-item ${page === label ? "nav-active" : ""}`} onClick={() => navigate(label)}><span className="nav-icon">{icon}</span>{label}{label === "Lessons" && <span className="nav-count">40</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="daily-goal"><div className="goal-icon">✦</div><b>Little practice, big progress.</b><span>Keep going — you're doing great.</span><div className="goal-line"><i style={{ width: `${Math.min(100, Math.round(progress.dailyPracticeSeconds / 600 * 100))}%` }} /></div><small>{Math.min(10, Math.floor(progress.dailyPracticeSeconds / 60))} / 10 min today</small></div><div className="sidebar-foot">NOOR ACADEMY LARKANA</div></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">N</span><b>NOOR ACADEMY</b></div><div className="breadcrumb">Learning space <span>/</span> <b>{activeExercise ? "Practice" : page}</b></div><div className="top-actions"><span className="greeting">Hello, learner <span>✦</span></span><button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? "☾" : "☀"}</button></div></header>
        <div className="main-content">
          {activeExercise ? <TypingPractice key={`${activeExercise.id || activeExercise.title}-${activeExercise.text}`} exercise={activeExercise} durationMinutes={activeExercise.category ? undefined : testDuration} onComplete={finishExercise} onExit={() => setActiveExercise(null)} onNext={nextExercise} /> : <>{page === "Dashboard" && <div className="page-title"><div><p className="eyebrow">{new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date()).toUpperCase()} · YOUR LEARNING SPACE</p><h1>Welcome back, learner <span>✦</span></h1></div></div>}{content}</>}
        </div>
        <footer className="site-footer"><span>© Noor Academy Larkana</span><span>Where Knowledge Meets Technology</span></footer>
      </main>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return <div className="metric-card"><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span><strong>{value}</strong></div>;
}

function PageIntro({ eyebrow, title, text }) {
  return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>;
}

function TestRows({ tests }) {
  return <div className="test-table"><div className="test-row test-head"><span>Test</span><span>Net WPM</span><span>Accuracy</span><span>Errors</span><span>Date</span></div>{tests.map((test, index) => <div className="test-row" key={`${test.date || "current"}-${index}`}><span><b>{test.text}</b><small>{test.grossWpm} gross WPM</small></span><strong>{test.netWpm}</strong><strong>{test.accuracy}%</strong><span>{test.incorrectEntries}</span><span className="muted">{test.date ? new Date(test.date).toLocaleDateString() : "Today"}</span></div>)}</div>;
}

export default App;
