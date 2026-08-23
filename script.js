/* ========================================
   ELEMENTS
======================================== */

const currentDate =
    document.getElementById("currentDate");

const currentTime =
    document.getElementById("currentTime");


const addTaskButton =
    document.getElementById("addTaskButton");

const taskForm =
    document.getElementById("taskForm");

const taskInput =
    document.getElementById("taskInput");

const taskCategory =
    document.getElementById("taskCategory");

const taskPriority =
    document.getElementById("taskPriority");

const taskDueDate =
    document.getElementById("taskDueDate");

const cancelTaskButton =
    document.getElementById(
        "cancelTaskButton"
    );

const taskSearch =
    document.getElementById("taskSearch");

const taskFilter =
    document.getElementById("taskFilter");

const taskList =
    document.getElementById("taskList");


const completedCount =
    document.getElementById(
        "completedCount"
    );

const remainingCount =
    document.getElementById(
        "remainingCount"
    );

const productivity =
    document.getElementById(
        "productivity"
    );


const progressBar =
    document.getElementById(
        "progressBar"
    );

const progressPercentage =
    document.getElementById(
        "progressPercentage"
    );


const notesInput =
    document.getElementById(
        "notesInput"
    );

const clearNotes =
    document.getElementById(
        "clearNotes"
    );


/* ========================================
   MOBILE NAVIGATION
======================================== */

const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );

const navigationLinks =
    document.querySelectorAll(
        ".nav-link"
    );


/* ========================================
   STATE
======================================== */

let tasks =
    JSON.parse(
        localStorage.getItem(
            "dashboardTasks"
        )
    ) || [];


let editingTaskId = null;


/* ========================================
   CLOCK
======================================== */

function updateClock() {

    const now =
        new Date();


    currentDate.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    currentTime.textContent =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}


updateClock();


setInterval(
    updateClock,
    1000
);


/* ========================================
   TASK STORAGE
======================================== */

function saveTasks() {

    localStorage.setItem(
        "dashboardTasks",
        JSON.stringify(tasks)
    );

}


/* ========================================
   FORMAT DATE
======================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* ========================================
   CHECK OVERDUE
======================================== */

function isOverdue(task) {

    if (
        !task.dueDate ||
        task.completed
    ) {

        return false;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const dueDate =
        new Date(
            `${task.dueDate}T00:00:00`
        );


    return dueDate < today;

}


/* ========================================
   GET FILTERED TASKS
======================================== */

function getFilteredTasks() {

    const searchTerm =
        taskSearch.value
            .trim()
            .toLowerCase();


    const filter =
        taskFilter.value;


    return tasks.filter(
        task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(searchTerm);


            let matchesFilter = true;


            if (
                filter === "active"
            ) {

                matchesFilter =
                    !task.completed;

            }


            if (
                filter === "completed"
            ) {

                matchesFilter =
                    task.completed;

            }


            if (
                filter === "high"
            ) {

                matchesFilter =
                    task.priority === "high";

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        }
    );

}


/* ========================================
   RENDER TASKS
======================================== */

function renderTasks() {

    taskList.innerHTML = "";


    const filteredTasks =
        getFilteredTasks();


    if (
        filteredTasks.length === 0
    ) {

        const emptyState =
            document.createElement(
                "li"
            );


        emptyState.className =
            "task-empty-state";


        if (tasks.length === 0) {

            emptyState.textContent =
                "No tasks yet. Add your first task.";

        } else {

            emptyState.textContent =
                "No tasks match your search or filter.";

        }


        taskList.appendChild(
            emptyState
        );


        return;

    }


    filteredTasks.forEach(
        task => {

            const li =
                document.createElement(
                    "li"
                );


            li.className =
                "task-item";


            if (task.completed) {

                li.classList.add(
                    "completed"
                );

            }


            /* Checkbox */

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
                `Complete ${task.title}`
            );


            checkbox.addEventListener(
                "change",
                () => {

                    toggleTask(
                        task.id
                    );

                }
            );


            /* Content */

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "task-content";


            /* Title row */

            const titleRow =
                document.createElement(
                    "div"
                );


            titleRow.className =
                "task-title-row";


            const title =
                document.createElement(
                    "span"
                );


            title.className =
                "task-title";


            title.textContent =
                task.title;


            titleRow.appendChild(
                title
            );


            /* Metadata */

            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "task-meta";


            /* Category */

            const category =
                document.createElement(
                    "span"
                );


            category.className =
                "task-category";


            category.textContent =
                task.category;


            meta.appendChild(
                category
            );


            /* Priority */

            const priority =
                document.createElement(
                    "span"
                );


            priority.className =
                `task-priority ${task.priority}`;


            priority.textContent =
                `${capitalize(task.priority)} priority`;


            meta.appendChild(
                priority
            );


            /* Due date */

            if (
                task.dueDate
            ) {

                const dueDate =
                    document.createElement(
                        "span"
                    );


                dueDate.className =
                    "task-due-date";


                if (
                    isOverdue(task)
                ) {

                    dueDate.classList.add(
                        "overdue"
                    );

                }


                dueDate.textContent =
                    isOverdue(task)
                        ? `Overdue · ${formatDate(task.dueDate)}`
                        : `Due · ${formatDate(task.dueDate)}`;


                meta.appendChild(
                    dueDate
                );

            }


            content.appendChild(
                titleRow
            );

            content.appendChild(
                meta
            );


            /* Actions */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "task-actions";


            /* Edit */

            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";


            editButton.className =
                "task-action";


            editButton.textContent =
                "✎";


            editButton.setAttribute(
                "aria-label",
                `Edit ${task.title}`
            );


            editButton.addEventListener(
                "click",
                () => {

                    editTask(
                        task.id
                    );

                }
            );


            /* Delete */

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "task-action delete";


            deleteButton.textContent =
                "×";


            deleteButton.setAttribute(
                "aria-label",
                `Delete ${task.title}`
            );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTask(
                        task.id
                    );

                }
            );


            actions.appendChild(
                editButton
            );

            actions.appendChild(
                deleteButton
            );


            /* Build */

            li.appendChild(
                checkbox
            );

            li.appendChild(
                content
            );

            li.appendChild(
                actions
            );


            taskList.appendChild(
                li
            );

        }
    );

}


/* ========================================
   CAPITALIZE
======================================== */

function capitalize(value) {

    return value
        .charAt(0)
        .toUpperCase() +
        value.slice(1);

}


/* ========================================
   ADD / EDIT TASK
======================================== */

taskForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const title =
            taskInput.value.trim();


        if (!title) {

            taskInput.focus();

            return;

        }


        if (
            editingTaskId !== null
        ) {

            updateTask(
                editingTaskId,
                title
            );

        } else {

            createTask(
                title
            );

        }

    }
);


/* ========================================
   CREATE TASK
======================================== */

function createTask(title) {

    const task = {

        id: Date.now(),

        title: title,

        category:
            taskCategory.value,

        priority:
            taskPriority.value,

        dueDate:
            taskDueDate.value,

        completed: false

    };


    tasks.unshift(
        task
    );


    saveTasks();


    resetTaskForm();


    renderTasks();

    updateStats();

}


/* ========================================
   UPDATE TASK
======================================== */

function updateTask(
    id,
    title
) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) {
        return;
    }


    task.title =
        title;

    task.category =
        taskCategory.value;

    task.priority =
        taskPriority.value;

    task.dueDate =
        taskDueDate.value;


    saveTasks();


    resetTaskForm();


    renderTasks();

    updateStats();

}


/* ========================================
   EDIT TASK
======================================== */

function editTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) {
        return;
    }


    editingTaskId =
        task.id;


    taskInput.value =
        task.title;


    taskCategory.value =
        task.category;


    taskPriority.value =
        task.priority;


    taskDueDate.value =
        task.dueDate || "";


    taskForm.classList.remove(
        "hidden"
    );


    const submitButton =
        taskForm.querySelector(
            'button[type="submit"]'
        );


    submitButton.textContent =
        "Save Changes";


    addTaskButton.textContent =
        "Editing Task";


    taskInput.focus();


    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


/* ========================================
   DELETE TASK
======================================== */

function deleteTask(id) {

    tasks =
        tasks.filter(
            task =>
                task.id !== id
        );


    saveTasks();


    renderTasks();

    updateStats();

}


/* ========================================
   TOGGLE TASK
======================================== */

function toggleTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) {
        return;
    }


    task.completed =
        !task.completed;


    saveTasks();


    renderTasks();

    updateStats();

}


/* ========================================
   RESET FORM
======================================== */

function resetTaskForm() {

    taskForm.reset();


    taskCategory.value =
        "Development";


    taskPriority.value =
        "medium";


    editingTaskId =
        null;


    taskForm.classList.add(
        "hidden"
    );


    const submitButton =
        taskForm.querySelector(
            'button[type="submit"]'
        );


    submitButton.textContent =
        "Add Task";


    addTaskButton.textContent =
        "+ Add Task";

}


/* ========================================
   ADD TASK BUTTON
======================================== */

addTaskButton.addEventListener(
    "click",
    () => {

        if (
            !taskForm.classList.contains(
                "hidden"
            )
        ) {

            resetTaskForm();

            return;

        }


        taskForm.classList.remove(
            "hidden"
        );


        taskInput.focus();

    }
);


/* ========================================
   CANCEL TASK
======================================== */

cancelTaskButton.addEventListener(
    "click",
    () => {

        resetTaskForm();

    }
);


/* ========================================
   SEARCH
======================================== */

taskSearch.addEventListener(
    "input",
    renderTasks
);


/* ========================================
   FILTER
======================================== */

taskFilter.addEventListener(
    "change",
    renderTasks
);


/* ========================================
   UPDATE STATISTICS
======================================== */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const remaining =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) *
                100
            );


    completedCount.textContent =
        completed;


    remainingCount.textContent =
        remaining;


    productivity.textContent =
        `${percentage}%`;


    progressPercentage.textContent =
        `${percentage}%`;


    progressBar.style.width =
        `${percentage}%`;

}


/* ========================================
   NOTES
======================================== */

notesInput.value =
    localStorage.getItem(
        "dashboardNotes"
    ) || "";


notesInput.addEventListener(
    "input",
    () => {

        localStorage.setItem(
            "dashboardNotes",
            notesInput.value
        );

    }
);


clearNotes.addEventListener(
    "click",
    () => {

        notesInput.value =
            "";


        localStorage.removeItem(
            "dashboardNotes"
        );

    }
);


/* ========================================
   MOBILE MENU
======================================== */

function openMobileMenu() {

    sidebar.classList.add(
        "open"
    );


    sidebarOverlay.classList.add(
        "active"
    );


    mobileMenuButton.setAttribute(
        "aria-expanded",
        "true"
    );


    mobileMenuButton.setAttribute(
        "aria-label",
        "Close navigation"
    );


    mobileMenuButton.textContent =
        "×";


    document.body.style.overflow =
        "hidden";

}


function closeMobileMenu() {

    sidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "active"
    );


    mobileMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );


    mobileMenuButton.setAttribute(
        "aria-label",
        "Open navigation"
    );


    mobileMenuButton.textContent =
        "☰";


    document.body.style.overflow =
        "";

}


/* ========================================
   MOBILE MENU TOGGLE
======================================== */

mobileMenuButton.addEventListener(
    "click",
    () => {

        const isOpen =
            sidebar.classList.contains(
                "open"
            );


        if (isOpen) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    }
);


/* ========================================
   OVERLAY
======================================== */

sidebarOverlay.addEventListener(
    "click",
    closeMobileMenu
);


/* ========================================
   NAVIGATION
======================================== */

navigationLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                navigationLinks.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );


                closeMobileMenu();

            }
        );

    }
);


/* ========================================
   ESCAPE
======================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            sidebar.classList.contains(
                "open"
            )
        ) {

            closeMobileMenu();

        }

    }
);


/* ========================================
   INITIALIZE
======================================== */

renderTasks();

updateStats();