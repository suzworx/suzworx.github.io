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
      const shown = limit ? posts.slice(0, limit) : posts;
      target.innerHTML =
        shown
          .map((post, i) => {
            const id = `post-${posts.length - i}`;
            const href = limit ? `feed.html#${id}` : `#${id}`;
            return `<article class="note" id="${limit ? "" : id}">${post.paragraphs.map((p) => `<p>${inline(p)}</p>`).join("")}<a class="note-date" href="${href}">${escapeHtml(dateLabel(post.date))}</a></article>`;
          })
          .join("") + (limit ? '<p class="feed-more"><a href="feed.html">See the full feed →</a></p>' : "");
      if (!limit && location.hash) document.querySelector(location.hash)?.scrollIntoView();
    })
    .catch(() => {
      target.innerHTML = '<p>Couldn’t load the feed. <a href="feed.md">Read feed.md</a>.</p>';
    });
}

const fullFeed = document.querySelector("#feed");
if (fullFeed) renderFeed(fullFeed);
