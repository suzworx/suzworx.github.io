// Renders feed.md: each post starts with a "## YYYY-MM-DD" line; text before the first one is ignored.
// Shown in the Feed tab of the home bio; a post's date links to /#<date>.
const escapeHtml = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const inline = (text) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');

function parseFeed(markdown) {
  return markdown
    .split(/^## +/m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split("\n");
      const paragraphs = rest.join("\n").trim().split(/\n\s*\n/).filter(Boolean);
      return { date: heading.trim(), paragraphs: paragraphs.map((p) => p.replace(/\s*\n\s*/g, " ")) };
    })
    .filter((post) => post.paragraphs.length);
}

/** Permalink ids keyed by date: "2026-11-18", and "2026-11-18-2" for a second post that day (counted oldest first). */
function postIds(posts) {
  const seen = {};
  return posts
    .slice()
    .reverse()
    .map((post) => {
      const slug = post.date.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "post";
      seen[slug] = (seen[slug] || 0) + 1;
      return seen[slug] === 1 ? slug : `${slug}-${seen[slug]}`;
    })
    .reverse();
}

function dateLabel(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/** Fills `target` with every post from feed.md; resolves once rendered. */
function renderFeed(target) {
  const load = (url) => fetch(url, { cache: "no-cache" }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))));
  // Opened from disk or mid-deploy: fall back to the published copy.
  return load("feed.md")
    .catch(() => load("https://suzworx.github.io/feed.md"))
    .then((markdown) => {
      const posts = parseFeed(markdown);
      if (!posts.length) {
        target.innerHTML = "<p>Nothing here yet. Thinking.</p>";
        return;
      }
      const ids = postIds(posts);
      target.innerHTML = posts
        .map((post, i) => `<article class="note" id="${ids[i]}">${post.paragraphs.map((p) => `<p>${inline(p)}</p>`).join("")}<a class="note-date" href="#${ids[i]}">${escapeHtml(dateLabel(post.date))}</a></article>`)
        .join("");
    })
    .catch(() => {
      target.innerHTML = '<p>Couldn’t load the feed. <a href="feed.md">Read feed.md</a>.</p>';
    });
}
