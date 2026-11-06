const dos = document.querySelector("#dos");
const loading = document.querySelector("#loading");
const controls = document.querySelector("#controls");
const statusMessage = document.querySelector("#status");
const retry = document.querySelector("#retry");
const pause = document.querySelector("#pause");
let ci;
let paused = false;

retry.addEventListener("click", () => location.reload());

function isStartupPrompt(width, height, rgb, rgba) {
  const frame = rgb ?? rgba;
  if (!frame || width !== 320 || height !== 200) return false;

  // Fingerprint the fixed prompt text. The page numbers and blinking cursor
  // are below this band and can vary between runs.
  const stride = rgb ? 3 : 4;
  let hash = 2166136261;
  for (let pixel = 20 * width; pixel < 58 * width; pixel++) {
    const bright = frame[pixel * stride + 2] > 100;
    hash = Math.imul(hash ^ bright, 16777619);
  }
  return (hash >>> 0) === 0x77e75e20;
}

function finishStartup(commandInterface) {
  let ready = false;
  let attempts = 0;
  let retryAfter = 0;
  const fallback = setTimeout(showGame, 12000);

  function showGame() {
    clearTimeout(fallback);
    ready = true;
    loading.hidden = true;
    controls.disabled = false;
  }

  commandInterface.events().onFrame((rgb, rgba) => {
    const frame = rgb ?? rgba;
    if (ready || !frame) return;
    const matches = isStartupPrompt(commandInterface.width(), commandInterface.height(), rgb, rgba);
    if (!matches) {
      if (attempts > 0) showGame();
      return;
    }

    // Wait for the input cursor, which is drawn after the prompt text.
    const stride = rgb ? 3 : 4;
    if (frame[(179 * 320 + 83) * stride + 2] <= 100) return;
    const now = performance.now();
    if (attempts >= 3 || now < retryAfter) return;
    attempts++;
    retryAfter = now + 500;
    commandInterface.sendKeyEvent(257, true);
    setTimeout(() => commandInterface.sendKeyEvent(257, false), 120);
  });
}

function launch() {
  let player;
  let expired = false;
  const timeout = setTimeout(failed, 25000);

  function failed() {
    expired = true;
    clearTimeout(timeout);
    statusMessage.textContent = "알라딘을 불러오지 못했습니다. 연결을 확인해 주세요.";
    retry.hidden = false;
    player?.stop().catch(console.error);
  }

  try {
    player = window.Dos(dos, {
      url: new URL("./aladdin.jsdos?v=2", import.meta.url).href,
      pathPrefix: "https://v8.js-dos.com/8.xx/8.3.14/emulators/",
      backend: "dosbox",
      workerThread: true,
      offscreenCanvas: false,
      renderBackend: "canvas",
      renderAspect: "4/3",
      theme: "dark",
      autoStart: true,
      autoSave: false,
      kiosk: true,
      mouseCapture: false,
      onEvent(event, commandInterface) {
        if (event !== "ci-ready") return;
        if (expired) {
          commandInterface.exit().catch(console.error);
          return;
        }
        clearTimeout(timeout);
        ci = commandInterface;
        finishStartup(commandInterface);
      },
    });
    player.setNoCloud(true);
  } catch (error) {
    console.error(error);
    failed();
  }
}

// js-dos uses GLFW key codes. Track each finger independently so that
// directions can be held while jumping or attacking.
const held = new Map();

function release(pointerId) {
  const button = held.get(pointerId);
  if (!button) return;
  held.delete(pointerId);
  if ([...held.values()].includes(button)) return;
  ci.sendKeyEvent(Number(button.dataset.key), false);
  delete button.dataset.held;
}

function releaseAll() {
  for (const id of held.keys()) release(id);
}

for (const button of controls.querySelectorAll("[data-key]")) {
  const code = Number(button.dataset.key);
  button.addEventListener("pointerdown", (event) => {
    if (!ci || paused || event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (!button.hasAttribute("data-held")) ci.sendKeyEvent(code, true);
    held.set(event.pointerId, button);
    button.dataset.held = "";
  });

  for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(eventName, (event) => release(event.pointerId));
  }

  button.addEventListener("click", (event) => {
    if (ci && !paused && event.detail === 0) ci.simulateKeyPress(code);
  });
}

controls.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("blur", releaseAll);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) releaseAll();
});

pause.addEventListener("click", () => {
  releaseAll();
  paused = !paused;
  if (paused) ci.pause();
  else ci.resume();
  pause.setAttribute("aria-pressed", String(paused));
  pause.textContent = paused ? "재개" : "정지";
});

launch();
