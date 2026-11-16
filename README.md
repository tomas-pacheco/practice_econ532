# ECON 532 — Past Exam Question Bank (prototype v1)

A static website designed for **GitHub Pages**. It currently contains six exercises from the LaTeX excerpt supplied by the TA (the questions refer to Fall 2016). Nothing is uploaded or saved when a student browses or generates an exam.

## Features

- Search questions by keyword, filter by **topic** and **year**.
- Open full question text, mathematical formulas, tables, and a recreated scatterplot for Question 2.
- Generate **four unique random questions** and print or save as a PDF using the browser's print dialog.
- Share the exact four-question exam using **Copy exam link** (the question IDs are encoded in the URL).
- The History of Statistics exercise (Q6) is excluded from the random pool by default; students can include it with a checkbox.
- Responsive layout inspired by the colors of the University of Illinois.

## Files

```text
index.html                   main page
styles.css                   layout and printing
app.js                       search, filters, random generator and plot rendering
data/questions.json          the six exercises and topic tags
data/grades-2016.json        coordinates and regression line for Q2
originals/2016_exercises.tex original LaTeX from the TA
 topics-to-review.csv         provisional taxonomy for TA review
```

(The lines with spaces above denote regular paths without the leading symbols.)

## Publish using GitHub Pages

1. Create a **public** repository, e.g. `econ532-question-bank`, after checking with the instructor that the past exam questions may be distributed publicly.
2. Upload **the contents of this folder**, including `index.html` at the root, `styles.css`, `app.js`, `data/`, and (if desired) `originals/`.
3. In the repository open **Settings → Pages**.
4. Set **Build and deployment → Source: Deploy from a branch**; choose **main** and **/(root)**, and save.
5. GitHub provides a website URL such as `https://your-username.github.io/econ532-question-bank/`.

The site is 100% static. No login, Google account, API key, or database is required. Mathematical notation loads from **MathJax v4** over a public CDN, so an internet connection is required to render math notation beautifully.

## Preview locally

Because browser security typically prevents `fetch()` from reading local JSON via `file://`, serve this folder from a terminal:

```bash
cd econ532-question-bank-v1
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Adding questions

1. Edit `data/questions.json` and add a record. Give it a **unique** `id` (`2020-midterm-q03`), `year`, `number`, `title`, `points`, `points_label`, `topics` (array), and `body` (HTML containing math as `\\( ... \\)` or `\\[ ... \\]`).
2. Set `include_in_random` to `true` for practice questions, or `false` for optional/unusual exercises.
3. Existing exam links will continue to work as long as existing question IDs are kept unchanged.
4. To add a custom chart, implement its renderer in `app.js` or include an image or SVG asset.

The question texts were manually adapted from LaTeX to web HTML; the separate `.tex` source is preserved to avoid losing the original. LaTeX tables and `pgfplots`/TikZ cannot be interpreted directly by MathJax. For Q2, the scatterplot is reproduced from all 38 coordinate pairs and the given straight-line equation. We did not invent solutions.

## Metadata still to review

- **Exam type**: the supplied file has no cover page or metadata confirming **Final**. It mentions *Fall 2016*, but we have marked `exam: "To confirm"`. The TA should confirm the exam type before putting the site online.
- **Topic labels** are proposals. Review `topics-to-review.csv` and edit `data/questions.json`.
- **Q2 source inconsistency:** The table in the supplied LaTeX reports `Mean(Y) = 6.01`, whereas the 38 listed Y values average to **6.00**. The site intentionally preserves **6.01** exactly as provided. Please verify this with the source before publication.
- **Scope and permissions**: If future exams or answer keys are not approved for public distribution, do not commit them to a public repository. GitHub Pages files are publicly accessible.

## Limitations

- The generated exam is a random practice set, not a calibrated 100-point exam. The four selected questions can have different total points.
- Student answers and progress are **not** collected or saved, and no solutions are currently published.
- New questions require editing static JSON and committing the changes to GitHub; there is no administrative form yet.
