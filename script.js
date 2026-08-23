/* =========================================================
   PERSONAL DASHBOARD
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

/* ---------- Task Elements ---------- */

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const clearCompletedButton =
    document.getElementById("clearCompleted");

const filterButtons =
    document.querySelectorAll(".filter-button");

const taskCountLabel =
    document.getElementById("taskCountLabel");


/* ---------- Statistics ---------- */

const totalTasksElement =
    document.getElementById("totalTasks");

const activeTasksElement =
    document.getElementById("activeTasks");

const completedTasksElement =
    document.getElementById("completedTasks");

const completionRateElement =
    document.getElementById("completionRate");

const completionChangeElement =
    document.getElementById("completionChange");


/* ---------- Date ---------- */

const currentDateElement =
    document.getElementById("currentDate");


/* ---------- Progress ---------- */

const progressFill =
    document.getElementById("progressFill");

const progressPercentage =
    document.getElementById("progressPercentage");


/* ---------- Activity ---------- */

const activityList =
    document.getElementById("activityList");


/* ---------- Mobile Navigation ---------- */

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const sidebarLinks =
    document.querySelectorAll(".sidebar-link");


/* ---------- Top Bar ---------- */

const focusTaskButton =
    document.getElementById("focusTaskButton");

const scrollTopButton =
    document.getElementById("scrollTopButton");


/* ---------- Quick Actions ---------- */

const quickAddTask =
    document.getElementById("quickAddTask");

const quickShowActive =
    document.getElementById("quickShowActive");

const quickShowCompleted =
    document.getElementById("quickShowCompleted");

const quickClearCompleted =
    document.getElementById("quickClearCompleted");


/* =========================================================
   STATE
========================================================= */

let tasks = [];

let currentFilter = "all";

let activities = [];


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const TASKS_STORAGE_KEY =
    "dashboardTasks";

const ACTIVITY_STORAGE_KEY =
    "dashboardActivities";


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const savedTasks =
            localStorage.getItem(
                TASKS_STORAGE_KEY
            );


        const savedActivities =
            localStorage.getItem(
                ACTIVITY_STORAGE_KEY
            );


        tasks =
            savedTasks
                ? JSON.parse(savedTasks)
                : [];


        activities =
            savedActivities
                ? JSON.parse(savedActivities)
                : [];


        /*
           Make sure the stored data
           has the expected format.
        */

        if (!Array.isArray(tasks)) {

            tasks = [];

        }


        if (!Array.isArray(activities)) {

            activities = [];

        }


    } catch (error) {

        console.error(
            "Could not load dashboard data:",
            error
        );


        tasks = [];

        activities = [];

    }

}


/* =========================================================
   SAVE TASKS
========================================================= */

function saveTasks() {

    try {

        localStorage.setItem(
            TASKS_STORAGE_KEY,
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
   SAVE ACTIVITIES
========================================================= */

function saveActivities() {

    try {

        localStorage.setItem(
            ACTIVITY_STORAGE_KEY,
            JSON.stringify(activities)
        );

    } catch (error) {

        console.error(
            "Could not save activities:",
            error
        );

    }

}


/* =========================================================
   DATE
========================================================= */

function displayCurrentDate() {

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


    if (currentDateElement) {

        currentDateElement.textContent =
            formattedDate;

    }

}


/* =========================================================
   ADD ACTIVITY
========================================================= */

function addActivity(
    message,
    icon = "✓"
) {

    const activity = {

        id:
            Date.now(),

        message:
            message,

        icon:
            icon,

        timestamp:
            new Date().toISOString()

    };


    activities.unshift(activity);


    /*
       Keep only the latest
       10 activities.
    */

    activities =
        activities.slice(0, 10);


    saveActivities();

    renderActivities();

}


/* =========================================================
   FORMAT ACTIVITY TIME
========================================================= */

function formatActivityTime(
    timestamp
) {

    const activityDate =
        new Date(timestamp);


    const now =
        new Date();


    const difference =
        now - activityDate;


    const seconds =
        Math.floor(
            difference / 1000
        );


    if (seconds < 60) {

        return "Just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes}m ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours}h ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 7) {

        return `${days}d ago`;

    }


    return activityDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   RENDER ACTIVITIES
========================================================= */

function renderActivities() {

    if (!activityList) {

        return;

    }


    activityList.innerHTML = "";


    if (activities.length === 0) {

        activityList.innerHTML = `

            <div class="activity-item">

                <div class="activity-icon">
                    ✓
                </div>

                <div class="activity-content">

                    <p class="activity-text">
                        No recent activity.
                    </p>

                    <p class="activity-time">
                        Start by adding a task.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    activities.forEach(
        activity => {

            const activityElement =
                document.createElement(
                    "div"
                );


            activityElement.className =
                "activity-item";


            activityElement.innerHTML = `

                <div class="activity-icon">
                    ${escapeHTML(activity.icon)}
                </div>

                <div class="activity-content">

                    <p class="activity-text">
                        ${escapeHTML(activity.message)}
                    </p>

                    <p class="activity-time">
                        ${formatActivityTime(
                            activity.timestamp
                        )}
                    </p>

                </div>

            `;


            activityList.appendChild(
                activityElement
            );

        }
    );

}


/* =========================================================
   CREATE TASK
========================================================= */

function createTask(text) {

    const newTask = {

        id:
            Date.now(),

        text:
            text,

        completed:
            false,

        createdAt:
            new Date().toISOString()

    };


    tasks.push(newTask);


    saveTasks();


    addActivity(
        `Added task "${text}"`,
        "+"
    );


    renderTasks();


    /*
       Make sure the task section
       is visible after adding.
    */

    setFilter("all");

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {

        return;

    }


    tasks =
        tasks.filter(
            task => task.id !== id
        );


    saveTasks();


    addActivity(
        `Deleted task "${task.text}"`,
        "×"
    );


    renderTasks();

}


/* =========================================================
   TOGGLE TASK
========================================================= */

function toggleTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {

        return;

    }


    task.completed =
        !task.completed;


    saveTasks();


    if (task.completed) {

        addActivity(
            `Completed task "${task.text}"`,
            "✓"
        );

    } else {

        addActivity(
            `Reopened task "${task.text}"`,
            "↻"
        );

    }


    renderTasks();

}


/* =========================================================
   CLEAR COMPLETED TASKS
========================================================= */

function clearCompletedTasks() {

    const completedCount =
        tasks.filter(
            task => task.completed
        ).length;


    if (completedCount === 0) {

        return;

    }


    tasks =
        tasks.filter(
            task => !task.completed
        );


    saveTasks();


    addActivity(
        `Cleared ${completedCount} completed ${
            completedCount === 1
                ? "task"
                : "tasks"
        }`,
        "×"
    );


    renderTasks();

}


/* =========================================================
   GET FILTERED TASKS
========================================================= */

function getFilteredTasks() {

    if (
        currentFilter ===
        "active"
    ) {

        return tasks.filter(
            task => !task.completed
        );

    }


    if (
        currentFilter ===
        "completed"
    ) {

        return tasks.filter(
            task => task.completed
        );

    }


    return tasks;

}


/* =========================================================
   RENDER TASKS
========================================================= */

function renderTasks() {

    if (!taskList) {

        return;

    }


    taskList.innerHTML = "";


    const filteredTasks =
        getFilteredTasks();


    /*
       Empty state
    */

    if (
        filteredTasks.length ===
        0
    ) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    /*
       Create task elements
    */

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
                `Mark "${task.text}" as ${
                    task.completed
                        ? "active"
                        : "completed"
                }`
            );


            checkbox.addEventListener(
                "change",
                () =>
                    toggleTask(
                        task.id
                    )
            );


            /*
               Task text
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
               Delete button
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
                () =>
                    deleteTask(
                        task.id
                    )
            );


            /*
               Assemble task
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


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const active =
        total - completed;


    let completion =
        0;


    if (total > 0) {

        completion =
            Math.round(
                (completed / total) *
                100
            );

    }


    /*
       Statistics
    */

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


    if (completionRateElement) {

        completionRateElement.textContent =
            `${completion}%`;

    }


    if (completionChangeElement) {

        completionChangeElement.textContent =
            `${completion}%`;

    }


    /*
       Progress card
    */

    if (progressFill) {

        progressFill.style.width =
            `${completion}%`;

    }


    if (progressPercentage) {

        progressPercentage.textContent =
            `${completion}%`;

    }


    /*
       Task count
    */

    if (taskCountLabel) {

        const count =
            getFilteredTasks().length;


        taskCountLabel.textContent =
            `${count} ${
                count === 1
                    ? "task"
                    : "tasks"
            }`;

    }

}


/* =========================================================
   SET FILTER
========================================================= */

function setFilter(filter) {

    currentFilter =
        filter;


    filterButtons.forEach(
        button => {

            const isActive =
                button.dataset.filter ===
                filter;


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


            const text =
                taskInput.value.trim();


            if (text === "") {

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

                setFilter(
                    button.dataset.filter
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
   FOCUS TASK BUTTON
========================================================= */

if (focusTaskButton) {

    focusTaskButton.addEventListener(
        "click",
        () => {

            if (taskInput) {

                taskInput.focus();

                taskInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }
    );

}


/* =========================================================
   QUICK ADD TASK
========================================================= */

if (quickAddTask) {

    quickAddTask.addEventListener(
        "click",
        () => {

            if (taskInput) {

                taskInput.focus();

                taskInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        }
    );

}


/* =========================================================
   QUICK SHOW ACTIVE
========================================================= */

if (quickShowActive) {

    quickShowActive.addEventListener(
        "click",
        () => {

            setFilter("active");

            document
                .getElementById("tasks")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


/* =========================================================
   QUICK SHOW COMPLETED
========================================================= */

if (quickShowCompleted) {

    quickShowCompleted.addEventListener(
        "click",
        () => {

            setFilter("completed");

            document
                .getElementById("tasks")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


/* =========================================================
   QUICK CLEAR COMPLETED
========================================================= */

if (quickClearCompleted) {

    quickClearCompleted.addEventListener(
        "click",
        clearCompletedTasks
    );

}


/* =========================================================
   SCROLL TO TOP
========================================================= */

if (scrollTopButton) {

    scrollTopButton.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openSidebar() {

    sidebar?.classList.add(
        "open"
    );

    sidebarOverlay?.classList.add(
        "active"
    );

}


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );

    sidebarOverlay?.classList.remove(
        "active"
    );

}


if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

sidebarLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                sidebarLinks.forEach(
                    sidebarLink => {

                        sidebarLink.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );


                closeSidebar();

            }
        );

    }
);


/* =========================================================
   UPDATE ACTIVE SIDEBAR LINK
   WHEN USER SCROLLS
========================================================= */

const sections = [
    "dashboard",
    "tasks",
    "activity",
    "progress",
    "quick-actions"
];


function updateActiveNavigation() {

    const scrollPosition =
        window.scrollY + 150;


    let currentSection =
        "dashboard";


    sections.forEach(
        sectionId => {

            const section =
                document.getElementById(
                    sectionId
                );


            if (!section) {

                return;

            }


            if (
                section.offsetTop <=
                scrollPosition
            ) {

                currentSection =
                    sectionId;

            }

        }
    );


    sidebarLinks.forEach(
        link => {

            const href =
                link.getAttribute(
                    "href"
                );


            link.classList.toggle(
                "active",
                href ===
                `#${currentSection}`
            );

        }
    );

}


window.addEventListener(
    "scroll",
    updateActiveNavigation
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value;


    return element.innerHTML;

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           "/" focuses task input.
        */

        if (
            event.key === "/" &&
            document.activeElement !==
                taskInput
        ) {

            event.preventDefault();

            taskInput?.focus();

        }


        /*
           Escape closes mobile sidebar.
        */

        if (
            event.key === "Escape"
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

function initializeDashboard() {

    loadData();

    displayCurrentDate();

    renderTasks();

    renderActivities();

    updateStats();

    updateActiveNavigation();

}


/* =========================================================
   START APPLICATION
========================================================= */

initializeDashboard();