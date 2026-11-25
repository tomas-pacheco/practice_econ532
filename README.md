# ECON 532 Past Exam Question Bank — v7

This version builds on v6 and adds **multi-chapter random practice exams** and **printing complete archived finals by year**. The 148 questions and their classifications are unchanged.

## What's new

**Practice exam generator:** Select any combination of Chapter 9–15 (future chapters will appear automatically when added to `data/chapters.json`). Four distinct questions are sampled uniformly from eligible questions tagged with *at least one* of the selected chapters. The **All eligible questions** setting preserves the previous behavior, including eligible unclassified questions. History/reflection questions remain excluded. When fewer than four questions match, the Generate button is disabled with a short explanation. Chapter selections are preserved in shared links.

**Full finals by year:** In **Question bank**, choose a year using the **Year** dropdown. A **Print [year] final** button appears immediately below the filters. It opens `print.html?year=YYYY` and offers the same clean print / Save as PDF view as the random exam. It prints *every* archived question for that year, including unclassified questions, irrespective of any search/chapter filter set on the main page. Part A and Part B headings and original question numbering are preserved for older exams.

The print view is still an HTML document with mathematics rendered using MathJax; students receive a clean PDF through the browser's Save as PDF feature, not LaTeX source.

## Updating GitHub Pages

For an existing v6 deployment, upload or replace the following **six files** in your repository:

- `index.html`
- `styles.css`
- `app.js`
- `print.html`
- `print.css`
- `print.js`

Do not replace `data/questions.json` unless you want to reinstall the complete project. Keep your current `images/` folder including any figures you added, and your other data files. The new features use the existing `data/questions.json` and `data/chapters.json`.

Alternatively, you can upload the contents of the complete project ZIP into an empty repository. Do not upload the ZIP file itself as your website content; extract first. Keep `index.html` at the repository root.

## Suggested tests after deployment

1. Select **Chapter 12** alone. There are three eligible questions, so generation should be unavailable until you select another chapter.
2. Add **Chapter 15**, then generate. All four questions must belong to at least one selected chapter.
3. Select **All eligible questions**, generate, print, and confirm four questions appear as before.
4. In **Question bank**, select **1999**, then click **Print 1999 final**. The print view should include eight questions separated into Parts A and B.
5. Select **2016** and print. All six archived questions should appear, irrespective of their chapter labels.

The browser can add its own date/URL headers and footers: switch off **Headers and footers** in the print dialog if desired. Some historical questions refer to figures or articles not yet uploaded to `images/`; those may appear as missing-image placeholders until the corresponding files are added.

## Future midterm / final presets

Rather than hard-coding an incomplete course division now, a later **Midterm** / **Final** preset can select the appropriate chapters automatically once the earlier chapters and midterm archive are available. Manual chapter selection will continue to work.
