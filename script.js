let games = [];
const adminPassword = "admin123";

const gameContainer = document.getElementById("gameContainer");
const template = document.getElementById("gameCardTemplate");
const searchInput = document.getElementById("searchInput");
const toggleTheme = document.getElementById("toggleTheme");
const toggleAdmin = document.getElementById("toggleAdmin");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanel = document.getElementById("adminPanel");
const adminForm = document.getElementById("adminForm");
const categoryButtons = document.querySelectorAll(".category-btn");

let isLoggedIn = false;
let currentCategory = "All";

// ✅ Load from games.json and merge with localStorage
fetch('games.json')
  .then(res => res.json())
  .then(jsonData => {
    const stored = JSON.parse(localStorage.getItem("games")) || [];
    games = [...jsonData, ...stored];
    localStorage.setItem("games", JSON.stringify(games));
    displayGames();
  })
  .catch(() => {
    games = JSON.parse(localStorage.getItem("games")) || [];
    displayGames();
  });

function displayGames(filter = "") {
  gameContainer.innerHTML = "";
  const filtered = games.filter(game => {
    const matchesCategory =
      currentCategory.toLowerCase() === "all" ||
      game.category.toLowerCase() === currentCategory.toLowerCase();
    const matchesSearch = game.title.toLowerCase().includes(filter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  filtered.forEach((game, index) => {
    const card = template.content.cloneNode(true);
    card.querySelector(".game-img").src = game.img;
    card.querySelector(".game-title").textContent = game.title;
    card.querySelector(".game-desc").textContent = game.desc;
    card.querySelector(".game-cat").textContent = "Category: " + game.category;
    card.querySelector(".game-meta").textContent = `Version: ${game.version} | Size: ${game.size}`;
    card.querySelector(".download-btn").href = game.download;

    if (isLoggedIn) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑 Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => deleteGame(index);
      card.querySelector(".game-card").appendChild(delBtn);
    }

    gameContainer.appendChild(card);
  });
}

function deleteGame(index) {
  games.splice(index, 1);
  localStorage.setItem("games", JSON.stringify(games));
  displayGames(searchInput.value);
}

adminForm.addEventListener("submit", e => {
  e.preventDefault();
  const newGame = {
    title: document.getElementById("titleInput").value,
    desc: document.getElementById("descInput").value,
    category: document.getElementById("categoryInput").value,
    size: document.getElementById("sizeInput").value,
    version: document.getElementById("versionInput").value,
    img: document.getElementById("imgInput").value,
    download: document.getElementById("downloadInput").value
  };
  games.push(newGame);
  localStorage.setItem("games", JSON.stringify(games));
  displayGames();
  adminForm.reset();
});

toggleAdmin.addEventListener("click", () => {
  const input = prompt("Enter admin password:");
  if (input === adminPassword) {
    isLoggedIn = true;
    adminPanel.style.display = "block";
    logoutBtn.style.display = "inline-block";
    attachAdminActions();
    displayGames();
  } else {
    alert("Access denied.");
  }
});

logoutBtn.addEventListener("click", () => {
  isLoggedIn = false;
  adminPanel.style.display = "none";
  logoutBtn.style.display = "none";
  displayGames();
});

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

searchInput.addEventListener("input", e => {
  displayGames(e.target.value);
});

categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    displayGames(searchInput.value);
  });
});

function attachAdminActions() {
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      if (confirm("Do you want to export all games as a JSON file?")) {
        const dataStr = JSON.stringify(games, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "games.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  const importJson = document.getElementById("importJson");
  if (importJson) {
    importJson.addEventListener("change", (event) => {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      let imported = 0;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const newGames = JSON.parse(e.target.result);
            if (Array.isArray(newGames)) {
              games = games.concat(newGames);
              imported++;
              if (imported === files.length) {
                localStorage.setItem("games", JSON.stringify(games));
                displayGames();
                alert("All games imported successfully.");
              }
            } else {
              alert("Invalid format in " + file.name);
            }
          } catch {
            alert("Failed to parse: " + file.name);
          }
        };
        reader.readAsText(file);
      });
    });
  }
}
