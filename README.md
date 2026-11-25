# ECON 532 — Random exams: classified questions only (v9.0)

The random practice-exam generator **now excludes all questions with no chapter classification**, even when selecting **All eligible questions**. It still excludes history/reflection questions according to the existing `include_in_random` flag.

The chapter selector, four-question generator, printable practice exams, printing complete finals by year, and the existing 148-question database are otherwise unchanged. **All 148 questions—including unclassified questions—remain available in the Question bank and in full finals printed by year.**

## Update GitHub Pages

Upload only these files to the root of your repository:
- `app.js` — adjusts the random-exam pool and removes the phrase “(including unclassified questions)”.
- `index.html` — updates the JavaScript version query to prevent loading the older cached generator.

Do not replace `data/questions.json`, `styles.css`, or the printing files. Upload both files and commit; then refresh the page.

## Validation

The supplied database has **148** questions: **106** classified and **42** unclassified. Of the 42 unclassified questions, 32 had previously been allowed by `include_in_random`; those 32 are now removed from the random pool. The year archive is unchanged.
