#!/usr/bin/env python3
"""Keep the parts shared by every page (navbar, icon sprite, head assets, footer) in one place.

Edit a file in partials/, then run:   python3 build.py
Check nothing is stale (for CI):      python3 build.py --check

How it works: each page contains marker comments such as

    <!-- build:nav prefix="/" home="/" active="work" -->
    ...generated HTML, do not edit by hand...
    <!-- /build:nav -->

The script replaces what sits between the markers with partials/<name>.html,
filling in {{placeholders}} from the attributes on the opening marker.
The pages stay ordinary static HTML, so any host can serve them as they are.
Standard library only.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).parent
PAGES = ['index.html', *sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / 'projects').glob('*.html'))]
BLOCK = re.compile(r'(<!-- build:(?P<name>[\w-]+)(?P<attrs>[^>]*?)-->)(?P<body>.*?)(<!-- /build:(?P=name) -->)', re.S)
ATTR = re.compile(r'(\w+)="([^"]*)"')
NAV_LINKS = ['work', 'impact', 'beyond', 'contact']


def render(name, attrs):
    partial = ROOT / 'partials' / f'{name}.html'
    if not partial.exists():
        sys.exit(f'No partial named "{name}" (looked for {partial.relative_to(ROOT)})')
    values = dict(attrs)
    for link in NAV_LINKS:  # {{active_work}} etc. -> ' class="active"' for the current section
        values[f'active_{link}'] = ' class="active"' if attrs.get('active') == link else ''
    text = partial.read_text(encoding='utf-8').rstrip('\n')
    def fill(m):
        key = m.group(1)
        if key not in values:
            sys.exit(f'Partial "{name}" uses {{{{{key}}}}} but the page marker does not set it')
        return values[key]
    return re.sub(r'\{\{\s*(\w+)\s*\}\}', fill, text)


def build(path):
    src = (ROOT / path).read_text(encoding='utf-8')
    def swap(m):
        attrs = dict(ATTR.findall(m.group('attrs')))
        return f"{m.group(1)}\n{render(m.group('name'), attrs)}\n{m.group(5)}"
    return src, BLOCK.sub(swap, src)


def main():
    check = '--check' in sys.argv
    stale = []
    for page in PAGES:
        old, new = build(page)
        if old != new:
            stale.append(page)
            if not check:
                (ROOT / page).write_text(new, encoding='utf-8')
    if check:
        if stale:
            sys.exit('Out of date (run python3 build.py): ' + ', '.join(stale))
        print('All pages are up to date.')
    else:
        print('Updated: ' + ', '.join(stale) if stale else 'Nothing to update.')


if __name__ == '__main__':
    main()
