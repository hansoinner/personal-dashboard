/* =========================================================
   PERSONAL DASHBOARD
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

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

const dashboardCompletionRateElement =
    document.getElementById(
        "dashboardCompletionRate"
    );

const currentDateElement =
    document.getElementById("currentDate");

const clearCompletedButton =
    document.getElementById(
        "clearCompleted"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );

const focusTaskButton =
    document.getElementById(
        "focusTaskButton"
    );

const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );

const sidebar =
    document.querySelector(".sidebar");

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


/* =========================================================
   ANALYTICS DOM ELEMENTS
========================================================= */

const weeklyChart =
    document.getElementById(
        "weeklyChart"
    );

const completionRateElement =
    document.getElementById(
        "completionRate"
    );

const analyticsCompletedElement =
    document.getElementById(
        "analyticsCompleted"
    );

const analyticsRemainingElement =
    document.getElementById(
        "analyticsRemaining"
    );

const completionCircle =
    document.getElementById(
        "completionCircle"
    );


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

        const storedTasks =
            JSON.parse(
                localStorage.getItem(
                    "dashboardTasks"
                )
            );


        if (!Array.isArray(storedTasks)) {

            return [];

        }


        /*
           Upgrade older tasks.

           This makes the new Stage 16
           compatible with tasks created
           in earlier versions.
        */

        return storedTasks.map(task => {

            return {

                ...task,

                createdAt:
                    task.createdAt ||
                    new Date().toISOString(),

                completedAt:
                    task.completedAt ||
                    null

            };

        });

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        return [];

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
   SAVE TASKS
========================================================= */

function saveTasks() {

    localStorage.setItem(
        "dashboardTasks",
        JSON.stringify(tasks)
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
            new Date().toISOString(),

        completedAt:
            null

    };


    tasks.push(
        newTask
    );


    saveTasks();

    renderTasks();

    updateAnalytics();

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(id) {

    tasks =
        tasks.filter(
            task =>
                task.id !== id
        );


    saveTasks();

    renderTasks();

    updateAnalytics();

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


            const completed =
                !task.completed;


            return {

                ...task,

                completed,

                completedAt:
                    completed
                        ? new Date().toISOString()
                        : null

            };

        });


    saveTasks();

    renderTasks();

    updateAnalytics();

}


/* =========================================================
   CLEAR COMPLETED
========================================================= */

function clearCompletedTasks() {

    tasks =
        tasks.filter(
            task =>
                !task.completed
        );


    saveTasks();

    renderTasks();

    updateAnalytics();

}


/* =========================================================
   FILTER TASKS
========================================================= */

function getFilteredTasks() {

    if (
        currentFilter ===
        "active"
    ) {

        return tasks.filter(
            task =>
                !task.completed
        );

    }


    if (
        currentFilter ===
        "completed"
    ) {

        return tasks.filter(
            task =>
                task.completed
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
        emptyState
    ) {

        if (
            filteredTasks.length === 0
        ) {

            emptyState.style.display =
                "block";

        } else {

            emptyState.style.display =
                "none";

        }

    }


    /*
       Render tasks
    */

    filteredTasks.forEach(task => {

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


        deleteButton.className =
            "delete-task";


        deleteButton.type =
            "button";


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

    });


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
            task =>
                task.completed
        ).length;


    const active =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    if (
        totalTasksElement
    ) {

        totalTasksElement.textContent =
            total;

    }


    if (
        activeTasksElement
    ) {

        activeTasksElement.textContent =
            active;

    }


    if (
        completedTasksElement
    ) {

        completedTasksElement.textContent =
            completed;

    }


    if (
        dashboardCompletionRateElement
    ) {

        dashboardCompletionRateElement.textContent =
            `${percentage}%`;

    }

}


/* =========================================================
   ADD TASK FORM
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


            createTask(
                text
            );


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


/* =========================================================
   CLEAR COMPLETED BUTTON
========================================================= */

if (
    clearCompletedButton
) {

    clearCompletedButton.addEventListener(
        "click",
        clearCompletedTasks
    );

}


/* =========================================================
   ADD TASK BUTTON
========================================================= */

if (
    focusTaskButton
) {

    focusTaskButton.addEventListener(
        "click",
        () => {

            const tasksSection =
                document.getElementById(
                    "tasks"
                );


            if (tasksSection) {

                tasksSection.scrollIntoView(
                    {
                        behavior:
                            "smooth"
                    }
                );

            }


            setTimeout(
                () => {

                    if (taskInput) {

                        taskInput.focus();

                    }

                },
                400
            );

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }


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

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "visible"
        );

    }


    document.body.classList.remove(
        "menu-open"
    );

}


if (
    mobileMenuButton
) {

    mobileMenuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (
    sidebarOverlay
) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


sidebarLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            closeSidebar
        );

    }
);


/* =========================================================
   GET LAST 7 DAYS
========================================================= */

function getLastSevenDays() {

    const days = [];

    const today =
        new Date();


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                today
            );


        date.setDate(
            today.getDate() - i
        );


        days.push(
            date
        );

    }


    return days;

}


/* =========================================================
   DAY LABEL
========================================================= */

function formatDayLabel(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday:
                "short"
        }
    );

}


/* =========================================================
   WEEKLY ACTIVITY
========================================================= */

function getWeeklyActivity() {

    const days =
        getLastSevenDays();


    return days.map(
        day => {

            const year =
                day.getFullYear();


            const month =
                day.getMonth();


            const date =
                day.getDate();


            const count =
                tasks.filter(
                    task => {

                        if (
                            !task.completed ||
                            !task.completedAt
                        ) {

                            return false;

                        }


                        const completedDate =
                            new Date(
                                task.completedAt
                            );


                        return (

                            completedDate.getFullYear()
                            === year &&

                            completedDate.getMonth()
                            === month &&

                            completedDate.getDate()
                            === date

                        );

                    }
                ).length;


            return {

                date,

                label:
                    formatDayLabel(
                        day
                    ),

                count

            };

        }
    );

}


/* =========================================================
   RENDER WEEKLY CHART
========================================================= */

function renderWeeklyChart() {

    if (!weeklyChart) {
        return;
    }


    const activity =
        getWeeklyActivity();


    weeklyChart.innerHTML =
        "";


    const maximum =
        Math.max(
            ...activity.map(
                day =>
                    day.count
            ),
            1
        );


    activity.forEach(
        day => {

            const dayElement =
                document.createElement(
                    "div"
                );


            dayElement.className =
                "chart-day";


            const value =
                document.createElement(
                    "span"
                );


            value.className =
                "chart-value";


            value.textContent =
                day.count;


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "chart-bar-wrapper";


            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "chart-bar";


            const height =
                Math.max(
                    (
                        day.count /
                        maximum
                    ) * 100,
                    3
                );


            bar.style.height =
                `${height}%`;


            const label =
                document.createElement(
                    "span"
                );


            label.className =
                "chart-label";


            label.textContent =
                day.label;


            wrapper.appendChild(
                bar
            );


            dayElement.appendChild(
                value
            );


            dayElement.appendChild(
                wrapper
            );


            dayElement.appendChild(
                label
            );


            weeklyChart.appendChild(
                dayElement
            );

        }
    );

}


/* =========================================================
   COMPLETION ANALYTICS
========================================================= */

function updateCompletionAnalytics() {

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const total =
        tasks.length;


    const remaining =
        total -
        completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    if (
        completionRateElement
    ) {

        completionRateElement.textContent =
            `${percentage}%`;

    }


    if (
        analyticsCompletedElement
    ) {

        analyticsCompletedElement.textContent =
            completed;

    }


    if (
        analyticsRemainingElement
    ) {

        analyticsRemainingElement.textContent =
            remaining;

    }


    if (
        completionCircle
    ) {

        const degrees =
            percentage *
            3.6;


        completionCircle.style.background =
            `conic-gradient(
                var(--primary) ${degrees}deg,
                #e8edf4 ${degrees}deg
            )`;

    }

}


/* =========================================================
   UPDATE ANALYTICS
========================================================= */

function updateAnalytics() {

    updateStats();

    renderWeeklyChart();

    updateCompletionAnalytics();

}


/* =========================================================
   INITIALIZE
========================================================= */

displayCurrentDate();

renderTasks();

updateAnalytics();