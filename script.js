const app = document.querySelector("#root");

async function go(path) {
  const file = `${path === "/" ? "/home" : path}`;
  app.innerHTML = await fetch(file).then(r => r.text());
  history.pushState({}, "", path);
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

window.addEventListener("popstate", () => go(location.pathname));

// go(location.pathname);
