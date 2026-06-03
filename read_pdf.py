import os
from pypdf import PdfReader

pdf_path = "AI Engineer - Test Assignment 2.pdf"
reader = PdfReader(pdf_path)
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

print(text)
