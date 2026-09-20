import "./style.css";
import { mountNav } from "./nav.js";
import { initMotion } from "./motion.js";

mountNav({
  home: "/",
  cases: "/#work",
  dock: "/#dock",
});

initMotion();
