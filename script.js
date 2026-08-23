/* =========================
   PERSONAL DASHBOARD
========================= */


/* =========================
   DOM ELEMENTS
========================= */

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const totalTasksElement =
    document.getElementById("totalTasks");

const activeTasksElement =
    document.getElementById("activeTasks");

const completedTasksElement =
    document.getElementById("completedTasks");

const completionRateElement =
    document.getElementById("completionRate");

const currentDateElement =
    document.getElementById("currentDate");

const clearCompletedButton =
    document.getElementById("clearCompleted");

const filterButtons =
    document.querySelectorAll(".filter-button");

const navTaskCount =
    document.getElementById("navTaskCount");

const taskCountBadge =
    document.getElementById("taskCountBadge");

const progressPercentage =
    document.getElementById("progressPercentage");

const progressBarFill =
    document.getElementById("progressBarFill");

const notesInput =
    document.getElementById("notesInput");

const notesCount =
    document.getElementById("notesCount");

const clearNotesButton =
    document.getElementById("clearNotes");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarClose =
    document.getElementById("sidebarClose");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const sidebarLinks =
    document.querySelectorAll(".sidebar-link");

const quickAddButton =
    document.getElementById("quickAddButton");

const quickTaskModal =
    document.getElementById("quickTaskModal");

const closeQuickTask =
    document.getElementById("closeQuickTask");

const cancelQuickTask =
    document.getElementById("cancelQuickTask");

const quickTaskForm =
    document.getElementById("quickTaskForm");

const quickTaskInput =
    document.getElementById("quickTaskInput");

const focusButton =
    document.getElementById("focusButton");

const notificationButton =
    document.getElementById(
        "notificationButton"
    );

const addGoalButton =
    document.getElementById(
        "addGoalButton"
    );


/* =========================
   STATE
========================= */

let tasks =
    loadTasks();

let currentFilter =
    "all";


/* =========================
   LOAD TASKS
========================= */

function loadTasks() {

    try {

        const savedTasks =
            localStorage.getItem(
                "dashboardTasks"
            );

        return savedTasks
            ? JSON.parse(savedTasks)
            : [];

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        return [];
    }
}


/* =========================
   SAVE TASKS
========================= */

function saveTasks() {

    localStorage.setItem(
        "dashboardTasks",
        JSON.stringify(tasks)
    );
}


/* =========================
   DATE
========================= */

function displayCurrentDate() {

    if (!currentDateElement) {
        return;
    }

    const today =
        new Date();

    const formattedDate =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    currentDateElement.textContent =
        formattedDate;
}


/* =========================
   CREATE TASK
========================= */

function createTask(text) {

    const cleanText =
        text.trim();

    if (!cleanText) {
        return;
    }

    const newTask = {

        id:
            Date.now() +
            Math.random(),

        text:
            cleanText,

        completed:
            false,

        createdAt:
            new Date().toISOString()
    };

    tasks.push(newTask);

    saveTasks();

    renderTasks();
}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    tasks =
        tasks.filter(
            task => task.id !== id
        );

    saveTasks();

    renderTasks();
}


/* =========================
   TOGGLE TASK
========================= */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id === id) {

                return {
                    ...task,
                    completed:
                        !task.completed
                };
            }

            return task;
        });

    saveTasks();

    renderTasks();
}


/* =========================
   CLEAR COMPLETED
========================= */

function clearCompletedTasks() {

    tasks =
        tasks.filter(
            task => !task.completed
        );

    saveTasks();

    renderTasks();
}


/* =========================
   FILTER TASKS
========================= */

function getFilteredTasks() {

    if (currentFilter === "active") {

        return tasks.filter(
            task => !task.completed
        );
    }

    if (currentFilter === "completed") {

        return tasks.filter(
            task => task.completed
        );
    }

    return tasks;
}


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    const filteredTasks =
        getFilteredTasks();


    if (filteredTasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";
    }


    filteredTasks.forEach(
        task => {

            const taskElement =
                document.createElement(
                    "article"
                );

            taskElement.className =
                "task-item";


            if (task.completed) {

                taskElement.classList.add(
                    "completed"
                );
            }


            /*
               Checkbox
            */

            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.className =
                "task-checkbox";

            checkbox.checked =
                task.completed;

            checkbox.setAttribute(
                "aria-label",
                `Complete ${task.text}`
            );

            checkbox.addEventListener(
                "change",
                () => toggleTask(task.id)
            );


            /*
               Text
            */

            const taskText =
                document.createElement(
                    "span"
                );

            taskText.className =
                "task-text";

            taskText.textContent =
                task.text;


            /*
               Delete
            */

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "delete-task";

            deleteButton.textContent =
                "×";

            deleteButton.setAttribute(
                "aria-label",
                `Delete ${task.text}`
            );

            deleteButton.addEventListener(
                "click",
                () => deleteTask(task.id)
            );


            /*
               Assemble
            */

            taskElement.appendChild(
                checkbox
            );

            taskElement.appendChild(
                taskText
            );

            taskElement.appendChild(
                deleteButton
            );

            taskList.appendChild(
                taskElement
            );
        }
    );


    updateStats();
}


/* =========================
   UPDATE STATISTICS
========================= */

function updateStats() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const active =
        total - completed;

    const completionRate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    totalTasksElement.textContent =
        total;

    activeTasksElement.textContent =
        active;

    completedTasksElement.textContent =
        completed;


    if (completionRateElement) {

        completionRateElement.textContent =
            `${completionRate}%`;
    }


    if (navTaskCount) {

        navTaskCount.textContent =
            active;
    }


    if (taskCountBadge) {

        taskCountBadge.textContent =
            active;
    }


    if (progressPercentage) {

        progressPercentage.textContent =
            `${completionRate}%`;
    }


    if (progressBarFill) {

        progressBarFill.style.width =
            `${completionRate}%`;
    }
}


/* =========================
   ADD TASK FORM
========================= */

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const text =
                taskInput.value.trim();

            if (!text) {

                taskInput.focus();

                return;
            }

            createTask(text);

            taskInput.value = "";

            taskInput.focus();
        }
    );
}


/* =========================
   FILTER BUTTONS
========================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentFilter =
                    button.dataset.filter;


                filterButtons.forEach(
                    filterButton => {

                        filterButton.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                renderTasks();
            }
        );
    }
);


/* =========================
   CLEAR COMPLETED
========================= */

if (clearCompletedButton) {

    clearCompletedButton.addEventListener(
        "click",
        clearCompletedTasks
    );
}


/* =========================
   NOTES
========================= */

function loadNotes() {

    const savedNotes =
        localStorage.getItem(
            "dashboardNotes"
        );

    if (savedNotes && notesInput) {

        notesInput.value =
            savedNotes;
    }

    updateNotesCount();
}


function saveNotes() {

    if (!notesInput) {
        return;
    }

    localStorage.setItem(
        "dashboardNotes",
        notesInput.value
    );

    updateNotesCount();
}


function updateNotesCount() {

    if (!notesInput || !notesCount) {
        return;
    }

    notesCount.textContent =
        `${notesInput.value.length} / 1000`;
}


if (notesInput) {

    notesInput.addEventListener(
        "input",
        saveNotes
    );
}


if (clearNotesButton) {

    clearNotesButton.addEventListener(
        "click",
        () => {

            notesInput.value = "";

            saveNotes();

            notesInput.focus();
        }
    );
}


/* =========================
   SIDEBAR
========================= */

function openSidebar() {

    sidebar.classList.add(
        "open"
    );

    sidebarOverlay.classList.add(
        "visible"
    );

    menuButton.setAttribute(
        "aria-expanded",
        "true"
    );

    document.body.classList.add(
        "sidebar-open"
    );
}


function closeSidebar() {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "visible"
    );

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    document.body.classList.remove(
        "sidebar-open"
    );
}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );
}


if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );
}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );
}


/* =========================
   SIDEBAR NAVIGATION
========================= */

sidebarLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                sidebarLinks.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );
                    }
                );


                link.classList.add(
                    "active"
                );


                if (
                    window.innerWidth <= 900
                ) {

                    closeSidebar();
                }
            }
        );
    }
);


/* =========================
   QUICK TASK MODAL
========================= */

function openQuickTaskModal() {

    quickTaskModal.classList.add(
        "open"
    );

    quickTaskModal.setAttribute(
        "aria-hidden",
        "false"
    );

    setTimeout(
        () => {

            quickTaskInput.focus();

        },
        50
    );
}


function closeQuickTaskModal() {

    quickTaskModal.classList.remove(
        "open"
    );

    quickTaskModal.setAttribute(
        "aria-hidden",
        "true"
    );

    quickTaskInput.value = "";
}


if (quickAddButton) {

    quickAddButton.addEventListener(
        "click",
        openQuickTaskModal
    );
}


if (closeQuickTask) {

    closeQuickTask.addEventListener(
        "click",
        closeQuickTaskModal
    );
}


if (cancelQuickTask) {

    cancelQuickTask.addEventListener(
        "click",
        closeQuickTaskModal
    );
}


if (quickTaskForm) {

    quickTaskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const text =
                quickTaskInput.value.trim();

            if (!text) {

                quickTaskInput.focus();

                return;
            }

            createTask(text);

            closeQuickTaskModal();
        }
    );
}


if (quickTaskModal) {

    quickTaskModal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "modal-backdrop"
                )
            ) {

                closeQuickTaskModal();
            }
        }
    );
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeQuickTaskModal();

            closeSidebar();
        }
    }
);


/* =========================
   FOCUS MODE
========================= */

if (focusButton) {

    focusButton.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "focus-mode"
            );
        }
    );
}


/* =========================
   NOTIFICATIONS
========================= */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            alert(
                "You have no new notifications."
            );
        }
    );
}


/* =========================
   GOALS
========================= */

if (addGoalButton) {

    addGoalButton.addEventListener(
        "click",
        () => {

            alert(
                "Goal management will be added in a future stage."
            );
        }
    );
}


/* =========================
   RESPONSIVE SIDEBAR
========================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900
        ) {

            closeSidebar();
        }
    }
);


/* =========================
   INITIALIZE
========================= */

displayCurrentDate();

loadNotes();

renderTasks();