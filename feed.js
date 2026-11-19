// Renders feed.md: each post starts with a "## YYYY-MM-DD" line; text before the first one is ignored.
// Used by feed.html (all posts) and the Feed tab on the home page (latest few).
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

/** Fills `target` with posts from feed.md. `limit` shows only the newest N plus a link to the full feed. */
function renderFeed(target, { limit } = {}) {
  return fetch("feed.md", { cache: "no-cache" })
    .then((response) => (response.ok ? response.text() : Promise.reject(new Error(String(response.status)))))
    .then((markdown) => {
      const posts = parseFeed(markdown);
      if (!posts.length) {
        target.innerHTML = "<p>Nothing here yet. Thinking.</p>";
        return;
      }
      const ids = postIds(posts);
      const shown = limit ? posts.slice(0, limit) : posts;
      target.innerHTML =
        shown
          .map((post, i) => {
            const id = ids[i];
            const href = limit ? `feed.html#${id}` : `#${id}`;
            return `<article class="note"${limit ? "" : ` id="${id}"`}>${post.paragraphs.map((p) => `<p>${inline(p)}</p>`).join("")}<a class="note-date" href="${href}">${escapeHtml(dateLabel(post.date))}</a></article>`;
          })
          .join("") + (limit ? '<p class="feed-more"><a href="feed.html">See the full feed →</a></p>' : "");
      if (!limit && location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    })
    .catch(() => {
      target.innerHTML = '<p>Couldn’t load the feed. <a href="feed.md">Read feed.md</a>.</p>';
    });
}

const fullFeed = document.querySelector("#feed");
if (fullFeed) renderFeed(fullFeed);
