#!/bin/sh
# Build the CV from the application-documents repo and place the PDF where the site links it.
# Source of truth: ../research_statement (github.com/tsook/research_statement), cv/content.tex.
set -e
cd "$(dirname "$0")"
src="${CV_REPO:-../../research_statement}"
if [ ! -d "$src" ]; then
  echo "CV repo not found at $src. Clone github.com/tsook/research_statement next to this repo or set CV_REPO." >&2
  exit 1
fi
export PATH="$HOME/.local/bin:$PATH"
bash "$src/support/build.sh"
cp "$src/.build/output/pdf/cv.pdf" ../public/pdf/TaeSooKim_CV.pdf
echo "Wrote public/pdf/TaeSooKim_CV.pdf"
