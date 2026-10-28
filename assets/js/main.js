/* Ryze Up — "Answers first" site script (no libraries) */

/* ===== SETTINGS: change these ===== */
const SETTINGS = {
  // Formspree form endpoint. Create a form at formspree.io and paste its URL here.
  formEndpoint: "https://formspree.io/f/xwllbvrn",
  // Trades the red word in the headline cycles through (the first shows on load)
  rotatingWords: ["businesses", "cafés", "salons", "barbers", "plumbers", "florists", "builders", "gift shops", "gyms"],
  rotateSeconds: 2.4
};
/* ================================== */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Header state ---- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---- Scroll reveals (CSS does the work where supported) ---- */
  document.querySelectorAll(".inc-list li, .project, .price-card, .addons, .about-copy, .contact-copy")
    .forEach((el) => el.classList.add("reveal"));

  /* ---- Rotating trade word in the headline (on its own line) ---- */
  const rot = document.getElementById("rot");
  if (rot && !reduceMotion && SETTINGS.rotatingWords.length > 1) {
    const words = SETTINGS.rotatingWords;
    let i = 0, timer = null;
    const next = () => {
      i = (i + 1) % words.length;
      const current = rot.querySelector(".rot-word:not(.is-out)");
      const incoming = document.createElement("span");
      incoming.className = "rot-word is-enter";
      incoming.textContent = words[i];
      rot.appendChild(incoming);
      current.classList.add("is-out");
      void incoming.offsetWidth;
      incoming.classList.remove("is-enter");
      setTimeout(() => current.remove(), 600);
    };
    const start = () => { if (!timer) timer = setInterval(next, SETTINGS.rotateSeconds * 1000); };
    const stop = () => { clearInterval(timer); timer = null; };
    // Only rotate while the headline is on screen and the tab is visible
    let onScreen = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { onScreen = es.some((e) => e.isIntersecting); onScreen && !document.hidden ? start() : stop(); }).observe(rot);
    } else start();
    document.addEventListener("visibilitychange", () => (document.hidden || !onScreen ? stop() : start()));
  }

  /* ---- Dotted globe that drifts slowly and points to Derbyshire ---- */
  const globeCanvas = document.getElementById("globe");
  if (globeCanvas && globeCanvas.getContext) {
  // Simplified coastlines as [lon, lat] rings. Land = inside an odd number of rings
  // (so the Black Sea and Caspian rings punch holes in Eurasia).
  const LAND = [
    // Great Britain
    [[-5.7,50.0],[-4.2,50.4],[-3.0,50.7],[-1.5,50.6],[0.3,50.8],[1.4,51.2],[1.6,52.1],[1.7,52.7],[0.3,53.4],[-0.2,54.0],[-1.2,54.6],[-1.6,55.6],[-2.1,56.0],[-2.8,56.2],[-1.8,57.5],[-3.3,58.6],[-5.0,58.6],[-5.7,57.5],[-6.2,56.6],[-5.6,55.4],[-5.0,54.8],[-3.4,54.9],[-3.2,54.1],[-3.0,53.4],[-4.6,53.3],[-4.2,52.8],[-4.1,52.3],[-5.2,51.8],[-4.2,51.5],[-3.0,51.5],[-4.5,51.2]],
    // Ireland
    [[-6.0,52.2],[-6.2,53.4],[-6.0,54.6],[-7.3,55.3],[-8.4,55.2],[-8.6,54.3],[-10.0,54.2],[-9.9,53.4],[-9.4,52.6],[-10.4,52.0],[-9.6,51.5],[-8.3,51.8],[-6.4,52.2]],
    // Iceland
    [[-22.0,64.0],[-21.5,65.5],[-18.0,66.2],[-15.0,66.3],[-13.6,65.2],[-14.5,64.4],[-18.0,63.4],[-21.0,63.8]],
    // Eurasia
    [[-5.6,36.0],[-2.0,36.7],[0.0,38.6],[0.2,40.2],[3.2,41.9],[3.0,43.2],[4.8,43.4],[7.5,43.8],[8.8,44.4],[10.5,43.0],[12.5,41.6],[15.6,40.0],[15.7,38.0],[16.6,38.4],[17.2,39.4],[18.5,40.1],[16.2,41.9],[13.5,43.6],[12.3,45.3],[13.7,45.6],[15.2,44.3],[17.4,43.0],[19.4,41.8],[19.5,40.4],[21.0,38.5],[22.0,37.0],[23.0,36.5],[23.2,38.0],[24.0,38.2],[22.9,40.6],[26.0,40.8],[26.2,39.5],[26.3,38.5],[27.3,37.0],[30.0,36.2],[32.0,36.4],[34.6,36.8],[36.1,36.7],[35.9,35.0],[35.0,32.8],[34.2,31.3],[34.9,29.5],[35.2,28.0],[37.0,25.5],[39.2,21.5],[41.0,18.5],[42.7,15.5],[43.4,12.7],[45.0,12.8],[48.6,14.0],[52.0,15.6],[55.0,17.0],[57.8,19.0],[59.8,22.4],[56.4,24.8],[56.4,26.3],[54.0,24.1],[51.6,24.3],[51.0,26.0],[50.1,26.4],[48.5,28.5],[48.5,29.9],[50.1,30.1],[51.5,27.8],[54.0,26.6],[56.4,27.1],[57.3,25.7],[61.6,25.1],[66.7,25.3],[68.7,22.7],[70.0,21.0],[72.6,22.0],[72.8,20.9],[73.0,18.0],[74.8,12.8],[76.3,9.9],[77.5,8.1],[79.9,10.3],[80.2,13.0],[82.3,16.6],[85.0,19.3],[86.9,20.6],[88.0,21.6],[90.5,22.0],[91.8,22.4],[92.3,20.7],[94.5,19.0],[94.3,16.0],[97.5,16.5],[98.6,12.0],[98.3,8.0],[100.3,5.5],[101.3,2.8],[103.4,1.4],[103.5,4.0],[100.5,7.0],[99.2,10.0],[100.0,13.4],[103.0,11.0],[104.5,10.5],[105.0,8.6],[109.2,11.6],[108.9,15.3],[105.6,18.7],[106.5,20.0],[108.5,21.6],[110.4,21.0],[113.6,22.3],[117.0,23.6],[120.0,26.5],[122.0,29.8],[121.9,30.9],[121.0,32.0],[119.2,34.6],[120.5,36.0],[122.5,37.0],[119.0,37.2],[117.6,38.5],[118.0,39.2],[121.0,40.8],[121.5,39.2],[125.0,39.5],[126.3,37.0],[126.6,34.5],[129.4,36.0],[128.0,38.5],[129.6,41.0],[131.5,42.6],[135.0,43.4],[138.0,45.0],[141.0,48.0],[140.0,52.0],[135.0,54.6],[142.0,59.2],[150.0,59.4],[156.0,57.5],[156.5,51.0],[162.0,55.0],[163.0,59.8],[170.0,60.0],[177.0,62.5],[180.0,65.0],[180.0,69.0],[170.0,69.8],[160.0,69.6],[150.0,71.4],[140.0,72.5],[129.0,72.5],[120.0,73.0],[113.0,73.6],[105.0,77.6],[100.0,76.5],[87.0,74.5],[80.0,72.5],[73.0,72.8],[69.0,72.8],[66.0,69.4],[58.0,68.9],[53.0,68.5],[44.0,68.4],[40.5,67.6],[33.0,69.3],[31.0,70.0],[28.5,70.9],[25.8,71.0],[21.0,70.0],[17.0,69.0],[14.5,67.8],[12.0,65.5],[10.0,64.0],[7.0,62.8],[5.0,61.5],[5.6,58.9],[8.0,58.1],[10.5,59.0],[11.0,58.9],[12.9,55.6],[14.2,55.4],[15.9,56.1],[16.5,57.0],[18.7,59.2],[19.0,59.9],[17.3,61.0],[18.0,62.5],[21.0,64.0],[22.0,65.6],[24.0,65.8],[25.4,65.0],[21.4,62.0],[22.0,60.5],[25.0,60.2],[30.2,59.9],[28.0,59.5],[23.4,59.2],[24.4,58.4],[23.5,57.0],[21.0,56.8],[21.2,55.2],[18.5,54.8],[14.2,53.9],[12.5,54.4],[10.9,54.4],[10.6,56.2],[10.3,57.6],[8.1,56.8],[8.6,55.4],[8.6,53.9],[6.0,53.5],[4.6,52.9],[3.6,51.5],[2.5,51.1],[1.6,50.2],[0.2,49.5],[-1.3,49.6],[-1.6,48.7],[-4.6,48.2],[-2.5,47.3],[-1.2,46.2],[-1.2,44.6],[-1.8,43.4],[-4.0,43.5],[-8.0,43.7],[-9.2,43.2],[-8.8,42.0],[-9.3,38.7],[-9.0,37.0],[-6.3,36.7]],
    // Black Sea and Caspian (holes)
    [[28.0,41.6],[29.0,41.1],[31.5,41.2],[35.0,42.0],[38.0,41.0],[41.5,41.5],[41.7,42.6],[39.9,44.0],[37.5,44.7],[35.5,45.0],[33.6,44.5],[32.6,45.4],[31.0,46.6],[30.0,45.8],[28.7,44.4],[28.0,43.0]],
    [[47.0,44.5],[49.5,46.5],[53.0,47.0],[53.0,45.0],[51.0,44.5],[52.5,42.0],[53.0,40.0],[54.0,37.5],[51.0,36.7],[49.0,37.6],[49.5,40.3],[47.5,42.0]],
    // Sicily, Sardinia, Corsica, Crete, Cyprus
    [[12.4,38.1],[15.6,38.3],[15.1,36.7],[12.4,37.8]],
    [[8.4,41.0],[9.8,41.0],[9.6,39.2],[8.4,39.0]],
    [[8.6,42.4],[9.5,42.9],[9.4,41.4],[8.8,41.6]],
    [[23.5,35.3],[26.3,35.2],[26.0,35.0],[24.0,35.0]],
    [[32.3,35.1],[34.6,35.6],[34.0,34.6],[32.6,34.7]],
    // Africa
    [[-5.9,35.8],[-2.0,35.1],[3.0,36.8],[10.0,37.3],[11.1,36.8],[10.2,34.5],[11.2,33.2],[15.2,32.3],[19.9,30.9],[20.1,32.2],[23.0,32.6],[25.2,31.6],[29.0,30.9],[32.3,31.3],[34.2,31.2],[34.9,29.5],[33.6,27.5],[35.5,24.0],[37.2,21.0],[38.6,18.0],[39.6,15.5],[41.7,13.5],[43.3,12.0],[44.8,10.4],[51.1,11.8],[51.0,10.4],[49.0,6.0],[46.0,2.0],[43.0,-0.6],[40.3,-2.6],[39.2,-4.7],[38.8,-6.5],[40.4,-10.5],[40.6,-15.0],[36.9,-17.9],[35.2,-21.5],[35.5,-24.0],[32.9,-26.0],[32.5,-28.6],[30.0,-31.3],[27.0,-33.7],[22.6,-34.0],[20.0,-34.8],[18.4,-33.9],[17.9,-31.5],[15.2,-27.1],[14.4,-22.9],[12.0,-18.0],[11.8,-15.8],[13.7,-10.8],[13.2,-8.6],[12.2,-6.0],[11.8,-3.0],[9.4,0.0],[9.6,3.8],[8.9,4.6],[5.9,4.3],[4.5,6.3],[1.1,6.0],[-2.0,4.8],[-4.6,5.2],[-7.6,4.4],[-11.4,6.8],[-13.3,8.5],[-15.2,11.2],[-16.7,12.4],[-17.5,14.7],[-16.5,16.2],[-16.1,19.6],[-17.0,21.0],[-14.9,24.7],[-12.9,27.9],[-10.0,29.7],[-9.8,31.4],[-6.8,34.0]],
    // Madagascar
    [[49.4,-12.0],[50.4,-15.5],[49.4,-17.5],[47.2,-25.0],[45.0,-25.4],[43.6,-22.0],[44.0,-17.0],[47.0,-15.0]],
    // North America
    [[-168,65.5],[-161,70.3],[-156,71.3],[-141,69.6],[-128,70.0],[-117,68.9],[-108,68.3],[-95,68.0],[-90,68.3],[-82,69.0],[-81,66.0],[-87,64.0],[-94,59.0],[-92,57.0],[-82,55.0],[-80,51.0],[-78.5,53.5],[-78,58.5],[-77.5,62.4],[-73,62.0],[-69,60.0],[-64.5,60.3],[-61.0,56.0],[-56.0,52.5],[-60.0,50.2],[-66.0,50.2],[-64.5,48.9],[-65.0,47.0],[-61.0,46.0],[-60.0,45.6],[-63.6,44.6],[-66.0,44.5],[-70.0,43.7],[-70.6,42.0],[-74.0,40.6],[-75.5,38.5],[-76.0,37.0],[-75.5,35.3],[-77.0,34.6],[-79.0,33.0],[-81.4,30.7],[-80.1,26.0],[-81.0,25.2],[-82.6,27.8],[-83.7,29.9],[-86.0,30.4],[-89.6,30.2],[-89.4,29.1],[-94.0,29.6],[-97.4,27.5],[-97.7,22.0],[-96.0,19.0],[-94.5,18.2],[-91.0,18.6],[-90.4,21.0],[-87.0,21.5],[-87.6,18.5],[-88.5,16.0],[-84.0,15.8],[-83.4,12.0],[-83.7,10.8],[-82.0,9.0],[-79.5,9.6],[-77.4,8.6],[-78.4,7.6],[-80.0,7.4],[-81.6,7.8],[-85.7,10.0],[-87.5,13.0],[-91.0,13.9],[-94.0,16.0],[-96.5,15.7],[-100.0,17.0],[-105.0,19.5],[-105.5,22.5],[-109.5,23.2],[-112.1,26.0],[-114.7,30.2],[-117.1,32.5],[-118.5,34.0],[-120.6,34.6],[-122.5,37.5],[-124.2,40.4],[-124.0,46.0],[-124.7,48.4],[-123.0,49.0],[-127.0,50.7],[-130.0,54.5],[-135.0,58.0],[-140.0,59.8],[-146.0,60.6],[-152.0,58.0],[-158.0,56.0],[-165.0,54.5],[-158.0,58.5],[-162.0,60.0],[-165.0,62.5],[-164.5,64.5]],
    // Greenland, Baffin Island, Newfoundland, Cuba
    [[-73.0,78.0],[-60.0,82.0],[-30.0,83.5],[-20.0,82.0],[-18.0,77.0],[-21.0,72.0],[-24.0,69.5],[-33.0,68.0],[-40.0,65.0],[-43.0,60.0],[-48.0,61.0],[-52.0,64.5],[-54.0,69.0],[-56.0,72.5],[-66.0,76.0]],
    [[-80,73.5],[-68,70.5],[-62,66.5],[-66,62.5],[-73,64.5],[-78,64.5],[-80,68]],
    [[-59.5,47.6],[-55.5,51.6],[-52.7,47.6],[-55.0,46.8]],
    [[-85.0,21.9],[-79.5,23.2],[-74.2,20.2],[-77.5,19.9],[-82.0,22.3]],
    // South America
    [[-77.4,8.6],[-75.5,10.6],[-71.6,12.4],[-68.0,10.8],[-63.0,10.7],[-61.0,9.0],[-57.0,6.0],[-52.0,4.8],[-50.0,1.8],[-48.5,-1.0],[-44.0,-2.6],[-40.0,-2.9],[-35.2,-5.4],[-34.9,-8.0],[-37.0,-11.0],[-39.0,-15.0],[-39.7,-19.5],[-41.0,-22.0],[-44.0,-23.2],[-48.5,-26.0],[-48.8,-28.6],[-53.0,-33.7],[-57.5,-38.0],[-62.0,-39.0],[-65.0,-41.0],[-64.5,-42.8],[-67.5,-46.0],[-65.8,-47.8],[-68.0,-50.5],[-69.0,-52.5],[-68.3,-55.0],[-71.0,-54.0],[-74.5,-50.0],[-75.4,-46.5],[-73.6,-42.0],[-73.4,-37.0],[-71.5,-32.0],[-71.3,-25.0],[-70.2,-18.5],[-75.2,-15.3],[-79.0,-8.0],[-81.2,-5.2],[-80.0,-2.5],[-80.0,0.8],[-78.9,1.6],[-77.3,4.0]],
    // Australia, New Zealand, Japan, Indonesia, New Guinea
    [[113.6,-22.0],[114.2,-26.0],[115.0,-34.0],[117.9,-35.1],[123.5,-33.9],[126.0,-32.3],[131.0,-31.5],[135.0,-34.8],[137.8,-32.6],[138.0,-35.6],[140.0,-37.8],[143.5,-38.8],[146.3,-39.1],[150.0,-37.5],[151.3,-33.9],[153.1,-30.0],[153.0,-25.0],[150.8,-22.6],[146.3,-19.0],[145.4,-15.0],[142.5,-10.7],[141.5,-13.0],[141.6,-17.0],[140.0,-17.7],[136.5,-15.6],[136.8,-12.3],[132.5,-11.4],[129.5,-14.9],[126.0,-14.0],[122.2,-17.5],[121.0,-19.5]],
    [[172.6,-34.4],[178.5,-37.7],[176.0,-41.5],[174.0,-41.5],[172.0,-40.5]],
    [[172.8,-40.5],[174.3,-41.7],[171.0,-44.5],[169.0,-46.6],[166.5,-46.0],[168.0,-44.0]],
    [[130.0,31.3],[131.4,31.4],[132.0,33.9],[135.0,33.6],[136.9,34.5],[139.8,35.0],[140.9,36.0],[141.0,38.3],[142.0,39.5],[141.5,41.4],[140.0,40.7],[139.7,38.0],[137.0,37.0],[135.5,35.5],[132.6,35.4],[131.0,34.0]],
    [[141.0,41.8],[140.0,43.0],[141.6,45.4],[145.5,43.3],[143.2,42.0]],
    [[95.3,5.6],[98.0,4.0],[104.0,-1.0],[106.0,-5.8],[102.0,-4.0],[98.7,0.5]],
    [[109.0,1.5],[111.0,-3.0],[116.0,-4.0],[118.5,1.0],[117.0,7.0],[113.0,3.0]],
    [[105.2,-6.8],[114.4,-8.7],[112.0,-6.8],[106.0,-5.9]],
    [[131.0,-1.0],[141.0,-2.6],[150.5,-10.5],[143.0,-9.0],[138.0,-8.4],[134.0,-4.0]],
    [[79.9,9.8],[81.9,7.5],[81.2,6.2],[80.0,6.0]],
    [[120.0,18.5],[122.3,18.4],[124.0,12.5],[126.4,7.3],[125.0,6.0],[122.0,7.0],[121.0,14.5]]
  ];
  const inRing = (lon, lat, ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const isLand = (lon, lat) => {
    if (lat < -66) return true; // Antarctica
    let n = 0;
    for (const r of LAND) if (inRing(lon, lat, r)) n++;
    return n % 2 === 1;
  };
    const ctx = globeCanvas.getContext("2d");
    const pin = document.getElementById("globe-pin");
    const HOME = { lat: 52.92, lon: -1.48 };   // Derby
    const TILT = 24;                             // how far the globe leans towards us (degrees)
    const SWAY = 38;                             // how far it drifts east/west of England (degrees)
    const PERIOD = 80;                           // seconds for one full drift back and forth
    const rad = Math.PI / 180;

    // Evenly spread points over the sphere, keep the ones on land
    const dots = [];
    const N = 44000, golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      const lat = Math.asin(y) / rad;
      let lon = Math.atan2(Math.sin(th) * r, Math.cos(th) * r) / rad;
      const inUK = lat > 49.6 && lat < 59.2 && lon > -10.8 && lon < 2;
      if (!inUK && isLand(lon, lat)) dots.push([lat * rad, lon * rad, 0]);
    }
    // A finer, bolder pattern for the British Isles so "home" stands out
    for (let lat = 49.8; lat < 59.1; lat += 0.42) {
      for (let lon = -10.6; lon < 1.9; lon += 0.42 / Math.cos(lat * rad)) {
        if (isLand(lon, lat)) dots.push([lat * rad, lon * rad, 1]);
      }
    }

    let W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
    const size = () => {
      const r = globeCanvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      globeCanvas.width = Math.round(W * dpr); globeCanvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = W / 2 - 2; cx = W / 2; cy = W / 2;
    };

    const project = (phi, lam, lam0, phi0) => {
      const cosphi = Math.cos(phi), dl = lam - lam0;
      const x = cosphi * Math.sin(dl);
      const y = Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * cosphi * Math.cos(dl);
      const z = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * cosphi * Math.cos(dl);
      return [cx + R * x, cy - R * y, z];
    };

    const draw = (centerLon) => {
      const lam0 = centerLon * rad, phi0 = TILT * rad;
      ctx.clearRect(0, 0, W, H);
      // soft disc + rim
      const g = ctx.createRadialGradient(cx - R * .3, cy - R * .35, R * .1, cx, cy, R);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(243,238,240,1)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(17,17,24,.10)"; ctx.lineWidth = 1; ctx.stroke();
      // graticule
      ctx.strokeStyle = "rgba(17,17,24,.07)";
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath(); let started = false;
        for (let lat = -90; lat <= 90; lat += 3) {
          const [x, y, z] = project(lat * rad, lon * rad, lam0, phi0);
          if (z > 0) { started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; } else started = false;
        }
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath(); let started = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const [x, y, z] = project(lat * rad, lon * rad, lam0, phi0);
          if (z > 0) { started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true; } else started = false;
        }
        ctx.stroke();
      }
      // land dots
      const s = Math.max(1.1, R / 200);
      for (let i = 0; i < dots.length; i++) {
        const [x, y, z] = project(dots[i][0], dots[i][1], lam0, phi0);
        if (z <= 0.02) continue;
        const home = dots[i][2] === 1, d = home ? s * 1.15 : s;
        ctx.fillStyle = home ? "#b2002d" : `rgba(218,0,55,${(0.4 + 0.6 * z).toFixed(3)})`;
        ctx.fillRect(x - d / 2, y - d / 2, d, d);
      }
      // home pin
      const [px, py, pz] = project(HOME.lat * rad, HOME.lon * rad, lam0, phi0);
      if (pin) {
        pin.style.transform = `translate(${px}px, ${py}px)`;
        pin.style.opacity = pz > 0.15 ? "1" : "0";
        // Keep the label on screen: put it on whichever side of the pin has room
        const card = pin.querySelector(".gp-card");
        if (card) {
          const wrapLeft = globeCanvas.parentElement.getBoundingClientRect().left;
          const need = card.offsetWidth + 40;
          const roomRight = window.innerWidth - (wrapLeft + px) - 12;
          const roomLeft = wrapLeft + px - 12;
          const left = pin.classList.contains("is-left");
          if (!left && roomRight < need && roomLeft > roomRight) pin.classList.add("is-left");
          else if (left && roomRight >= need + 30) pin.classList.remove("is-left");
        }
      }
    };

    let start = performance.now(), raf = 0, visible = true;
    const centerAt = (t) => HOME.lon + SWAY * Math.sin(((t - start) / 1000) * (2 * Math.PI / PERIOD));
    const loop = (t) => { draw(centerAt(t)); raf = visible ? requestAnimationFrame(loop) : 0; };
    size();
    if (reduceMotion) draw(HOME.lon + 4);
    else {
      start -= PERIOD * 1000 * 0.04;   // begin just west of England so it drifts into place
      raf = requestAnimationFrame(loop);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((es) => {
          visible = es.some((e) => e.isIntersecting);
          if (visible && !raf) raf = requestAnimationFrame(loop);
        }).observe(globeCanvas);
      }
    }
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { size(); if (reduceMotion) draw(HOME.lon + 4); }, 120); });
  }

  /* ---- Jump bar: highlight the section in view ---- */
  const jumpLinks = [...document.querySelectorAll(".jump a")];
  if (jumpLinks.length && "IntersectionObserver" in window) {
    const map = new Map(jumpLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const seen = new Map();
    const pick = () => {
      let best = null, bestTop = Infinity;
      seen.forEach((top, id) => { if (top < bestTop) { bestTop = top; best = id; } });
      jumpLinks.forEach((a) => a.classList.toggle("is-active", a === map.get(best)));
      const active = map.get(best);
      if (active) {
        const bar = active.parentElement;
        const l = active.offsetLeft, r = l + active.offsetWidth;
        if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollTo({ left: Math.max(0, l - 16), behavior: reduceMotion ? "auto" : "smooth" });
      }
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) seen.set(e.target.id, e.boundingClientRect.top); else seen.delete(e.target.id); });
      pick();
    }, { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---- Package buttons pre-select the form ---- */
  const need = document.getElementById("f-need");
  document.querySelectorAll("[data-package]").forEach((btn) => {
    btn.addEventListener("click", () => { if (need) need.value = btn.dataset.package; });
  });

  /* ---- Placeholder links: don't jump to top ---- */
  document.querySelectorAll('a[data-placeholder][href="#"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });

  /* ---- Contact form ---- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    const submit = document.getElementById("f-submit");
    const fields = {
      name: document.getElementById("f-name"),
      contact: document.getElementById("f-contact")
    };

    const setError = (input, msg) => {
      const wrap = input.closest(".field");
      const err = document.getElementById(input.id + "-err");
      wrap.classList.toggle("has-error", Boolean(msg));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) {
        err.textContent = msg || "";
        err.hidden = !msg;
        if (msg) input.setAttribute("aria-describedby", err.id); else input.removeAttribute("aria-describedby");
      }
    };

    const check = {
      name: (v) => (v.trim().length < 2 ? "Please enter your name so I know who to reply to." : ""),
      contact: (v) => {
        const s = v.trim();
        if (!s) return "Please add a phone number or email address so I can reply.";
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
        const digits = s.replace(/[^\d]/g, "");
        const isPhone = /^[\d\s()+-]+$/.test(s) && digits.length >= 10 && digits.length <= 15;
        return isEmail || isPhone ? "" : "That doesn't look like a phone number or email. Check for typos, e.g. 07123 456789 or name@business.co.uk.";
      }
    };

    Object.entries(fields).forEach(([key, input]) => {
      input.addEventListener("blur", () => { if (input.value) setError(input, check[key](input.value)); });
      input.addEventListener("input", () => { if (input.closest(".field").classList.contains("has-error")) setError(input, check[key](input.value)); });
    });

    const showStatus = (msg, kind) => {
      status.textContent = msg;
      status.className = "form-status " + (kind || "");
      status.hidden = false;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let firstBad = null;
      Object.entries(fields).forEach(([key, input]) => {
        const msg = check[key](input.value);
        setError(input, msg);
        if (msg && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      if (SETTINGS.formEndpoint.includes("YOUR_FORM_ID")) {
        showStatus("The form isn't connected yet, so nothing was sent. Please call or email instead.", "bad");
        return;
      }

      submit.disabled = true;
      const label = submit.firstChild.textContent;
      submit.firstChild.textContent = "Sending… ";
      try {
        const data = new FormData(form);
        // If they gave an email, Formspree sets it as the reply-to so you can just hit Reply
        const contact = (data.get("contact") || "").toString().trim();
        if (contact.includes("@")) data.append("email", contact);
        const res = await fetch(SETTINGS.formEndpoint, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.errors ? body.errors.map((x) => x.message).join(" ") : res.status);
        }
        form.reset();
        showStatus("Thanks, your message is on its way. I'll get back to you soon.", "ok");
      } catch (err) {
        showStatus("Your message didn't send. Check your connection and try again, or call or email instead.", "bad");
      } finally {
        submit.disabled = false;
        submit.firstChild.textContent = label;
      }
    });
  }
  /* ---- How it works: cycle through the four steps while on screen ---- */
  const steps = document.getElementById("steps");
  const track = document.getElementById("steps-track");
  if (steps && !reduceMotion && "IntersectionObserver" in window) {
    const items = [...steps.children];
    const STEP_MS = 3200;           // time each step stays highlighted
    let i = -1, timer = null, onScreen = false, hovering = false;
    steps.classList.add("is-anim");
    if (track) track.classList.add("is-on");
    const show = (n) => {
      i = n;
      items.forEach((li, k) => li.classList.toggle("is-active", k === n));
      if (track) track.style.setProperty("--p", (n + 1) / items.length);
    };
    const tick = () => show((i + 1) % items.length);
    const start = () => { if (timer || hovering) return; if (i < 0) show(0); timer = setInterval(tick, STEP_MS); };
    const stop = () => { clearInterval(timer); timer = null; };
    // On phones the cards stack, so highlight whichever card is in the middle of the screen instead of cycling
    const stacked = window.matchMedia("(max-width: 760px)");
    new IntersectionObserver((es) => {
      onScreen = es.some((e) => e.isIntersecting);
      onScreen && !document.hidden && !stacked.matches ? start() : stop();
    }, { threshold: 0.35 }).observe(steps);
    const midIO = new IntersectionObserver((es) => {
      if (!stacked.matches) return;
      es.forEach((e) => { if (e.isIntersecting && items.indexOf(e.target) !== i) show(items.indexOf(e.target)); });
    }, { rootMargin: "-40% 0px -40% 0px" });
    items.forEach((li) => midIO.observe(li));
    stacked.addEventListener("change", () => { stop(); if (!stacked.matches && onScreen) start(); });
    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : onScreen && !stacked.matches && start(); });
    // Pointing at a card highlights it and pauses the cycle
    items.forEach((li, k) => li.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      hovering = true; stop(); if (k !== i) show(k);
    }));
    steps.addEventListener("pointerleave", (e) => { if (e.pointerType !== "mouse") return; hovering = false; if (onScreen && !stacked.matches) start(); });
  }
  /* ---- Common questions: brief "typing…" before each answer appears ---- */
  document.querySelectorAll(".chat-body details").forEach((d) => {
    let t;
    d.addEventListener("toggle", () => {
      clearTimeout(t);
      if (!d.open || reduceMotion) { d.classList.remove("is-typing"); return; }
      d.classList.add("is-typing");
      t = setTimeout(() => d.classList.remove("is-typing"), 700);
    });
  });
  /* ---- Keep "Live in 2–3 weeks" on one line: shrink the text only as much as needed ---- */
  const timeBig = document.querySelector(".ans-time .ans-big");
  if (timeBig) {
    const fit = () => {
      timeBig.style.fontSize = "";
      let fs = parseFloat(getComputedStyle(timeBig).fontSize);
      while (timeBig.scrollWidth > timeBig.clientWidth + 1 && fs > 11) { fs -= 0.5; timeBig.style.fontSize = fs + "px"; }
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    let ft; window.addEventListener("resize", () => { clearTimeout(ft); ft = setTimeout(fit, 100); });
  }
})();
