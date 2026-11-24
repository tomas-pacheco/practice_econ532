# ECON 532 — Past Final Exam Question Bank (v2)

Static website for GitHub Pages, based on the final-exam LaTeX supplied by the TA.

## Content

- **148 final-exam questions** from **23 available years (1994–2025)**. Not every calendar year has an exam in this archive.
- **Workout Examples III and IV are entirely excluded**, including from the published LaTeX source.
- **106 questions** have one or more labels from Chapters **9–15**, exactly as marked red in the original LaTeX; **42 questions** have no chapter classification.
- Questions without a chapter label **appear in the full archive and year-filtered lists**, but **do not appear when a chapter filter is applied**.
- The original year, Part A/Part B, question number, point labels, printed answer-to-grade text, and source statements have been retained. Some years have repeated question numbers in different parts (or within the same part), so stable unique IDs are used.
- The six 2016 question IDs (`2016-q01` through `2016-q06`) are unchanged from v1, keeping previously shared practice-exam links valid.

## Images

Copy source images into the **`images/`** folder using the **exact filenames** in [`images/IMAGE_MANIFEST.csv`](images/IMAGE_MANIFEST.csv).

For example:

```text
images/2025_q3.png
images/2017_q4_cartoons.png
images/2015_q3_expected.png
images/2015_q3_observed.png
```

The HTML automatically references the expected filenames. Until you add an image, that question displays a useful **"Image not yet added"** notice (instead of a broken-image icon). For 2016 Q2 the recreated grade scatterplot from v1 is shown as a fallback until you provide `images/2016_q2.png`.

You can copy images to GitHub by going to the repository's `images/` directory and uploading files there, then committing. GitHub Pages serves them using relative paths. Keep extensions and capitalization unchanged.

### Note about incomplete figures

Some exams cannot be solved from their text alone without the original image (for example, 2025 Q3, the needles experiment). Add relevant images **before** directing students to those questions. The site does not invent or recreate unavailable illustrations.

## Files

```text
index.html                      main website and filters
app.js                          question browsing and four-question random generator
styles.css                      existing UI styles + LaTeX-import support
data/questions.json             full question database (148)
data/chapters.json              fixed taxonomy (chapters 9–15)
data/grades-2016.json           chart data for 2016 Q2 fallback
data/question_index.csv         quick inventory of question metadata
images/IMAGE_MANIFEST.csv       exactly 12 images to insert
images/.gitkeep                 keeps empty images folder in Git
originals/past_finals_only.tex  transcribed finals only, without workouts
```

## Publish as an update to your existing GitHub Pages site

1. **Back up** your current repository, or create a new branch before replacing files.
2. Upload the **contents** of this folder to the repository's root (`index.html`, `app.js`, `styles.css`, `data/`, `images/`), **not the ZIP itself**.
3. **Replace** `index.html`, `app.js`, `styles.css` and `data/questions.json`, and **add** `data/chapters.json`, `images/`, and the other files in this bundle.
4. Commit changes. Your configured GitHub Pages site will deploy automatically.
5. Open the site and check **2016 Final**, **Chapter 15**, an **unclassified question by year**, and the **Generate four questions** action.

The website remains static. No backend, database, login or Google account is needed. MathJax v4 is loaded from a public CDN, so internet access is needed for rendered mathematics.

## Preview locally

Opening `index.html` directly using `file://` often prevents JSON loading. Use a local web server instead:

```bash
cd econ532-question-bank-v2
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Editing and updating the data

- Each record has `id`, `year`, `exam`, `part`, `number`, `points`, `chapters`, `body` (HTML + MathJax), `latex`, and `images`.
- **Keep existing `id` values** unchanged so previously generated practice-exam links continue to work.
- Use `chapters: []` for unclassified questions. Don't infer categories not explicitly assigned in the LaTeX.
- The source and page display do not include question solutions. Some original *questions* include a sample answer the student is asked to grade; these are part of the prompt, not answer keys.
- Random-exam generation selects 4 distinct questions, including uncategorized items; obvious history/reflection questions are excluded by default, with an opt-in checkbox.

## Quality notes

- Many originals include apparent notation/typographical issues. Their mathematical content has not been silently corrected; please verify ambiguous questions against the PDFs before assigning them.
- Source `2016 Final Q2` lists an observed-grade mean of `6.01`; its 38 individual values average to `6.00`. We preserve the supplied table value for fidelity.
- Some long tables and printed proofs are translated into scrollable HTML. Rendering of mathematical formulas relies on MathJax.
- Confirm that the instructor permits distribution of historical exam questions and attached third-party images/articles before publishing.
- A private GitHub repository does not by itself make the Pages site or its question data private.
