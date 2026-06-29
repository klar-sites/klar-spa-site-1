const app = document.querySelector("#root");

async function go(path, push = true) {
  const file = `${path === "/" ? "/home" : path}`;

  const text = await fetch(file).then(r => r.text());

  const doc = new DOMParser().parseFromString(text, "text/html");
  const root = doc.querySelector("#root");

  app.replaceChildren(...root.children);

  if (push) {
    history.pushState({}, "", path);
  }

  setActive();
}

function setActive() {
  document.querySelectorAll("a").forEach(a =>
    a.classList.toggle("active", a.pathname === location.pathname)
  );
}

document.addEventListener("click", e => {
  const a = e.target.closest("a");
  if (!a || a.origin !== location.origin) return;

  e.preventDefault();
  go(a.pathname);
});

window.addEventListener("popstate", () => go(location.pathname, false));

// go(location.pathname, false);
