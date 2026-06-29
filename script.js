history.scrollRestoration = "manual";

const cache = new Map();

async function fetchPage(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }

  const promise = fetch(path).then(async (response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return response.text();
  });

  cache.set(path, promise);

  return promise;
}

async function go(path, push = true, state = {}) {
  const app = document.querySelector("#root");

  const html = await fetchPage(path);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  document.title = doc.title;

  const root = doc.getElementById("root");

  if (!root) {
    console.error("Couldn't find #root in fetched page.");
    return;
  }

  app.innerHTML = root.innerHTML;

  setActive();

  app.focus?.();

  if (push) {
    history.pushState({ scrollY: 0 }, "", path);
    window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, state.scrollY || 0);
  }
}

// Prefetch pages when hovering links
document.addEventListener("pointerenter", (e) => {
  const a = e.target.closest("a");

  if (
    !a ||
    a.origin !== location.origin ||
    a.target === "_blank" ||
    a.hasAttribute("download")
  ) {
    return;
  }

  fetchPage(a.pathname + a.search).catch(() => {});
}, true);

document.addEventListener("click", async (e) => {
  const a = e.target.closest("a");

  if (
    !a ||
    a.origin !== location.origin ||
    a.target === "_blank" ||
    a.hasAttribute("download") ||
    e.defaultPrevented ||
    e.button !== 0 ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey ||
    e.altKey
  ) {
    return;
  }

  e.preventDefault();

  history.replaceState(
    { scrollY: window.scrollY },
    "",
    location.pathname + location.search
  );

  try {
    await go(a.pathname + a.search);
  } catch (err) {
    console.error(err);
    location.href = a.href;
  }
});

window.addEventListener("popstate", (e) => {
  go(location.pathname + location.search, false, e.state || {});
});

history.replaceState(
  { scrollY: window.scrollY },
  "",
  location.pathname + location.search
);

function setActive() {
  document.querySelectorAll("a").forEach((a) => {
    a.classList.toggle("active", a.pathname === location.pathname);
  });
}