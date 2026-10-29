export const STORAGE_KEY = "noor-academy-typing-v1";
export const shiftedUSKeys = {
  "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/", "~": "`",
};

export function getTodayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const practiceDate = getTodayKey();
    return {
      completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
      currentLessonId: typeof saved.currentLessonId === "string" ? saved.currentLessonId : "classic-01",
      bestWpm: Number(saved.bestWpm) || 0,
      bestAccuracy: Number(saved.bestAccuracy) || 0,
      practiceSeconds: Number(saved.practiceSeconds) || 0,
      lessonResults: saved.lessonResults && typeof saved.lessonResults === "object" ? saved.lessonResults : {},
      sequentialUnlocking: Boolean(saved.sequentialUnlocking),
      practiceDate,
      dailyPracticeSeconds: saved.practiceDate === practiceDate ? Number(saved.dailyPracticeSeconds) || 0 : 0,
      tests: Array.isArray(saved.tests) ? saved.tests.slice(0, 10) : [],
    };
  } catch (error) {
    console.error("Could not read saved typing progress.", error);
    return { completedLessons: [], currentLessonId: "classic-01", bestWpm: 0, bestAccuracy: 0, practiceSeconds: 0, practiceDate: getTodayKey(), dailyPracticeSeconds: 0, lessonResults: {}, sequentialUnlocking: false, tests: [] };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Could not save typing progress.", error);
  }
}

export function calculateStats(correctEntries, incorrectEntries, elapsedSeconds) {
  const entries = correctEntries + incorrectEntries;
  const minutes = elapsedSeconds / 60;
  const grossWpm = minutes > 0 ? entries / 5 / minutes : 0;
  const netWpm = minutes > 0 ? Math.max(0, grossWpm - incorrectEntries / minutes) : 0;
  return {
    grossWpm: Math.round(grossWpm),
    netWpm: Math.round(netWpm),
    accuracy: entries ? Math.round((correctEntries / entries) * 100) : 100,
    correctEntries,
    incorrectEntries,
    totalEntries: entries,
    elapsedSeconds,
  };
}

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function getBaseKey(key) {
  if (!key) return "";
  return shiftedUSKeys[key] || key.toLowerCase();
}

export function needsShift(key) {
  return Boolean(key && key.length === 1 && (key !== key.toLowerCase() || Object.hasOwn(shiftedUSKeys, key)));
}

export function getFinger(key) {
  const lower = key.toLowerCase();
  if (!lower) return "—";
  const baseKey = getBaseKey(key);
  const shiftRequired = needsShift(key);
  let finger = "Use the opposite Shift key";
  if ("1qaz`".includes(baseKey)) finger = "Left little finger";
  else if ("2wsx".includes(baseKey)) finger = "Left ring finger";
  else if ("3edc".includes(baseKey)) finger = "Left middle finger";
  else if ("45rfvtgb".includes(baseKey)) finger = "Left index finger";
  else if ("67yhnujm".includes(baseKey)) finger = "Right index finger";
  else if ("8ik,".includes(baseKey)) finger = "Right middle finger";
  else if ("9ol.".includes(baseKey)) finger = "Right ring finger";
  else if ("0p;/-=[]\\'".includes(baseKey)) finger = "Right little finger";
  else if (baseKey === " ") finger = "Thumb";
  return shiftRequired ? `${finger} + opposite Shift` : finger;
}
