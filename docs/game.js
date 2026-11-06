const dos = document.querySelector("#dos");
const loading = document.querySelector("#loading");
const controls = document.querySelector("#controls");
const statusMessage = document.querySelector("#status");
const retry = document.querySelector("#retry");
const pause = document.querySelector("#pause");
const keyboard = document.querySelector("#keyboard");
const textForm = document.querySelector("#dos-text");
const word = document.querySelector("#dos-word");

let ci;
let paused = false;

retry.addEventListener("click", () => location.reload());

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
      url: new URL("./aladdin.jsdos?v=1", import.meta.url).href,
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
        loading.hidden = true;
        controls.disabled = false;
        keyboard.hidden = false;
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

for (const eventName of ["keydown", "keyup", "keypress"]) {
  textForm.addEventListener(eventName, (event) => event.stopPropagation());
}

textForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!ci || paused || word.readOnly) return;
  const letters = word.value.toUpperCase();
  word.readOnly = true;
  word.blur();
  for (const letter of letters) {
    ci.simulateKeyPress(letter.charCodeAt(0));
    await new Promise((resolve) => setTimeout(resolve, 160));
  }
  ci.simulateKeyPress(257);
  word.value = "";
  word.readOnly = false;
});

launch();
