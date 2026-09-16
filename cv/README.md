# CV

`cv.tex` is the source of the CV linked from the site. Edit it here, then run

    npm run cv

which compiles it with tectonic (or latexmk) and copies the result to
`public/pdf/TaeSooKim_CV.pdf`. Commit both the `.tex` and the PDF; the
site serves the committed PDF, nothing compiles at deploy time.

The document compiles under XeLaTeX (uses Times New Roman when the system
has it, otherwise the newtx fonts) and under pdfLaTeX.
