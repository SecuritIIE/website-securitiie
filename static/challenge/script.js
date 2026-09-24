// ============================================================
//  SecuritIIE — Chasse au trésor : logique des 4 challenges
// ============================================================

// Normalise une réponse : minuscules, sans accents, sans espaces
function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // retire les accents
        .replace(/\s+/g, "")
        .trim();
}

const TOTAL = 4;
let solved = 0;

const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const finalGate = document.getElementById("finalGate");

function updateProgress() {
    const pct = (solved / TOTAL) * 100;
    progressBar.style.width = pct + "%";
    progressLabel.textContent = solved + " / " + TOTAL + " coffres ouverts";
    if (solved === TOTAL) {
        setTimeout(() => finalGate.classList.add("show"), 700);
    }
}

// Restaure la progression si l'utilisateur revient
function restore() {
    for (let i = 1; i <= TOTAL; i++) {
        if (localStorage.getItem("chal-" + i) === "done") {
            markSolved(document.getElementById("chal-" + i), false);
        }
    }
}

function unlockNext(current) {
    const id = parseInt(current.id.split("-")[1], 10);
    const next = document.getElementById("chal-" + (id + 1));
    if (next) {
        next.classList.remove("locked");
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function markSolved(section, animate) {
    if (section.classList.contains("solved")) return;
    section.classList.add("solved");
    const id = parseInt(section.id.split("-")[1], 10);
    localStorage.setItem("chal-" + id, "done");
    solved++;

    const form = section.querySelector(".answer");
    const feedback = section.querySelector(".feedback");
    const input = form.querySelector("input");
    input.value = form.dataset.answer;
    input.disabled = true;
    form.querySelector("button").disabled = true;
    form.querySelector("button").textContent = "✓ Ouvert";
    feedback.className = "feedback ok";
    feedback.innerHTML = "🔓 Coffre ouvert ! <br><span style='color:var(--cyan)'>Indice : "
        + (form.dataset.clue || "") + "</span>";

    updateProgress();
    if (animate) unlockNext(section);
}

document.querySelectorAll(".answer").forEach((form) => {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const section = form.closest(".chal");
        const input = form.querySelector("input");
        const feedback = section.querySelector(".feedback");
        const expected = normalize(form.dataset.answer);
        const given = normalize(input.value);

        if (!given) return;

        if (given === expected) {
            markSolved(section, true);
        } else {
            feedback.className = "feedback err";
            feedback.textContent = "✗ Clé incorrecte. Regarde de plus près...";
            input.classList.add("shake");
            setTimeout(() => input.classList.remove("shake"), 400);
        }
    });
});

restore();
updateProgress();

// ------------------------------------------------------------
//  Effet "matrix rain" en fond
// ------------------------------------------------------------
(function matrix() {
    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");
    let cols, drops;
    const chars = "01アイウエオカキクabcdef0123456789$#@%".split("");
    const font = 14;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / font);
        drops = new Array(cols).fill(1);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
        ctx.fillStyle = "rgba(4,6,10,0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff9c";
        ctx.font = font + "px monospace";
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * font, drops[i] * font);
            if (drops[i] * font > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(draw, 55);
})();
