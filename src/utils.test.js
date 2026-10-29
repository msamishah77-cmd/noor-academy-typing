import test from "node:test";
import assert from "node:assert/strict";
import { advancedLessons, classicLessons, getFirstIncompleteLesson, getNextLesson, isLessonLocked, typingLessons } from "./data/typingLessons.js";
import { calculateStats, formatTime, getBaseKey, getFinger, needsShift } from "./utils.js";

test("typing statistics use five characters per word and count all entries", () => {
  const stats = calculateStats(100, 5, 60);
  assert.equal(stats.grossWpm, 21);
  assert.equal(stats.netWpm, 16);
  assert.equal(stats.accuracy, 95);
  assert.equal(stats.totalEntries, 105);
});

test("typing statistics safely handle a timer that has not started", () => {
  const stats = calculateStats(0, 0, 0);
  assert.equal(stats.grossWpm, 0);
  assert.equal(stats.netWpm, 0);
  assert.equal(stats.accuracy, 100);
});

test("Classic Lessons contain the exact 32 requested codes and key groups in order", () => {
  const expected = [
    "L 1|F J", "L 2|D K", "R 1|F J D K", "L 3|S L", "L 4|A ;", "R 2|S L A ;", "L 5|G H", "R 3|Home Row",
    "L 6|R U", "L 7|E I", "R 4|R U E I", "L 8|W O", "L 9|Q P", "R 5|W O Q P", "L 10|T Y", "R 6|Top Row",
    "L 11|V M", "L 12|C ,", "R 7|V M C ,", "L 13|X .", "L 14|Z '", "R 8|X . Z '", "L 15|B N",
    "R 9|Bottom Row", "L 16|Shift", "L 17|\" ! ?", "R 10|Shift", "R 11|Index Finger", "R 12|Middle Finger",
    "R 13|Ring Finger", "R 14|Pinky Finger", "R 15|All",
  ];
  assert.equal(classicLessons.length, 32);
  assert.deepEqual(classicLessons.map((lesson) => `${lesson.code}|${lesson.title}`), expected);
});

test("Advanced Lessons contain the exact 16 requested codes and key groups in order", () => {
  const expected = [
    "L 1|A J K L", "L 2|S D F", "L 3|G H", "R 1|Home Row", "L 4|E I", "L 5|O U", "R 2|E I O U", "L 6|R T Y",
    "L 7|Q W P", "R 3|Top Row", "L 8|C V N M", "L 9|Z X B", "R 4|Bottom Row", "L 10|Shift", "L 11|Punctuation", "R 5|All",
  ];
  assert.equal(advancedLessons.length, 16);
  assert.deepEqual(advancedLessons.map((lesson) => `${lesson.code}|${lesson.title}`), expected);
});

test("each lesson has a usable practice text made from its assigned key group", () => {
  assert.equal(typingLessons.length, 48);
  assert.equal(new Set(typingLessons.map((lesson) => lesson.id)).size, 48);
  for (const lesson of typingLessons) {
    assert.ok(lesson.practiceTexts.length > 0, lesson.id);
    for (const text of lesson.practiceTexts) {
      for (const character of text) {
        assert.ok(character === " " || lesson.targetKeys.includes(character.toLowerCase()), `${lesson.id} does not include ${JSON.stringify(character)} in its key group`);
      }
    }
  }
});

test("lesson paths calculate next and locked lessons independently", () => {
  assert.equal(getFirstIncompleteLesson([]).id, "classic-01");
  assert.equal(getNextLesson(classicLessons[0], []).id, "classic-02");
  assert.equal(getNextLesson(classicLessons[31], []).id, "advanced-01");
  assert.equal(isLessonLocked(classicLessons[1], []), true);
  assert.equal(isLessonLocked(advancedLessons[0], []), false);
  assert.equal(isLessonLocked(classicLessons[1], [classicLessons[0].id]), false);
});

test("keyboard helpers provide finger guidance and format elapsed time", () => {
  assert.equal(getFinger("a"), "Left little finger");
  assert.equal(getFinger("T"), "Left index finger + opposite Shift");
  assert.equal(getBaseKey("?"), "/");
  assert.equal(needsShift("?"), true);
  assert.equal(getFinger(" "), "Thumb");
  assert.equal(formatTime(125), "2:05");
});
