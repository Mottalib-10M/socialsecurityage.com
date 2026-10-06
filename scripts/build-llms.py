#!/usr/bin/env python3
"""Rebuilds public/llms.txt from the build (RECETTE §21). Usage: npm run build && python3 scripts/build-llms.py && npm run build"""
import glob, html, os, re, sys
sys.path.insert(0, 'src')
cfg = open('src/data/site-config.ts', encoding='utf-8').read()
SITE = re.search(r'SITE_URL = "([^"]+)"', cfg).group(1)
rows = []
for f in sorted(glob.glob('dist/en/**/index.html', recursive=True)):
    d = open(f, encoding='utf-8').read()
    if 'noindex' in d[:3000]: continue
    path = '/' + os.path.relpath(os.path.dirname(f), 'dist').replace(os.sep, '/') + '/'
    t = html.unescape(re.search(r'<title>(.*?)</title>', d, re.S).group(1))
    m = re.search(r'name="description" content="(.*?)"', d, re.S)
    rows.append((path, t, html.unescape(m.group(1)) if m else ''))
out = ['# Social Security Age', '',
       '> Independent calculator of US Social Security retirement benefits for 2026, published by Radif Partners. It recomputes the primary insurance amount the way the SSA actuaries do: each year of earnings indexed to the national average wage index, the best 35 years averaged into the AIME, the bend points of the year the person turns 62, cost-of-living adjustments since then, then the reduction or delayed credits for the age benefits start. Spouse, survivor, earnings test and taxation of benefits are covered.', '',
       'Every 2026 value comes from the SSA notice in the Federal Register (90 FR 49047), the SSA actuarial tables, title 20 of the Code of Federal Regulations, IRS Publication 915 and CMS. The engine reproduces the SSA published 2026 examples exactly. Not affiliated with the SSA; results are estimates computed in the browser.', '',
       '## Pages', '']
for p, t, d in rows: out.append(f'- [{t}]({SITE}{p}): {d}')
open('public/llms.txt', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('llms.txt:', len(rows), 'pages')
