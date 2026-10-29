function createLesson(category, order, [code, title, targetKeys, practiceTexts, fingerGroup]) {
  const id = `${category.toLowerCase()}-${String(order).padStart(2, "0")}`;
  const instructions = fingerGroup
    ? `Practice ${title} with your ${fingerGroup}. Keep your other fingers relaxed and return to the home row after each reach.`
    : `Practice the ${title} keys. Keep your fingers on the home row between reaches and type each pattern accurately.`;

  return {
    id,
    code,
    title,
    category,
    order,
    targetKeys,
    fingerGroup,
    instructions,
    practiceTexts,
    duration: 3,
    difficulty: order < 9 ? "Beginner" : order < 17 ? "Intermediate" : "Advanced",
  };
}

const classicRows = [
  ["L 1", "F J", "fj", ["f j fj jf ff jj fjf jfj"], "index fingers"],
  ["L 2", "D K", "dk", ["d k dk kd dd kk dkd kdk"], "middle fingers"],
  ["R 1", "F J D K", "fjdk", ["fj dk jf kd fd jk"], "index and middle fingers"],
  ["L 3", "S L", "sl", ["s l sl ls ss ll sls lsl"], "ring fingers"],
  ["L 4", "A ;", "a;", ["a ; a; ;a aa ;; a;a"], "little fingers"],
  ["R 2", "S L A ;", "sl;a", ["sl a; ls ;a sa l;"], "ring and little fingers"],
  ["L 5", "G H", "gh", ["g h gh hg gg hh ghg hgh"], "index fingers"],
  ["R 3", "Home Row", "asdfghjkl;", ["asdf jkl; fj dk sl a; gh hg ;lkj fdsa"], "all home-row fingers"],
  ["L 6", "R U", "ru", ["r u ru ur rr uu rur uru"], "index fingers"],
  ["L 7", "E I", "ei", ["e i ei ie ee ii eie iei"], "middle fingers"],
  ["R 4", "R U E I", "ruei", ["ru ei ur ie re ui er iu"], "index and middle fingers"],
  ["L 8", "W O", "wo", ["w o wo ow ww oo wow owo"], "ring fingers"],
  ["L 9", "Q P", "qp", ["q p qp pq qq pp qpq pqp"], "little fingers"],
  ["R 5", "W O Q P", "woqp", ["wo qp ow pq wq op qw po"], "ring and little fingers"],
  ["L 10", "T Y", "ty", ["t y ty yt tt yy tyty ytyt"], "index fingers"],
  ["R 6", "Top Row", "qwertyuiop", ["qwer tyui op poiuy trewq yuiop"], "all top-row fingers"],
  ["L 11", "V M", "vm", ["v m vm mv vv mm vmv mvm"], "index fingers"],
  ["L 12", "C ,", "c,", ["c , c, ,c cc ,, c,c"], "middle fingers"],
  ["R 7", "V M C ,", "vmc,", ["vm c, mv ,c vc m, cv ,m"], "index and middle fingers"],
  ["L 13", "X .", "x.", ["x . x. .x xx .. x.x"], "ring fingers"],
  ["L 14", "Z '", "z'", ["z ' z' 'z zz '' z'z"], "little fingers"],
  ["R 8", "X . Z '", "x.z'", ["x. z' .x 'z x' .z 'x z."], "ring and little fingers"],
  ["L 15", "B N", "bn", ["b n bn nb bb nn bnb nbn"], "index fingers"],
  ["R 9", "Bottom Row", "zxcvbnm,.'", ["zxcv bnm, x. z' bn vm c,"], "all bottom-row fingers"],
  ["L 16", "Shift", "asdfjkl;", ["F J D K S L A ;", "f j d k s l a ;"], "opposite-hand Shift"],
  ["L 17", "\" ! ?", "\"!?", ["\" ! ? \"! ?! !! ??"], "opposite-hand Shift and punctuation fingers"],
  ["R 10", "Shift", "asdfjkl;", ["A ; S L D K F J", "a ; s l d k f j"], "opposite-hand Shift"],
  ["R 11", "Index Finger", "frtgbvyhnujm", ["frt gbv yhn ujm fj ty"], "left and right index fingers"],
  ["R 12", "Middle Finger", "edcik,", ["edc ik, de ci ke"], "left and right middle fingers"],
  ["R 13", "Ring Finger", "wsxol.", ["wsx ol. sw xo wl"], "left and right ring fingers"],
  ["R 14", "Pinky Finger", "qazp;'/", ["qaz p;'/ za ;p aq '/"], "left and right little fingers"],
  ["R 15", "All", "abcdefghijklmnopqrstuvwxyz,.';\"", ["fj dk sl a; gh ru ei wo qp ty vm c, x. z' bn qwerty asdf zxcv", "Noor Academy"], "all fingers"],
];

const advancedRows = [
  ["L 1", "A J K L", "ajkl", ["a j k l aj kl ja lk ak lj"], "little and right-hand home-row fingers"],
  ["L 2", "S D F", "sdf", ["s d f sd df fs ds"], "left-hand home-row fingers"],
  ["L 3", "G H", "gh", ["g h gh hg gg hh ghg hgh"], "index fingers"],
  ["R 1", "Home Row", "asdfghjkl;", ["asdf jkl; fdsa ;lkj asdfgh jkl;"], "all home-row fingers"],
  ["L 4", "E I", "ei", ["e i ei ie ee ii eie iei"], "middle fingers"],
  ["L 5", "O U", "ou", ["o u ou uo oo uu ouo uou"], "ring fingers"],
  ["R 2", "E I O U", "eiou", ["ei ou ie uo eo ui oi ue"], "middle and ring fingers"],
  ["L 6", "R T Y", "rty", ["r t y rt ty ry tr yt"], "index fingers"],
  ["L 7", "Q W P", "qwp", ["q w p qw wp pq wq pw"], "little and ring fingers"],
  ["R 3", "Top Row", "qwertyuiop", ["qwer tyui op poiuy trewq qwertyuiop"], "all top-row fingers"],
  ["L 8", "C V N M", "cvnm", ["c v n m cv nm vc mn cn vm"], "middle and index fingers"],
  ["L 9", "Z X B", "zxb", ["z x b zx xb bz xz bx"], "little, ring, and index fingers"],
  ["R 4", "Bottom Row", "zxcvbnm,.'", ["zxcv bnm, x. z' bn vm c, zxcvbnm"], "all bottom-row fingers"],
  ["L 10", "Shift", "asdfjkl;", ["A J K L S D F", "a j k l s d f"], "opposite-hand Shift"],
  ["L 11", "Punctuation", ",.';\"!?", [", . ' ; \" ! ? ,; .'"], "punctuation fingers and opposite-hand Shift"],
  ["R 5", "All", "abcdefghijklmnopqrstuvwxyz,.';\"!?", ["quick jazz; bold fox! typing is fun.", "The quick brown fox jumps over a lazy dog."], "all fingers"],
];

export const classicLessons = classicRows.map((row, index) => createLesson("Classic", index + 1, row));
export const advancedLessons = advancedRows.map((row, index) => createLesson("Advanced", index + 1, row));
export const typingLessons = [...classicLessons, ...advancedLessons];
export const lessonCategories = [
  { name: "Classic", lessons: classicLessons },
  { name: "Advanced", lessons: advancedLessons },
];

export function getNextLesson(lesson, completedLessons) {
  const index = typingLessons.findIndex((item) => item.id === lesson.id);
  return typingLessons.slice(index + 1).find((item) => !completedLessons.includes(item.id))
    || typingLessons.find((item) => !completedLessons.includes(item.id))
    || null;
}

export function getFirstIncompleteLesson(completedLessons) {
  return typingLessons.find((lesson) => !completedLessons.includes(lesson.id)) || typingLessons[typingLessons.length - 1];
}

export function isLessonLocked(lesson, completedLessons) {
  const path = lessonCategories.find((category) => category.name === lesson.category);
  return Boolean(path?.lessons.some((item) => item.order < lesson.order && !completedLessons.includes(item.id)));
}
