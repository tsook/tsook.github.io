#!/bin/sh
# Compile cv/cv.tex and place the PDF where the site links it.
# Uses tectonic (https://tectonic-typesetting.github.io) if present, else latexmk.
set -e
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:/Library/TeX/texbin:$PATH"
if command -v tectonic >/dev/null 2>&1; then
  tectonic --keep-logs -o . cv.tex
elif command -v latexmk >/dev/null 2>&1; then
  latexmk -xelatex -interaction=nonstopmode -quiet cv.tex && latexmk -c cv.tex
else
  echo "No LaTeX engine found. Install tectonic (a single binary) from https://github.com/tectonic-typesetting/tectonic/releases into ~/.local/bin, or a TeX distribution with latexmk." >&2
  exit 1
fi
cp cv.pdf ../public/pdf/TaeSooKim_CV.pdf
echo "Wrote public/pdf/TaeSooKim_CV.pdf"
