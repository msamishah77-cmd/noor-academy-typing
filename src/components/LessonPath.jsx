import { isLessonLocked } from "../data/typingLessons.js";

export default function LessonPath({
  path,
  completedLessons,
  currentLessonId,
  lessonResults,
  sequentialUnlocking,
  onStart,
}) {
  const completedCount = path.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
  const completionPercent = Math.round((completedCount / path.lessons.length) * 100);

  return (
    <section className="lesson-path">
      <div className="path-heading">
        <div>
          <p className="eyebrow">{path.lessons.length} STEP LEARNING PATH</p>
          <h2>{path.name} Lessons</h2>
        </div>
        <span className="path-count">{completedCount} / {path.lessons.length} complete</span>
      </div>
      <div
        className="path-progress"
        role="progressbar"
        aria-label={`${path.name} lesson progress`}
        aria-valuenow={completionPercent}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span style={{ width: `${completionPercent}%` }} />
      </div>
      <div className="lesson-grid">
        {path.lessons.map((lesson) => {
          const completed = completedLessons.includes(lesson.id);
          const locked = sequentialUnlocking && !completed && isLessonLocked(lesson, completedLessons);
          const result = lessonResults[lesson.id];
          const current = currentLessonId === lesson.id && !completed;
          return (
            <article
              className={`lesson-card ${current ? "lesson-current" : ""} ${locked ? "lesson-locked" : ""}`}
              key={lesson.id}
            >
              <div className={`lesson-number ${completed ? "lesson-done" : ""}`}>
                <span className="lesson-code">{lesson.code}</span>
                {(completed || locked) && <span className="lesson-state" aria-label={completed ? "Completed" : "Locked"}>{completed ? "✓" : "🔒"}</span>}
              </div>
              <div className="lesson-details">
                <h3>{lesson.title}</h3>
                <p>{lesson.code} · {lesson.category}</p>
                <div className="lesson-result">
                  <span>{completed ? "Complete" : current ? "Current lesson" : locked ? "Complete the previous lesson to unlock" : "Not started"}</span>
                  {result && <b>{result.bestWpm} WPM · {result.bestAccuracy}%</b>}
                </div>
              </div>
              <button
                className="button button-secondary lesson-action"
                disabled={locked}
                onClick={() => onStart(lesson)}
                aria-label={`${locked ? "Locked" : completed ? "Practice again" : "Start lesson"}: ${lesson.code} ${lesson.title}`}
              >
                {locked ? "Locked" : completed ? "Practice Again" : "Start Lesson"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
