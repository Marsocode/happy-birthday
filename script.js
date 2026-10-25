const config = window.BIRTHDAY_CONFIG || {};

const nameElement = document.getElementById("name");
const giftLink = document.getElementById("gift");
const flames = [...document.querySelectorAll(".flame")];

const instructions = document.querySelector(".instruction-line");
const surprise = document.getElementById("surprise");
const confetti = document.getElementById("confetti");
const resetButton = document.getElementById("reset");

// Персонализация
if (
  nameElement &&
  typeof config.name === "string" &&
  config.name.trim()
) {
  nameElement.textContent = `${config.name.trim()}!`;
}

// Ссылка на подарок
try {
  const url = new URL(config.giftUrl);

  if (url.protocol !== "https:") {
    throw new Error("Нужна HTTPS-ссылка");
  }

  giftLink.href = url.href;
} catch {
  giftLink.removeAttribute("href");
  giftLink.setAttribute("aria-disabled", "true");
  giftLink.textContent = "Подарок скоро появится ♡";
}

// Запоминаем исходные подписи для повторного запуска
const originalLabels = flames.map((flame) =>
  flame.getAttribute("aria-label")
);

function extinguish(flame) {
  if (flame.classList.contains("out")) {
    return;
  }

  flame.classList.add("out");
  flame.setAttribute("aria-pressed", "true");
  flame.setAttribute("aria-label", "Свеча потушена");

  const allExtinguished = flames.every((item) =>
    item.classList.contains("out")
  );

  if (allExtinguished) {
    if (instructions) {
      instructions.hidden = true;
    }

    surprise.hidden = false;
    celebrate();
  }
}

// Мышь, касания и клавиатура
flames.forEach((flame) => {
  flame.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") {
      extinguish(flame);
    }
  });

  flame.addEventListener("pointerdown", () => {
    extinguish(flame);
  });

  flame.addEventListener("click", () => {
    extinguish(flame);
  });
});

// Проведение пальцем через несколько свечей
document.querySelector(".candles")?.addEventListener(
  "pointermove",
  (event) => {
    if (!event.buttons) {
      return;
    }

    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    const flame = element?.closest(".flame");

    if (flame && flames.includes(flame)) {
      extinguish(flame);
    }
  }
);

// Повторное загадывание желания
resetButton.addEventListener("click", () => {
  flames.forEach((flame, index) => {
    flame.classList.remove("out");
    flame.setAttribute("aria-pressed", "false");
    flame.setAttribute(
      "aria-label",
      originalLabels[index] || `Потушить свечу ${index + 1}`
    );
  });

  confetti?.replaceChildren();

  if (instructions) {
    instructions.hidden = false;
  }

  surprise.hidden = true;
  flames[0]?.focus();
});

// Праздничное конфетти
function celebrate() {
  if (!confetti) {
    return;
  }

  confetti.replaceChildren();

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reduceMotion) {
    return;
  }

  const colors = [
    "#c7b7d5",
    "#e1aebf",
    "#bec7a6",
    "#eac995"
  ];

  for (let index = 0; index < 35; index++) {
    const piece = document.createElement("span");

    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.borderRadius = index % 2 ? "50%" : "1px";

    piece.addEventListener(
      "animationend",
      () => piece.remove(),
      { once: true }
    );

    confetti.appendChild(piece);
  }
}