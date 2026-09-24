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

// Détecte une injection SQL basique du type ' OR '1'='1, ' OR 1=1--, admin'--
function looksLikeInjection(raw) {
    const s = raw.toLowerCase();
    if (!s.includes("'")) return false;                 // il faut sortir de la chaîne
    const tautology = /or\s+.+=.+/.test(s);             // un OR toujours vrai
    const comment = s.includes("--") || s.includes("#");// ou commenter la suite
    return tautology || comment;
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
    const button = form.querySelector("button");
    const sqli = form.classList.contains("sqli");

    if (!sqli && form.dataset.answer) input.value = form.dataset.answer;
    input.disabled = true;
    button.disabled = true;
    button.textContent = sqli ? "✓ Connecté" : "✓ Ouvert";
    feedback.className = "feedback ok";
    feedback.textContent = sqli ? "Te voilà admin. Malin." : "Coffre ouvert.";

    updateProgress();
    if (animate) unlockNext(section);
}

document.querySelectorAll(".answer").forEach((form) => {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const section = form.closest(".chal");
        const input = form.querySelector("input");
        const feedback = section.querySelector(".feedback");
        const value = input.value.trim();

        if (!value) return;

        const ok = form.classList.contains("sqli")
            ? looksLikeInjection(input.value)
            : normalize(input.value) === normalize(form.dataset.answer);

        if (ok) {
            markSolved(section, true);
        } else {
            feedback.className = "feedback err";
            feedback.textContent = form.classList.contains("sqli")
                ? "Refusé. Le mot de passe est faux... forcément."
                : "Non. Réessaie.";
            input.classList.add("shake");
            setTimeout(() => input.classList.remove("shake"), 400);
        }
    });
});

restore();
updateProgress();
