# Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.
# gen_ideas_pdf.py — PDF generator for framework/ideas.md (Mac, Python 3.12)
# Usage: /usr/local/bin/python3.12 scripts/gen_ideas_pdf.py
# Outputs: framework/ideas.html + framework/ideas.pdf
#
# Requires:
#   /usr/local/bin/python3.12 -m pip install markdown playwright
#   /usr/local/bin/python3.12 -m playwright install chromium

import markdown
import re
import asyncio
from pathlib import Path

# ── Paths (relative to repo root) ─────────────────────────────────────────────
REPO_ROOT = Path(__file__).parent.parent
MD_FILE   = REPO_ROOT / 'framework' / 'ideas.md'
HTML_OUT  = REPO_ROOT / 'framework' / 'ideas.html'
PDF_OUT   = REPO_ROOT / 'framework' / 'EduOpsLab_Ideas.pdf'

# ── Read source ────────────────────────────────────────────────────────────────
with open(MD_FILE, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Strip HTML comments (copyright line, etc.)
md_content = re.sub(r'<!--.*?-->', '', md_content, flags=re.DOTALL)

# Style cross-references (→ ID notation) so they render distinctively
# e.g. "→ HL-3, BE-1" → <span class="xref">→ HL-3, BE-1</span>
md_content = re.sub(
    r'(→\s*[A-Z]{2}-\d+(?:[, ]+[A-Z]{2}-\d+)*)',
    r'<span class="xref">\1</span>',
    md_content
)

# Style ebook pointers (italicised lines starting with → Ebook:)
# These are plain *→ Ebook: Part...* lines — keep them but give them a class
md_content = re.sub(
    r'\*(→ Ebook:[^*]+)\*',
    r'<span class="ebook-ptr">\1</span>',
    md_content
)

# ── Markdown → HTML ────────────────────────────────────────────────────────────
md_extensions = ['tables', 'footnotes', 'toc', 'smarty', 'attr_list', 'md_in_html']
html_body = markdown.markdown(md_content, extensions=md_extensions)

# ── Page-break rules ──────────────────────────────────────────────────────────
# h2 (sections) force a page break; the first h2 after the cover block should not
html_body = re.sub(
    r'(<\/h1>)([\s\S]*?)(<h2)',
    lambda m: m.group(1) + m.group(2) + '<h2 class="no-break-before"',
    html_body
)

# h3 (individual entries) should not force page breaks — they are not chapters
# mark all h3 as no-break-before
html_body = html_body.replace('<h3>', '<h3 class="entry-heading">')

# ── CSS ───────────────────────────────────────────────────────────────────────
css = """
@page {
    size: letter;
    margin: 0.75in 0.9in 0.75in 0.9in;
}

@media print {
    body { font-size: 11pt; }
    h1 { page-break-before: always; }
    h1:first-of-type { page-break-before: avoid; }
    h2 { page-break-before: always; }
    h2.no-break-before { page-break-before: avoid; }
    h2, h3 { page-break-after: avoid; }
    p { orphans: 3; widows: 3; }
    table { page-break-inside: avoid; }
}

* { box-sizing: border-box; }

body {
    font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
    font-size: 11.5pt;
    line-height: 1.65;
    color: #1a1a1a;
    margin: 0 auto;
    padding: 0.25in;
    hyphens: auto;
    -webkit-hyphens: auto;
}

/* ── Cover / title ──────────────────────────────────────────────────────── */
h1 {
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 24pt;
    font-weight: 700;
    color: #1a3a5c;
    margin-top: 1.8in;
    margin-bottom: 0.3em;
    border-bottom: 3px solid #1a3a5c;
    padding-bottom: 0.25em;
    text-align: center;
}

/* ── Section headings (## — major analytical sections) ──────────────────── */
h2 {
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 14pt;
    font-weight: 700;
    color: #1a3a5c;
    margin-top: 2em;
    margin-bottom: 0.2em;
    border-bottom: 1.5px solid #c8d4e0;
    padding-bottom: 0.2em;
}

/* ── Entry headings (### — individual numbered entries) ─────────────────── */
h3.entry-heading {
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 11pt;
    font-weight: 700;
    color: #2a4a6c;
    margin-top: 1.4em;
    margin-bottom: 0.2em;
    border-left: 4px solid #6b8aad;
    padding-left: 0.5em;
}

h4 {
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 10.5pt;
    font-weight: 600;
    color: #3a5a7c;
    margin-top: 1em;
    margin-bottom: 0.2em;
}

p {
    margin-bottom: 0.55em;
    text-align: justify;
}

/* ── Ebook chapter pointer ───────────────────────────────────────────────── */
.ebook-ptr {
    display: inline-block;
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 8.5pt;
    font-style: normal;
    color: #7a9ab8;
    background: #f0f4f8;
    border: 1px solid #c8d4e0;
    border-radius: 3px;
    padding: 1px 6px;
    margin-bottom: 0.6em;
    letter-spacing: 0.01em;
}

/* ── Cross-references (→ ID) ─────────────────────────────────────────────── */
.xref {
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 9pt;
    color: #6b8aad;
    font-style: normal;
    white-space: nowrap;
}

/* ── Section intro italics ───────────────────────────────────────────────── */
p > em:only-child {
    display: block;
    font-size: 10pt;
    color: #555;
    line-height: 1.5;
    margin-bottom: 0.8em;
    padding: 0.4em 0.8em;
    border-left: 3px solid #c8d4e0;
    background: #f8f9fa;
    font-style: italic;
}

/* ── Tables ──────────────────────────────────────────────────────────────── */
table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.8em 0;
    font-size: 9.5pt;
}
th {
    background: #1a3a5c;
    color: white;
    font-family: 'Helvetica Neue', 'Arial', sans-serif;
    font-weight: 600;
    padding: 6px 8px;
    text-align: left;
    border: 1px solid #1a3a5c;
}
td {
    padding: 5px 8px;
    border: 1px solid #ddd;
    vertical-align: top;
}
tr:nth-child(even) td { background: #f8f9fa; }

/* ── Dividers ────────────────────────────────────────────────────────────── */
hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 1.2em 0;
}

/* ── Blockquotes ─────────────────────────────────────────────────────────── */
blockquote {
    margin: 0.8em 0;
    padding: 0.4em 0.8em;
    border-left: 3px solid #6b8aad;
    background: #f5f7fa;
    font-style: italic;
    color: #444;
    font-size: 10.5pt;
}

/* ── Code ────────────────────────────────────────────────────────────────── */
code {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    background: #f4f4f4;
    padding: 1px 4px;
    border-radius: 2px;
}

/* ── Footnotes ───────────────────────────────────────────────────────────── */
.footnote { font-size: 8.5pt; line-height: 1.4; color: #666; }
sup { font-size: 7.5pt; vertical-align: super; }

a { color: #1a3a5c; text-decoration: none; }

/* ── Lists ───────────────────────────────────────────────────────────────── */
ul, ol { margin-bottom: 0.6em; padding-left: 1.4em; }
li { margin-bottom: 0.2em; }

strong { font-weight: 700; color: #1a2a3c; }
"""

# ── Assemble HTML ─────────────────────────────────────────────────────────────
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>EduOpsLab: Teaching as a Production System — Lab Notes</title>
<style>{css}</style>
</head>
<body>
{html_body}
</body>
</html>"""

with open(HTML_OUT, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"HTML written: {HTML_OUT}")

# ── PDF via Playwright ────────────────────────────────────────────────────────
async def generate_pdf():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        html_url = f'file://{HTML_OUT.as_posix()}'
        await page.goto(html_url, wait_until='networkidle')

        await page.pdf(
            path=str(PDF_OUT),
            format='Letter',
            margin={
                'top':    '0.75in',
                'right':  '0.9in',
                'bottom': '0.75in',
                'left':   '0.9in',
            },
            print_background=True,
            display_header_footer=True,
            header_template='<div></div>',
            footer_template=(
                '<div style="font-size:8.5pt;color:#888;text-align:center;'
                'width:100%;font-family:Helvetica Neue,Arial,sans-serif;">'
                'EduOpsLab: Teaching as a Production System &nbsp;|&nbsp; '
                '<span class="pageNumber"></span>'
                '</div>'
            ),
        )
        await browser.close()

    size = PDF_OUT.stat().st_size
    print(f"PDF written:  {PDF_OUT}")
    print(f"Size:         {size:,} bytes ({size / 1024 / 1024:.1f} MB)")

asyncio.run(generate_pdf())
