/* =========================================================
   PERSONAL DASHBOARD — STAGE 3
   Data management, export/reset, task editing and persistence
========================================================= */

const STORAGE_KEYS = {
    tasks: "dashboardTasks",
    notes: "dashboardNotes",
    filter: "dashboardTaskFilter"
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
const exportDataButton = document.getElementById("exportDataButton");
const resetDataButton = document.getElementById("resetDataButton");

let tasks = loadTasks();
let currentFilter = loadFilter();
let editingTaskId = null;
let notesSaveTimer;

function createId() {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.tasks);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(task => task && typeof task.text === "string").map(task => ({
            id: task.id ?? createId(),
            text: task.text.trim().slice(0, 200),
            completed: Boolean(task.completed),
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || task.createdAt || new Date().toISOString()
        })).filter(task => task.text);
    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);
        showToast("Could not save your tasks.", "error");
        return false;
    }
}

function loadFilter() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.filter);
        return ["all", "active", "completed"].includes(saved) ? saved : "all";
    } catch {
        return "all";
    }
}

function saveFilter() {
    try {
        localStorage.setItem(STORAGE_KEYS.filter, currentFilter);
    } catch (error) {
        console.error("Could not save filter:", error);
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
            notesSaveTimer = window.setTimeout(() => { savedIndicator.textContent = "Ready"; }, 1200);
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
    if (!cleanText) return false;
    const now = new Date().toISOString();
    tasks.push({ id: createId(), text: cleanText, completed: false, createdAt: now, updatedAt: now });
    saveTasks();
    currentFilter = "all";
    saveFilter();
    renderTasks();
    showToast("Task added.");
    return true;
}

function updateTask(id, text) {
    const cleanText = text.trim().slice(0, 200);
    if (!cleanText) return false;
    let updated = false;
    tasks = tasks.map(task => {
        if (String(task.id) !== String(id)) return task;
        updated = true;
        return { ...task, text: cleanText, updatedAt: new Date().toISOString() };
    });
    if (!updated) return false;
    saveTasks();
    showToast("Task updated.");
    return true;
}

function startEditingTask(id) {
    const task = tasks.find(item => String(item.id) === String(id));
    if (!task) return;
    editingTaskId = String(task.id);
    renderTasks();
}

function cancelEditingTask() {
    editingTaskId = null;
    renderTasks();
}

function finishEditingTask(id, value) {
    if (!updateTask(id, value)) {
        showToast("Task text cannot be empty.", "error");
        return;
    }
    editingTaskId = null;
    renderTasks();
}

function deleteTask(id) {
    const exists = tasks.some(task => String(task.id) === String(id));
    tasks = tasks.filter(task => String(task.id) !== String(id));
    if (editingTaskId === String(id)) editingTaskId = null;
    saveTasks();
    renderTasks();
    if (exists) showToast("Task deleted.");
}

function toggleTask(id) {
    let completed = false;
    tasks = tasks.map(task => {
        if (String(task.id) !== String(id)) return task;
        completed = !task.completed;
        return { ...task, completed, updatedAt: new Date().toISOString() };
    });
    saveTasks();
    renderTasks();
    showToast(completed ? "Task completed." : "Task marked active.");
}

function clearCompletedTasks() {
    const count = tasks.filter(task => task.completed).length;
    if (!count) {
        showToast("There are no completed tasks to clear.");
        return;
    }
    tasks = tasks.filter(task => !task.completed);
    editingTaskId = null;
    saveTasks();
    renderTasks();
    showToast(`${count} completed ${count === 1 ? "task" : "tasks"} cleared.`);
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
    emptyState.hidden = filteredTasks.length > 0;
    if (filteredTasks.length) return;
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

    const content = document.createElement("div");
    content.className = "task-content";

    if (editingTaskId === String(task.id)) {
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.className = "task-edit-input";
        editInput.value = task.text;
        editInput.maxLength = 200;
        editInput.setAttribute("aria-label", `Edit task: ${task.text}`);

        const editActions = document.createElement("div");
        editActions.className = "task-edit-actions";

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "delete-task edit-save";
        saveButton.textContent = "Save";
        saveButton.setAttribute("aria-label", `Save task: ${task.text}`);
        saveButton.addEventListener("click", () => finishEditingTask(task.id, editInput.value));

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "delete-task edit-cancel";
        cancelButton.textContent = "Cancel";
        cancelButton.setAttribute("aria-label", "Cancel editing");
        cancelButton.addEventListener("click", cancelEditingTask);

        editActions.append(saveButton, cancelButton);
        content.append(editInput, editActions);

        editInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                finishEditingTask(task.id, editInput.value);
            } else if (event.key === "Escape") {
                cancelEditingTask();
            }
        });

        requestAnimationFrame(() => { editInput.focus(); editInput.select(); });
    } else {
        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;
        content.appendChild(text);
    }

    const actions = document.createElement("div");
    actions.className = "task-actions";

    if (editingTaskId !== String(task.id)) {
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "delete-task";
        editButton.textContent = "Edit";
        editButton.setAttribute("aria-label", `Edit task: ${task.text}`);
        editButton.addEventListener("click", () => startEditingTask(task.id));
        actions.appendChild(editButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));
    actions.appendChild(deleteButton);

    article.append(checkbox, content, actions);
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
    editingTaskId = null;
    currentFilter = filter;
    saveFilter();
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

function showToast(message, type = "success") {
    let toast = document.getElementById("dashboardToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "dashboardToast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        Object.assign(toast.style, {
            position: "fixed", right: "20px", bottom: "20px", zIndex: "9999",
            maxWidth: "min(360px, calc(100vw - 40px))", padding: "12px 16px",
            borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700",
            boxShadow: "0 12px 30px rgba(15,23,42,.18)", opacity: "0",
            transform: "translateY(8px)", transition: "opacity .2s ease, transform .2s ease"
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = type === "error" ? "#dc2626" : "#16a34a";
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
    }, 2200);
}

function exportData() {
    const data = {
        exportedAt: new Date().toISOString(),
        version: "3.0",
        tasks,
        notes: notesInput?.value || "",
        filter: currentFilter
    };

    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `personal-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast("Dashboard data exported.");
    } catch (error) {
        console.error("Could not export data:", error);
        showToast("Could not export dashboard data.", "error");
    }
}

function resetDashboardData() {
    const confirmed = window.confirm("Reset all dashboard data? This will permanently remove your tasks, notes and saved filter from this browser.");
    if (!confirmed) return;

    try {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        tasks = [];
        currentFilter = "all";
        editingTaskId = null;
        if (notesInput) notesInput.value = "";
        renderTasks();
        showToast("Dashboard data has been reset.");
    } catch (error) {
        console.error("Could not reset dashboard data:", error);
        showToast("Could not reset dashboard data.", "error");
    }
}

if (taskForm) {
    taskForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!taskInput) return;
        const text = taskInput.value.trim();
        if (!text) { taskInput.focus(); return; }
        if (createTask(text)) { taskInput.value = ""; taskInput.focus(); }
    });
}

filterButtons.forEach(button => button.addEventListener("click", () => setActiveFilter(button.dataset.filter)));
clearCompletedButton?.addEventListener("click", clearCompletedTasks);
menuButton?.addEventListener("click", openSidebar);
sidebarClose?.addEventListener("click", closeSidebar);
sidebarOverlay?.addEventListener("click", closeSidebar);
focusTaskButton?.addEventListener("click", focusTaskInput);
exportDataButton?.addEventListener("click", exportData);
resetDataButton?.addEventListener("click", resetDashboardData);

navLinks.forEach(link => link.addEventListener("click", () => {
    navLinks.forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    navLinks.forEach(item => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
    closeSidebar();
}));

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
