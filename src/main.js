import "./style.css";
import { mountNav } from "./nav.js";
import { initMotion } from "./motion.js";

const isHome = Boolean(document.getElementById("webgl"));
const base = isHome ? "/" : "/";

mountNav({
  home: "/",
  cases: isHome ? "/#work" : "/#work",
  dock: isHome ? "/#dock" : "/#dock",
});

let sceneApi = null;
initMotion((p) => sceneApi?.setScrollProgress(p));

if (isHome) {
  const canvas = document.getElementById("webgl");
  const boot = () => {
    import("./scene.js")
      .then(({ createScene }) => {
        try {
          sceneApi = createScene(canvas);
        } catch (err) {
          console.warn("WebGL unavailable:", err);
          document.body.classList.add("is-reduced");
          canvas?.remove();
        }
      })
      .catch((err) => {
        console.warn("Scene failed:", err);
        document.body.classList.add("is-reduced");
        canvas?.remove();
      });
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(boot, { timeout: 400 });
  } else {
    requestAnimationFrame(() => setTimeout(boot, 50));
  }
}
