async function go(path, push = true, state = {}) {
  const app = document.querySelector("#vkn-root");

  const response = await fetch(path);
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);

  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const root = doc.getElementById("vkn-root");

  if (!root) {
    console.error("Couldn't find #vkn-root in fetched page.");
    console.log(html);
    return;
  }

  app.innerHTML = root.innerHTML;

  setActive();

  if (push) {
    // New navigation → always start at top
    history.pushState({ scrollY: 0 }, "", path);
    window.scrollTo(0, 0);
  } else {
    // Back/forward navigation → restore scroll
    window.scrollTo(0, state.scrollY || 0);
  }
}

function setActive() {
  document.querySelectorAll("a").forEach((a) => {
    a.classList.toggle("active", a.pathname === location.pathname);
  });
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a");

  if (
    !a ||
    a.origin !== location.origin ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey ||
    a.target === "_blank"
  ) {
    return;
  }

  e.preventDefault();

  // Save current scroll position before leaving page
  history.replaceState({ scrollY: window.scrollY }, "", location.pathname);

  go(a.pathname);
});

window.addEventListener("popstate", (e) => {
  go(location.pathname, false, e.state || {});
});

// Initial load: ensure state exists
history.replaceState({ scrollY: 0 }, "", location.pathname);
