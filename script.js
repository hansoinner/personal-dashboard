/* =========================================================
   PERSONAL DASHBOARD
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

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
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const taskCountBadge = document.getElementById("taskCountBadge");

const currentDateElement = document.getElementById("currentDate");
const currentYearElement = document.getElementById("currentYear");

const clearCompletedButton =
    document.getElementById("clearCompleted");

const filterButtons =
    document.querySelectorAll(".filter-button");

const navLinks =
    document.querySelectorAll(".sidebar-link");

const progressBar =
    document.getElementById("progressBar");

const progressPercentage =
    document.getElementById("progressPercentage");

const progressMessage =
    document.getElementById("progressMessage");

const progressTrack =
    document.querySelector(".progress-track");

const sidebar =
    document.querySelector(".sidebar");

const sidebarOverlay =
    document.querySelector(".sidebar-overlay");

const menuButton =
    document.querySelector(".menu-button");

const sidebarClose =
    document.querySelector(".sidebar-close");


/* =========================================================
   STATE
========================================================= */

let tasks = loadTasks();

let currentFilter = "all";


/* =========================================================
   LOAD TASKS
========================================================= */

function loadTasks() {

    try {

        const savedTasks =
            localStorage.getItem("dashboardTasks");

        if (!savedTasks) {
            return [];
        }

        const parsedTasks =
            JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        return parsedTasks;

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        return [];
    }
}


/* =========================================================
   SAVE TASKS
========================================================= */

function saveTasks() {

    try {

        localStorage.setItem(
            "dashboardTasks",
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error(
            "Could not save tasks:",
            error
        );
    }
}


/* =========================================================
   DATE
========================================================= */

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


/* =========================================================
   YEAR
========================================================= */

function displayCurrentYear() {

    if (!currentYearElement) {
        return;
    }

    currentYearElement.textContent =
        new Date().getFullYear();
}


/* =========================================================
   CREATE TASK
========================================================= */

function createTask(text) {

    const cleanText =
        text.trim();

    if (!cleanText) {
        return;
    }

    const newTask = {

        id:
            Date.now(),

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


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(id) {

    tasks =
        tasks.filter(
            task => task.id !== id
        );

    saveTasks();

    renderTasks();
}


/* =========================================================
   TOGGLE TASK
========================================================= */

function toggleTask(id) {

    tasks =
        tasks.map(task => {

            if (task.id !== id) {

                return task;
            }

            return {

                ...task,

                completed:
                    !task.completed
            };

        });

    saveTasks();

    renderTasks();
}


/* =========================================================
   CLEAR COMPLETED TASKS
========================================================= */

function clearCompletedTasks() {

    const hasCompletedTasks =
        tasks.some(
            task => task.completed
        );

    if (!hasCompletedTasks) {
        return;
    }

    tasks =
        tasks.filter(
            task => !task.completed
        );

    saveTasks();

    renderTasks();
}


/* =========================================================
   FILTER TASKS
========================================================= */

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


/* =========================================================
   UPDATE TASK COUNTS
========================================================= */

function updateCounts() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const active =
        total - completed;


    if (totalTasksElement) {

        totalTasksElement.textContent =
            total;
    }


    if (activeTasksElement) {

        activeTasksElement.textContent =
            active;
    }


    if (completedTasksElement) {

        completedTasksElement.textContent =
            completed;
    }


    if (allCount) {

        allCount.textContent =
            total;
    }


    if (activeCount) {

        activeCount.textContent =
            active;
    }


    if (completedCount) {

        completedCount.textContent =
            completed;
    }


    if (taskCountBadge) {

        taskCountBadge.textContent =
            total;
    }
}


/* =========================================================
   UPDATE PROGRESS
========================================================= */

function updateProgress() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );
    }


    /* Progress bar */

    if (progressBar) {

        progressBar.style.width =
            `${percentage}%`;
    }


    /* Percentage text */

    if (progressPercentage) {

        progressPercentage.textContent =
            `${percentage}%`;
    }


    /* Accessibility */

    if (progressTrack) {

        progressTrack.setAttribute(
            "aria-valuenow",
            percentage
        );
    }


    /* Progress message */

    if (!progressMessage) {
        return;
    }


    if (total === 0) {

        progressMessage.textContent =
            "Start by adding your first task.";

        return;
    }


    if (percentage === 0) {

        progressMessage.textContent =
            "You have tasks waiting for you. Let's get started.";

        return;
    }


    if (percentage < 50) {

        progressMessage.textContent =
            "Good start. Keep making progress.";

        return;
    }


    if (percentage < 100) {

        progressMessage.textContent =
            "You're making great progress. Keep going.";

        return;
    }


    progressMessage.textContent =
        "Everything is complete. Great work! 🎉";
}


/* =========================================================
   UPDATE EMPTY STATE
========================================================= */

function updateEmptyState(filteredTasks) {

    if (!emptyState) {
        return;
    }


    if (filteredTasks.length > 0) {

        emptyState.hidden =
            true;

        return;
    }


    emptyState.hidden =
        false;


    if (tasks.length === 0) {

        if (emptyStateTitle) {

            emptyStateTitle.textContent =
                "No tasks yet";
        }

        if (emptyStateMessage) {

            emptyStateMessage.textContent =
                "Add your first task to get started.";
        }

        return;
    }


    if (currentFilter === "active") {

        if (emptyStateTitle) {

            emptyStateTitle.textContent =
                "No active tasks";
        }

        if (emptyStateMessage) {

            emptyStateMessage.textContent =
                "You've completed everything. Nice work!";
        }

        return;
    }


    if (currentFilter === "completed") {

        if (emptyStateTitle) {

            emptyStateTitle.textContent =
                "No completed tasks";
        }

        if (emptyStateMessage) {

            emptyStateMessage.textContent =
                "Completed tasks will appear here.";
        }

        return;
    }


    if (emptyStateTitle) {

        emptyStateTitle.textContent =
            "No tasks here";
    }


    if (emptyStateMessage) {

        emptyStateMessage.textContent =
            "Add a task to get started.";
    }
}


/* =========================================================
   CREATE TASK ELEMENT
========================================================= */

function createTaskElement(task) {

    const taskElement =
        document.createElement("article");

    taskElement.className =
        "task-item";


    if (task.completed) {

        taskElement.classList.add(
            "completed"
        );
    }


    /* -----------------------------------------------------
       Checkbox
    ----------------------------------------------------- */

    const checkbox =
        document.createElement("input");

    checkbox.type =
        "checkbox";

    checkbox.className =
        "task-checkbox";

    checkbox.checked =
        task.completed;

    checkbox.setAttribute(
        "aria-label",
        `Mark ${task.text} as ${
            task.completed
                ? "active"
                : "completed"
        }`
    );


    checkbox.addEventListener(
        "change",
        () => {

            toggleTask(task.id);
        }
    );


    /* -----------------------------------------------------
       Task text
    ----------------------------------------------------- */

    const taskText =
        document.createElement("span");

    taskText.className =
        "task-text";

    taskText.textContent =
        task.text;


    /* -----------------------------------------------------
       Delete button
    ----------------------------------------------------- */

    const deleteButton =
        document.createElement("button");

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
        () => {

            deleteTask(task.id);
        }
    );


    /* -----------------------------------------------------
       Assemble
    ----------------------------------------------------- */

    taskElement.appendChild(
        checkbox
    );

    taskElement.appendChild(
        taskText
    );

    taskElement.appendChild(
        deleteButton
    );


    return taskElement;
}


/* =========================================================
   RENDER TASKS
========================================================= */

function renderTasks() {

    if (!taskList) {
        return;
    }


    taskList.innerHTML =
        "";


    const filteredTasks =
        getFilteredTasks();


    filteredTasks.forEach(
        task => {

            const taskElement =
                createTaskElement(task);

            taskList.appendChild(
                taskElement
            );
        }
    );


    updateEmptyState(
        filteredTasks
    );

    updateCounts();

    updateProgress();
}


/* =========================================================
   SET ACTIVE FILTER
========================================================= */

function setActiveFilter(filter) {

    currentFilter =
        filter;


    filterButtons.forEach(
        button => {

            const isActive =
                button.dataset.filter === filter;

            button.classList.toggle(
                "active",
                isActive
            );

        }
    );


    renderTasks();
}


/* =========================================================
   TASK FORM
========================================================= */

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!taskInput) {
                return;
            }


            const text =
                taskInput.value.trim();


            if (!text) {

                taskInput.focus();

                return;
            }


            createTask(text);


            taskInput.value =
                "";


            taskInput.focus();
        }
    );
}


/* =========================================================
   FILTER BUTTONS
========================================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter;

                if (!filter) {
                    return;
                }

                setActiveFilter(
                    filter
                );
            }
        );

    }
);


/* =========================================================
   CLEAR COMPLETED BUTTON
========================================================= */

if (clearCompletedButton) {

    clearCompletedButton.addEventListener(
        "click",
        clearCompletedTasks
    );
}


/* =========================================================
   SIDEBAR
========================================================= */

function openSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.add(
        "open"
    );


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "visible"
        );
    }


    document.body.classList.add(
        "menu-open"
    );
}


function closeSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.remove(
        "open"
    );


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "visible"
        );
    }


    document.body.classList.remove(
        "menu-open"
    );
}


/* =========================================================
   MOBILE MENU BUTTON
========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );
}


/* =========================================================
   SIDEBAR CLOSE BUTTON
========================================================= */

if (sidebarClose) {

    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );
}


/* =========================================================
   SIDEBAR OVERLAY
========================================================= */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );
}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.forEach(
                    navLink => {

                        navLink.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );


                /* Close mobile sidebar */

                closeSidebar();
            }
        );

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeSidebar();
        }

    }
);


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Press "/" to focus
         * the task input.
         */

        if (
            event.key === "/" &&
            taskInput &&
            document.activeElement !== taskInput
        ) {

            event.preventDefault();

            taskInput.focus();
        }

    }
);


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

function initializeDashboard() {

    displayCurrentDate();

    displayCurrentYear();

    renderTasks();

}


/* =========================================================
   START APPLICATION
========================================================= */

initializeDashboard();