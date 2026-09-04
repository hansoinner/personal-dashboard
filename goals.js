/* =========================================================
   PERSONAL DASHBOARD — STAGE 7
   Goals and objectives system
========================================================= */

const GOALS_STORAGE_KEY = "dashboardGoals";

const goalsList = document.getElementById("goalsList");
const goalForm = document.getElementById("goalForm");
const goalTitle = document.getElementById("goalTitle");
const goalDeadline = document.getElementById("goalDeadline");
const goalProgress = document.getElementById("goalProgress");
const goalProgressValue = document.getElementById("goalProgressValue");
const goalEmpty = document.getElementById("goalEmpty");

let goals = loadGoals();
let editingGoalId = null;

function goalId() {
    return crypto?.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeGoal(goal) {
    return {
        id: goal.id ?? goalId(),
        title: String(goal.title || "").trim().slice(0, 160),
        deadline: /^\d{4}-\d{2}-\d{2}$/.test(goal.deadline || "") ? goal.deadline : "",
        progress: Math.min(100, Math.max(0, Number(goal.progress) || 0)),
        createdAt: goal.createdAt || new Date().toISOString(),
        updatedAt: goal.updatedAt || goal.createdAt || new Date().toISOString()
    };
}

function loadGoals() {
    try {
        const stored = JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY) || "[]");
        return Array.isArray(stored)
            ? stored.map(normalizeGoal).filter(goal => goal.title)
            : [];
    } catch (error) {
        console.error("Could not load goals:", error);
        return [];
    }
}

function saveGoals() {
    try {
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        return true;
    } catch (error) {
        console.error("Could not save goals:", error);
        return false;
    }
}

function formatGoalDeadline(value) {
    if (!value) return "No deadline";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
          }).format(date);
}

function isGoalOverdue(goal) {
    return Boolean(goal.deadline) && goal.progress < 100 && goal.deadline < new Date().toISOString().slice(0, 10);
}

function showGoalToast(message, type = "success") {
    if (typeof window.showToast === "function") {
        window.showToast(message, type);
        return;
    }
    console.info(message);
}

function renderGoals() {
    if (!goalsList) return;

    goalsList.replaceChildren();
    goalEmpty?.toggleAttribute("hidden", goals.length > 0);

    [...goals]
        .sort((a, b) => Number(isGoalOverdue(b)) - Number(isGoalOverdue(a)) ||
            (a.progress === 100 ? 1 : 0) - (b.progress === 100 ? 1 : 0) ||
            String(a.deadline || "9999-12-31").localeCompare(String(b.deadline || "9999-12-31")))
        .forEach(renderGoal);
}

function renderGoal(goal) {
    const article = document.createElement("article");
    article.className = `goal-item${goal.progress === 100 ? " completed" : ""}${isGoalOverdue(goal) ? " overdue" : ""}`;

    if (editingGoalId === String(goal.id)) {
        renderGoalEditor(article, goal);
        goalsList.append(article);
        return;
    }

    const top = document.createElement("div");
    top.className = "goal-item-top";

    const title = document.createElement("strong");
    title.className = "goal-title";
    title.textContent = goal.title;

    const actions = document.createElement("div");
    actions.className = "goal-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "goal-edit-button";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => {
        editingGoalId = String(goal.id);
        renderGoals();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "goal-delete-button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete goal: ${goal.title}`);
    remove.addEventListener("click", () => deleteGoal(goal.id));

    actions.append(edit, remove);
    top.append(title, actions);

    const meta = document.createElement("div");
    meta.className = "goal-meta";
    meta.innerHTML = `<span>${goal.progress}% complete</span><span>${isGoalOverdue(goal) ? "Overdue · " : "Due · "}${formatGoalDeadline(goal.deadline)}</span>`;

    const track = document.createElement("div");
    track.className = "goal-progress-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(goal.progress));
    track.setAttribute("aria-label", `${goal.title} progress`);

    const fill = document.createElement("div");
    fill.className = "goal-progress-fill";
    fill.style.width = `${goal.progress}%`;
    track.append(fill);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.step = "5";
    slider.value = String(goal.progress);
    slider.className = "goal-progress-slider";
    slider.setAttribute("aria-label", `Update progress for ${goal.title}`);
    slider.addEventListener("input", () => updateGoalProgress(goal.id, slider.value));

    article.append(top, meta, track, slider);
    goalsList.append(article);
}

function renderGoalEditor(article, goal) {
    article.classList.add("goal-editor");

    const title = document.createElement("input");
    title.type = "text";
    title.className = "goal-edit-title";
    title.value = goal.title;
    title.maxLength = 160;
    title.setAttribute("aria-label", "Goal title");

    const deadline = document.createElement("input");
    deadline.type = "date";
    deadline.className = "goal-edit-deadline";
    deadline.value = goal.deadline;
    deadline.setAttribute("aria-label", "Goal deadline");

    const progress = document.createElement("input");
    progress.type = "number";
    progress.className = "goal-edit-progress";
    progress.min = "0";
    progress.max = "100";
    progress.value = String(goal.progress);
    progress.setAttribute("aria-label", "Goal progress percentage");

    const actions = document.createElement("div");
    actions.className = "goal-edit-actions";

    const save = document.createElement("button");
    save.type = "button";
    save.className = "goal-save-button";
    save.textContent = "Save";
    save.addEventListener("click", () => updateGoal(goal.id, title.value, deadline.value, progress.value));

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "goal-cancel-button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => {
        editingGoalId = null;
        renderGoals();
    });

    actions.append(save, cancel);
    article.append(title, deadline, progress, actions);
    requestAnimationFrame(() => {
        title.focus();
        title.select();
    });
}

function createGoal(title, deadline, progress) {
    const cleanTitle = title.trim().slice(0, 160);
    if (!cleanTitle) {
        showGoalToast("Goal title cannot be empty.", "error");
        return;
    }

    const now = new Date().toISOString();
    goals.push(normalizeGoal({
        id: goalId(),
        title: cleanTitle,
        deadline,
        progress,
        createdAt: now,
        updatedAt: now
    }));

    saveGoals();
    renderGoals();
    goalForm?.reset();
    if (goalProgressValue) goalProgressValue.textContent = "0%";
    showGoalToast("Goal added.");
}

function updateGoal(id, title, deadline, progress) {
    const cleanTitle = title.trim().slice(0, 160);
    if (!cleanTitle) {
        showGoalToast("Goal title cannot be empty.", "error");
        return;
    }

    goals = goals.map(goal => String(goal.id) === String(id)
        ? normalizeGoal({ ...goal, title: cleanTitle, deadline, progress, updatedAt: new Date().toISOString() })
        : goal
    );

    editingGoalId = null;
    saveGoals();
    renderGoals();
    showGoalToast("Goal updated.");
}

function updateGoalProgress(id, value) {
    const progress = Math.min(100, Math.max(0, Number(value) || 0));
    goals = goals.map(goal => String(goal.id) === String(id)
        ? { ...goal, progress, updatedAt: new Date().toISOString() }
        : goal
    );
    saveGoals();

    const item = [...document.querySelectorAll(".goal-item")].find(element => element.querySelector(`[aria-label="Update progress for ${CSS.escape(goals.find(g => String(g.id) === String(id))?.title || "")}"]`));
    if (item) {
        const meta = item.querySelector(".goal-meta span");
        const fill = item.querySelector(".goal-progress-fill");
        const track = item.querySelector(".goal-progress-track");
        if (meta) meta.textContent = `${progress}% complete`;
        if (fill) fill.style.width = `${progress}%`;
        if (track) track.setAttribute("aria-valuenow", String(progress));
    }

    if (progress === 100) {
        renderGoals();
        showGoalToast("Goal completed! 🎉");
    }
}

function deleteGoal(id) {
    const goal = goals.find(item => String(item.id) === String(id));
    if (!goal) return;
    if (!confirm(`Delete goal “${goal.title}”?`)) return;

    goals = goals.filter(item => String(item.id) !== String(id));
    saveGoals();
    renderGoals();
    showGoalToast("Goal deleted.");
}

goalProgress?.addEventListener("input", () => {
    if (goalProgressValue) goalProgressValue.textContent = `${goalProgress.value}%`;
});

goalForm?.addEventListener("submit", event => {
    event.preventDefault();
    createGoal(goalTitle?.value || "", goalDeadline?.value || "", goalProgress?.value || 0);
});

renderGoals();
