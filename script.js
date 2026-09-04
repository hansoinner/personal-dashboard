/* =========================================================
   PERSONAL DASHBOARD — STAGE 1
   State, persistence, task interactions and accessibility
========================================================= */

const STORAGE_KEYS = {
    tasks: "dashboardTasks",
    notes: "dashboardNotes"
};

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyStateTitle = document.getElementById("emptyStateTitle");
const emptyStateMessage = document.getElementById("emptyStateMessage");
const totalTasksElement = document.getElementById("totalTasks");
const activeTasksElement = document.getElementById("activeTasks");
const completedTasksElement = document.getElementById("completedTasks");
const allCount = document.getElementById("allCount");
const allTasksCount = document.getElementById("allTasksCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const taskCountBadge = document.getElementById("taskCountBadge");
const currentDateElement = document.getElementById("currentDate");
const currentYearElement = document.getElementById("currentYear");
const progressBar = document.getElementById("progressBar");
const progressCircle = document.getElementById("progressCircle");
const progressCirclePercentage = document.getElementById("progressCirclePercentage");
const progressPercentage = document.getElementById("progressPercentage");
const progressMessage = document.getElementById("progressMessage");
const progressTrack = document.querySelector(".progress-track");
const clearCompletedButton = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter-button");
const navLinks = document.querySelectorAll(".sidebar-link");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
const menuButton = document.querySelector(".menu-button");
const sidebarClose = document.querySelector(".sidebar-close");
const focusTaskButton = document.getElementById("focusTaskButton");
const notesInput = document.getElementById("notesInput");
const savedIndicator = document.getElementById("savedIndicator");

let tasks = loadTasks();
let currentFilter = "all";
let notesSaveTimer;

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.tasks);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(task => task && typeof task.text === "string").map(task => ({
            id: task.id ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
            text: task.text.trim().slice(0, 200),
            completed: Boolean(task.completed),
            createdAt: task.createdAt || new Date().toISOString()
        })).filter(task => task.text);
    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}

function loadNotes() {
    if (!notesInput) return;
    try {
        notesInput.value = localStorage.getItem(STORAGE_KEYS.notes) || "";
    } catch (error) {
        console.error("Could not load notes:", error);
    }
}

function saveNotes() {
    if (!notesInput) return;
    try {
        localStorage.setItem(STORAGE_KEYS.notes, notesInput.value);
        if (savedIndicator) {
            savedIndicator.textContent = "Saved";
            window.clearTimeout(notesSaveTimer);
            notesSaveTimer = window.setTimeout(() => {
                savedIndicator.textContent = "Ready";
            }, 1200);
        }
    } catch (error) {
        console.error("Could not save notes:", error);
        if (savedIndicator) savedIndicator.textContent = "Not saved";
    }
}

function displayCurrentDate() {
    if (!currentDateElement) return;
    currentDateElement.textContent = new Intl.DateTimeFormat("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    }).format(new Date());
}

function displayCurrentYear() {
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();
}

function createTask(text) {
    const cleanText = text.trim().slice(0, 200);
    if (!cleanText) return;
    tasks.push({
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        text: cleanText,
        completed: false,
        createdAt: new Date().toISOString()
    });
    saveTasks();
    currentFilter = "all";
    updateFilterButtons();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => String(task.id) !== String(id));
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => String(task.id) === String(id)
        ? { ...task, completed: !task.completed }
        : task
    );
    saveTasks();
    renderTasks();
}

function clearCompletedTasks() {
    if (!tasks.some(task => task.completed)) return;
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

function getFilteredTasks() {
    if (currentFilter === "active") return tasks.filter(task => !task.completed);
    if (currentFilter === "completed") return tasks.filter(task => task.completed);
    return tasks;
}

function updateCounts() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    if (totalTasksElement) totalTasksElement.textContent = total;
    if (activeTasksElement) activeTasksElement.textContent = active;
    if (completedTasksElement) completedTasksElement.textContent = completed;
    if (allCount) allCount.textContent = total;
    if (allTasksCount) allTasksCount.textContent = total;
    if (activeCount) activeCount.textContent = active;
    if (completedCount) completedCount.textContent = completed;
    if (taskCountBadge) taskCountBadge.textContent = total;
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    if (progressCirclePercentage) progressCirclePercentage.textContent = `${percentage}%`;
    if (progressCircle) progressCircle.style.background = `conic-gradient(var(--primary) ${percentage}%, #e2e8f0 ${percentage}%)`;
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", percentage);

    if (!progressMessage) return;
    if (!total) progressMessage.textContent = "Start by adding your first task.";
    else if (percentage === 0) progressMessage.textContent = "You have tasks waiting for you. Let's get started.";
    else if (percentage < 50) progressMessage.textContent = "Good start. Keep making progress.";
    else if (percentage < 100) progressMessage.textContent = "You're making great progress. Keep going.";
    else progressMessage.textContent = "Everything is complete. Great work! 🎉";
}

function updateEmptyState(filteredTasks) {
    if (!emptyState) return;
    const hasTasks = filteredTasks.length > 0;
    emptyState.hidden = hasTasks;
    if (hasTasks) return;

    if (!tasks.length) {
        emptyStateTitle.textContent = "No tasks yet";
        emptyStateMessage.textContent = "Add your first task to get started.";
    } else if (currentFilter === "active") {
        emptyStateTitle.textContent = "No active tasks";
        emptyStateMessage.textContent = "You've completed everything. Nice work!";
    } else if (currentFilter === "completed") {
        emptyStateTitle.textContent = "No completed tasks";
        emptyStateMessage.textContent = "Completed tasks will appear here.";
    }
}

function createTaskElement(task) {
    const article = document.createElement("article");
    article.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `${task.completed ? "Mark active" : "Mark completed"}: ${task.text}`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    article.append(checkbox, text, deleteButton);
    return article;
}

function updateFilterButtons() {
    filterButtons.forEach(button => {
        const active = button.dataset.filter === currentFilter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

function renderTasks() {
    if (!taskList) return;
    taskList.replaceChildren();
    const filteredTasks = getFilteredTasks();
    filteredTasks.forEach(task => taskList.appendChild(createTaskElement(task)));
    updateEmptyState(filteredTasks);
    updateCounts();
    updateProgress();
}

function setActiveFilter(filter) {
    if (!["all", "active", "completed"].includes(filter)) return;
    currentFilter = filter;
    updateFilterButtons();
    renderTasks();
}

function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    sidebarOverlay?.classList.add("visible");
    document.body.classList.add("menu-open");
    menuButton?.setAttribute("aria-expanded", "true");
    sidebarClose?.focus();
}

function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    sidebarOverlay?.classList.remove("visible");
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
}

function focusTaskInput() {
    if (!taskInput) return;
    taskInput.focus();
    taskInput.scrollIntoView({ behavior: "smooth", block: "center" });
}

if (taskForm) {
    taskForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!taskInput) return;
        const text = taskInput.value.trim();
        if (!text) {
            taskInput.focus();
            return;
        }
        createTask(text);
        taskInput.value = "";
        taskInput.focus();
    });
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => setActiveFilter(button.dataset.filter));
});

clearCompletedButton?.addEventListener("click", clearCompletedTasks);
menuButton?.addEventListener("click", openSidebar);
sidebarClose?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);
focusTaskButton?.addEventListener("click", focusTaskInput);

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
        navLinks.forEach(item => item.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "page");
        closeSidebar();
    });
});

notesInput?.addEventListener("input", saveNotes);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSidebar();
    if (event.key === "/" && taskInput && document.activeElement !== taskInput && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        focusTaskInput();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeSidebar();
});

function initializeDashboard() {
    displayCurrentDate();
    displayCurrentYear();
    loadNotes();
    updateFilterButtons();
    renderTasks();
}

initializeDashboard();
