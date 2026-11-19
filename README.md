# suzworx.github.io

Personal site for [@suzworx](https://github.com/suzworx), built as a dependency-free static site for GitHub Pages.

Serve the directory with any static file server (`python3 -m http.server`); the feed (feed.html and the Feed tab on the home page) fetches `feed.md`, so it does not work from `file://`.

## Posting to the feed

Edit `feed.md` (GitHub web or mobile editor works): add a `## YYYY-MM-DD` line at the top of the list, write the post under it, commit. Pages republishes in about a minute.
