const recipes = {
  "アメリカーノ": ["エスプレッソ", "お湯"],
  "アイスアメリカーノ": ["エスプレッソ", "お湯", "氷"],
  "カフェラテ": ["エスプレッソ", "牛乳"],
  "アイスカフェラテ": ["エスプレッソ", "牛乳", "氷"],
};

const baseIngredients = ["エスプレッソ", "お湯", "牛乳", "氷"];
const customIngredients = ["バニラ", "キャラメル", "ホイップ", "チョコ"];
const allIngredients = [...baseIngredients, ...customIngredients];

const ingredientColors = {
  "エスプレッソ": "rgb(100, 55, 30)",
  "お湯": "rgb(220, 80, 70)",
  "牛乳": "rgb(255, 255, 245)",
  "氷": "rgb(115, 210, 240)",
  "バニラ": "rgb(255, 232, 135)",
  "キャラメル": "rgb(205, 128, 54)",
  "ホイップ": "rgb(255, 255, 250)",
  "チョコ": "rgb(72, 38, 26)",
};

const difficultyTimes = {
  Easy: 90,
  Normal: 60,
  Hard: 45,
};

let scene = "title";
let difficulty = "Normal";
let currentOrder = "";
let currentCustoms = [];
let selectedIngredients = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let remainingTime = difficultyTimes[difficulty];
let timerId = null;
let feedbackTimerId = null;

const screens = {
  title: document.querySelector("#titleScreen"),
  game: document.querySelector("#gameScreen"),
  menu: document.querySelector("#menuScreen"),
  rule: document.querySelector("#ruleScreen"),
  result: document.querySelector("#resultScreen"),
};

const scoreText = document.querySelector("#scoreText");
const comboText = document.querySelector("#comboText");
const timerText = document.querySelector("#timerText");
const orderText = document.querySelector("#orderText");
const customText = document.querySelector("#customText");
const ingredientButtons = document.querySelector("#ingredientButtons");
const recipeList = document.querySelector("#recipeList");
const feedback = document.querySelector("#feedback");
const finalScoreText = document.querySelector("#finalScoreText");
const maxComboText = document.querySelector("#maxComboText");
const correctSound = document.querySelector("#correctSound");
const wrongSound = document.querySelector("#wrongSound");

function setAppHeight() {
  const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeNewOrder() {
  currentOrder = randomItem(Object.keys(recipes));

  const customCount = Math.floor(Math.random() * 3);
  const shuffled = [...customIngredients].sort(() => Math.random() - 0.5);
  currentCustoms = shuffled.slice(0, customCount);
}

function resetGame() {
  makeNewOrder();
  selectedIngredients = [];
  score = 0;
  combo = 0;
  maxCombo = 0;
  remainingTime = difficultyTimes[difficulty];
  hideFeedback();
  startTimer();
  updateView();
}

function showScene(nextScene) {
  scene = nextScene;

  for (const name in screens) {
    screens[name].classList.toggle("hidden", name !== scene);
  }

  if (scene !== "game") {
    stopTimer();
  }
}

function startTimer() {
  stopTimer();

  timerId = setInterval(() => {
    remainingTime -= 1;

    if (remainingTime <= 0) {
      remainingTime = 0;
      showResult();
    }

    updateView();
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function toggleIngredient(name) {
  if (selectedIngredients.includes(name)) {
    selectedIngredients = selectedIngredients.filter((item) => item !== name);
  } else {
    selectedIngredients.push(name);
  }

  updateView();
}

function serveDrink() {
  const correctRecipe = [...recipes[currentOrder], ...currentCustoms].sort();
  const selectedRecipe = [...selectedIngredients].sort();
  const isCorrect = correctRecipe.join(",") === selectedRecipe.join(",");

  if (isCorrect) {
    combo += 1;
    maxCombo = Math.max(maxCombo, combo);
    score += combo;
    remainingTime += 1;
    showFeedback(`正解！ コンボ x${combo} +1秒`, "rgb(40, 130, 70)");
    playSound(correctSound);
  } else {
    combo = 0;
    showFeedback("ちがうよ！", "rgb(190, 55, 45)");
    playSound(wrongSound);
  }

  makeNewOrder();
  selectedIngredients = [];
  updateView();
}

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function showFeedback(text, color) {
  feedback.textContent = text;
  feedback.style.color = color;
  feedback.classList.remove("hidden");
  feedback.classList.add("show");

  if (feedbackTimerId !== null) {
    clearTimeout(feedbackTimerId);
  }

  feedbackTimerId = setTimeout(() => {
    hideFeedback();
  }, 850);
}

function hideFeedback() {
  feedback.classList.remove("show");
  feedback.classList.add("hidden");
  feedback.textContent = "";

  if (feedbackTimerId !== null) {
    clearTimeout(feedbackTimerId);
    feedbackTimerId = null;
  }
}

function showResult() {
  stopTimer();
  finalScoreText.textContent = score;
  maxComboText.textContent = maxCombo;
  showScene("result");
}

function updateView() {
  scoreText.textContent = score;
  comboText.textContent = combo;
  timerText.textContent = Math.ceil(remainingTime);
  timerText.classList.toggle("timer-danger", remainingTime <= 5);

  orderText.textContent = currentOrder;
  customText.textContent = currentCustoms.length === 0
    ? "カスタム: なし"
    : `カスタム: ${currentCustoms.join(" + ")}`;

  renderIngredientButtons();
}

function renderIngredientButtons() {
  ingredientButtons.innerHTML = "";

  allIngredients.forEach((name) => {
    const button = document.createElement("button");
    button.className = "ingredient-button";
    button.textContent = name;
    button.style.setProperty("--ingredient-color", ingredientColors[name]);

    if (name === "エスプレッソ" || name === "チョコ") {
      button.classList.add("dark-text");
    }

    if (selectedIngredients.includes(name)) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => toggleIngredient(name));
    ingredientButtons.appendChild(button);
  });
}

function renderRecipeList() {
  recipeList.innerHTML = "";

  for (const drinkName in recipes) {
    const row = document.createElement("div");
    row.className = "recipe-row";

    const name = document.createElement("span");
    name.textContent = drinkName;

    const ingredients = document.createElement("span");
    ingredients.className = "recipe-ingredients";

    recipes[drinkName].forEach((ingredient, index) => {
      if (index > 0) {
        ingredients.append(" + ");
      }

      const colored = document.createElement("span");
      colored.className = "recipe-chip";
      colored.textContent = ingredient;
      colored.style.background = ingredientColors[ingredient];
      colored.style.color = ingredient === "エスプレッソ" || ingredient === "チョコ" ? "white" : "rgb(35, 28, 22)";
      ingredients.appendChild(colored);
    });

    row.appendChild(name);
    row.appendChild(ingredients);
    recipeList.appendChild(row);
  }
}

document.querySelector("#startButton").addEventListener("click", () => {
  resetGame();
  showScene("game");
});

document.querySelector("#menuButton").addEventListener("click", () => showScene("menu"));
document.querySelector("#ruleButton").addEventListener("click", () => showScene("rule"));
document.querySelector("#menuBackButton").addEventListener("click", () => showScene("title"));
document.querySelector("#ruleBackButton").addEventListener("click", () => showScene("title"));
document.querySelector("#retryButton").addEventListener("click", () => {
  resetGame();
  showScene("game");
});
document.querySelector("#titleBackButton").addEventListener("click", () => showScene("title"));
document.querySelector("#serveButton").addEventListener("click", serveDrink);
document.querySelector("#resetButton").addEventListener("click", () => {
  selectedIngredients = [];
  showFeedback("材料をリセットしました", "rgb(125, 116, 107)");
  updateView();
});

document.querySelectorAll(".difficulty-button").forEach((button) => {
  button.addEventListener("click", () => {
    difficulty = button.dataset.difficulty;

    document.querySelectorAll(".difficulty-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
  });
});

window.addEventListener("resize", setAppHeight);
window.addEventListener("orientationchange", setAppHeight);

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setAppHeight);
}

setAppHeight();
renderRecipeList();
makeNewOrder();
updateView();
