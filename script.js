history.scrollRestoration = "manual";

async function go(path, push = true, state = {}) {
  const app = document.querySelector("#root");

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const html = await response.text();

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

  // Optional: move keyboard focus to the new content
  app.focus?.();

  if (push) {
    history.pushState({ scrollY: 0 }, "", path);
    window.scrollTo(0, 0);
  } else {
    window.scrollTo(0, state.scrollY || 0);
  }
}

function setActive() {
  document.querySelectorAll("a").forEach((a) => {
    a.classList.toggle("active", a.pathname === location.pathname);
  });
}

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

  // Save current scroll position before leaving the page
  history.replaceState(
    { scrollY: window.scrollY },
    "",
    location.pathname + location.search
  );

  try {
    await go(a.pathname + a.search);
  } catch (err) {
    console.error(err);

    // Fall back to a normal page load
    location.href = a.href;
  }
});

window.addEventListener("popstate", (e) => {
  go(location.pathname + location.search, false, e.state || {});
});

// Initial history state
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

// setActive();