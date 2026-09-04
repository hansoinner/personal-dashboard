/* =========================================================
   PERSONAL DASHBOARD — STAGE 8
   Tasks ↔ Goals integration
========================================================= */

const TASKS_KEY = "dashboardTasks";
const GOALS_KEY = "dashboardGoals";
const GOAL_SYNC_INTERVAL = 500;

let lastTaskSnapshot = "";
let lastGoalSnapshot = "";

function readStorage(key, fallback = []) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        return Array.isArray(value) ? value : fallback;
    } catch (error) {
        console.error(`Could not read ${key}:`, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Could not save ${key}:`, error);
        return false;
    }
}

function getTasks() {
    return readStorage(TASKS_KEY).filter(task => task && typeof task.text === "string");
}

function getGoals() {
    return readStorage(GOALS_KEY).filter(goal => goal && goal.id && goal.title);
}

function getGoalStats(goalId, tasks = getTasks()) {
    const linked = tasks.filter(task => String(task.goalId || "") === String(goalId));
    const completed = linked.filter(task => task.completed).length;
    return {
        total: linked.length,
        completed,
        progress: linked.length ? Math.round((completed / linked.length) * 100) : null
    };
}

function syncGoalProgress() {
    const tasks = getTasks();
    const goals = getGoals();
    let changed = false;

    const nextGoals = goals.map(goal => {
        const stats = getGoalStats(goal.id, tasks);

        if (!stats.total) return goal;

        const nextProgress = stats.progress;
        if (Number(goal.progress) === nextProgress) return goal;

        changed = true;
        return {
            ...goal,
            progress: nextProgress,
            updatedAt: new Date().toISOString()
        };
    });

    if (changed) writeStorage(GOALS_KEY, nextGoals);
    return { tasks, goals: nextGoals, changed };
}

function goalOptions(selectedId = "") {
    const select = document.createElement("select");
    select.className = "task-goal-select";
    select.setAttribute("aria-label", "Link task to a goal");

    select.add(new Option("No goal", ""));
    getGoals().forEach(goal => {
        const option = new Option(goal.title, String(goal.id));
        option.selected = String(goal.id) === String(selectedId);
        select.add(option);
    });

    return select;
}

function assignGoalToTask(taskId, goalId) {
    const tasks = getTasks();
    const index = tasks.findIndex(task => String(task.id) === String(taskId));
    if (index === -1) return;

    tasks[index] = {
        ...tasks[index],
        goalId: goalId || "",
        updatedAt: new Date().toISOString()
    };

    writeStorage(TASKS_KEY, tasks);
    syncGoalProgress();
    refreshGoalPresentation();
}

function enhanceTaskForm() {
    const form = document.getElementById("taskForm");
    if (!form || form.querySelector(".task-goal-select")) return;

    const select = goalOptions();
    form.insertBefore(select, document.getElementById("taskSubmitButton"));

    form.addEventListener("submit", () => {
        const goalId = select.value;
        if (!goalId) return;

        setTimeout(() => {
            const tasks = getTasks();
            if (!tasks.length) return;

            const newestTask = [...tasks].sort((a, b) =>
                String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
            )[0];

            if (newestTask) assignGoalToTask(newestTask.id, goalId);
        }, 0);
    });
}

function enhanceTaskItems() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    const tasks = getTasks();

    taskList.querySelectorAll(".task-item").forEach(item => {
        if (item.querySelector(".task-goal-control")) return;

        const text = item.querySelector(".task-text");
        const editInput = item.querySelector(".task-edit-input");
        const taskText = editInput?.value || text?.textContent || "";
        const task = tasks.find(candidate => candidate.text === taskText);
        if (!task) return;

        const control = document.createElement("div");
        control.className = "task-goal-control";

        const label = document.createElement("span");
        label.className = "task-goal-label";
        label.textContent = "Goal";

        const select = goalOptions(task.goalId || "");
        select.addEventListener("change", () => assignGoalToTask(task.id, select.value));

        control.append(label, select);
        const content = item.querySelector(".task-content");
        content?.append(control);
    });
}

function refreshGoalPresentation() {
    const tasks = getTasks();
    const goals = getGoals();

    document.querySelectorAll(".goal-item").forEach(article => {
        const title = article.querySelector(".goal-title")?.textContent?.trim();
        const goal = goals.find(candidate => candidate.title === title);
        if (!goal) return;

        const stats = getGoalStats(goal.id, tasks);
        if (!stats.total) return;

        const progress = stats.progress;
        const meta = article.querySelector(".goal-meta");
        const progressText = meta?.querySelector("span:first-child");
        const deadlineText = meta?.querySelector("span:last-child");
        const fill = article.querySelector(".goal-progress-fill");
        const track = article.querySelector(".goal-progress-track");
        const slider = article.querySelector(".goal-progress-slider");

        if (progressText) progressText.textContent = `Auto · ${stats.completed}/${stats.total} tasks · ${progress}%`;
        if (fill) fill.style.width = `${progress}%`;
        if (track) track.setAttribute("aria-valuenow", String(progress));
        if (slider) {
            slider.value = String(progress);
            slider.disabled = true;
            slider.title = "Progress is calculated automatically from linked tasks.";
        }

        article.classList.toggle("completed", progress === 100);
    });
}

function repairDeletedGoals() {
    const goals = getGoals();
    const validIds = new Set(goals.map(goal => String(goal.id)));
    const tasks = getTasks();
    let changed = false;

    const nextTasks = tasks.map(task => {
        if (!task.goalId || validIds.has(String(task.goalId))) return task;
        changed = true;
        const { goalId, ...rest } = task;
        return { ...rest, updatedAt: new Date().toISOString() };
    });

    if (changed) writeStorage(TASKS_KEY, nextTasks);
}

function injectStyles() {
    if (document.getElementById("stage8GoalStyles")) return;

    const style = document.createElement("style");
    style.id = "stage8GoalStyles";
    style.textContent = `
.task-goal-select{min-height:36px;border:1px solid var(--border);border-radius:7px;background:var(--surface);color:var(--text);padding:.45rem .6rem;font:inherit;font-size:.72rem;min-width:150px}.task-goal-control{display:flex;align-items:center;gap:.5rem;margin-top:.5rem}.task-goal-label{font-size:.68rem;color:var(--text-muted);font-weight:600}.task-goal-select:focus{outline:2px solid var(--primary);outline-offset:1px}.task-goal-select:disabled{opacity:.6;cursor:not-allowed}@media(max-width:800px){.task-form .task-goal-select{width:100%}.task-goal-control{flex-wrap:wrap}.task-goal-control .task-goal-select{flex:1;min-width:180px}}
    `;
    document.head.append(style);
}

function syncStage8() {
    enhanceTaskForm();
    enhanceTaskItems();
    repairDeletedGoals();

    const taskSnapshot = JSON.stringify(getTasks());
    const goalSnapshot = JSON.stringify(getGoals());

    if (taskSnapshot !== lastTaskSnapshot || goalSnapshot !== lastGoalSnapshot) {
        syncGoalProgress();
        enhanceTaskForm();
        enhanceTaskItems();
        refreshGoalPresentation();
        lastTaskSnapshot = JSON.stringify(getTasks());
        lastGoalSnapshot = JSON.stringify(getGoals());
    }
}

injectStyles();
syncStage8();
setInterval(syncStage8, GOAL_SYNC_INTERVAL);

window.dashboardGoalIntegration = {
    getGoalStats,
    syncGoalProgress,
    refreshGoalPresentation
};
