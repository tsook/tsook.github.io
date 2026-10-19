# CV

The CV source now lives in the application-documents repo
(`github.com/tsook/research_statement`, file `cv/content.tex`, style
`styles/cv.sty`). Edit it there, then run

    npm run cv

from this repo. It builds that project and copies the CV to
`public/pdf/TaeSooKim_CV.pdf` (the website version, without role descriptions). Commit the PDF; the site serves the
committed PDF, nothing compiles at deploy time.

`cv.tex` and `cv.pdf` in this folder are the older Google Docs based CV,
kept for reference only.
