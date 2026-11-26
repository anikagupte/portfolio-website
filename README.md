# anikagupte.com

Plain static site (HTML, CSS, JS). No framework, no build step on the host.

## Editing the shared parts

The navbar, icon sprite, `<head>` assets and project-page footer live once in `partials/`.
Each page marks where they go with `<!-- build:name -->` comments.

1. Edit the file in `partials/` (never the generated HTML between the markers).
2. Run `python3 build.py` to rewrite every page.
3. Commit the partial **and** the updated pages.

`python3 build.py --check` fails if any page is out of date. GitHub runs it on every pull request.

## Adding a project page

Copy an existing file in `projects/`, keep the `build:` marker comments, change the content, then run `python3 build.py`.
Remember to add the page to `sitemap.xml`.
