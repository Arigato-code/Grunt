/**
 * Shared enterprise nav + Solutions mega-menu (Signal Forge taxonomy).
 */
const SOLUTIONS = {
  industry: [
    { t: "Banking", d: "Lending risk, KYC, and treasury AI at regulated scale." },
    { t: "Insurance", d: "Claims triage, underwriting signals, and policy ops." },
    { t: "Healthcare", d: "Clinical decision support and multimodal workflows." },
    { t: "Logistics", d: "Demand graphs, routing, and inventory intelligence." },
    { t: "Government", d: "Sovereign models, audit trails, and public-sector AI." },
    { t: "Manufacturing", d: "Edge perception, quality, and plant autonomy." },
  ],
  function: [
    { t: "Marketing", d: "Growth systems, creative ops, attribution, and demand." },
    { t: "Revenue", d: "Pipeline intelligence, pricing, and deal acceleration." },
    { t: "Customer Ops", d: "Resolution agents, deflection, and lifetime value." },
    { t: "Risk & Fraud", d: "Real-time graphs, AML, and adversarial defense." },
    { t: "Engineering", d: "Platform, agents, migration, and inference meshes." },
    { t: "Legal & Compliance", d: "Contract review, controls, and evidence packs." },
  ],
  team: [
    { t: "AI & Automation", d: "Model fleets, eval harnesses, agent deployment." },
    { t: "Marketing & Growth", d: "Content engines, campaign systems, SEO/GEO." },
    { t: "Data & Analytics", d: "Feature stores, causal lift, decision science." },
    { t: "IT & Platform", d: "GPU schedulers, control planes, observability." },
    { t: "Security", d: "Threat graphs, red-team harnesses, RAI controls." },
    { t: "Transformation", d: "Operating model redesign with production AI." },
  ],
  role: [
    { t: "CIO", d: "Governance, control plane, and agent infrastructure." },
    { t: "CTO", d: "Sovereign AI and production architecture." },
    { t: "CMO", d: "Marketing OS — content, channels, and measurable demand." },
    { t: "CEO", d: "Outcome-tied transformation, not slideware AI." },
    { t: "Head of AI", d: "Eval gates, simulation, and fleet-scale deployment." },
    { t: "Managing Director", d: "Joint GTM, SI partnerships, and co-sell motion." },
  ],
};

function col(title, items, base = "/") {
  return `
    <div class="mega__col">
      <p class="mega__label">— ${title}</p>
      <ul>
        ${items
          .map(
            (i) => `
          <li>
            <a href="${base}#solutions">
              <strong>${i.t}</strong>
              <span>${i.d}</span>
            </a>
          </li>`
          )
          .join("")}
      </ul>
    </div>`;
};

export function mountNav({ home = "/", cases = "/#work", dock = "/#dock" } = {}) {
  const root = document.getElementById("site-nav");
  if (!root) return;

  root.innerHTML = `
    <div class="topbar">
      <p>Signal Forge ships production AI, ML, systems — and marketing engines that move revenue.</p>
      <a href="${dock}">Book a mission brief →</a>
    </div>
    <header class="nav">
      <a class="nav__brand" href="${home}">SIGNAL<span>FORGE</span></a>
      <nav class="nav__links" aria-label="Primary">
        <div class="nav__item has-mega">
          <button type="button" class="nav__trigger" aria-expanded="false" aria-controls="mega-solutions">
            Solutions
          </button>
          <div class="mega" id="mega-solutions" hidden>
            <div class="mega__panel">
              ${col("BY INDUSTRY", SOLUTIONS.industry, home)}
              ${col("BY FUNCTION", SOLUTIONS.function, home)}
              ${col("BY TEAM", SOLUTIONS.team, home)}
              ${col("BY ROLE", SOLUTIONS.role, home)}
            </div>
          </div>
        </div>
        <a href="${home}#capabilities">Capabilities</a>
        <a href="${cases}">Work</a>
        <a href="${home}#platform">Platform</a>
        <a href="${home}#marketing">Marketing</a>
      </nav>
      <div class="nav__actions">
        <a class="nav__ghost" href="${cases}">Case library</a>
        <a class="nav__cta" href="${dock}">Talk to us</a>
        <button type="button" class="nav__burger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </header>
    <div class="mobile-drawer" id="mobile-drawer" hidden>
      <a href="${home}#solutions">Solutions</a>
      <a href="${home}#capabilities">Capabilities</a>
      <a href="${home}#marketing">Marketing</a>
      <a href="${cases}">Work</a>
      <a href="${home}#platform">Platform</a>
      <a href="${dock}">Talk to us</a>
    </div>
  `;

  const trigger = root.querySelector(".nav__trigger");
  const mega = root.querySelector("#mega-solutions");
  const item = root.querySelector(".has-mega");
  const burger = root.querySelector(".nav__burger");
  const drawer = root.querySelector("#mobile-drawer");

  function closeMega() {
    if (!mega) return;
    mega.hidden = true;
    trigger?.setAttribute("aria-expanded", "false");
    item?.classList.remove("is-open");
  }

  function openMega() {
    mega.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    item.classList.add("is-open");
  }

  trigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    mega.hidden ? openMega() : closeMega();
  });

  item?.addEventListener("mouseenter", () => {
    if (window.matchMedia("(min-width: 961px)").matches) openMega();
  });
  item?.addEventListener("mouseleave", () => {
    if (window.matchMedia("(min-width: 961px)").matches) closeMega();
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) closeMega();
  });

  burger?.addEventListener("click", () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
  });
}
