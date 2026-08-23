/* ========================================
   PERSONAL DASHBOARD
   STAGE 7
======================================== */


/* ========================================
   ELEMENTS
======================================== */

// Clock

const currentDate =
    document.getElementById(
        "currentDate"
    );

const currentTime =
    document.getElementById(
        "currentTime"
    );


// Task form

const addTaskButton =
    document.getElementById(
        "addTaskButton"
    );

const taskForm =
    document.getElementById(
        "taskForm"
    );

const taskInput =
    document.getElementById(
        "taskInput"
    );

const taskCategory =
    document.getElementById(
        "taskCategory"
    );

const taskPriority =
    document.getElementById(
        "taskPriority"
    );

const taskDueDate =
    document.getElementById(
        "taskDueDate"
    );

const cancelTaskButton =
    document.getElementById(
        "cancelTaskButton"
    );


// Task controls

const taskSearch =
    document.getElementById(
        "taskSearch"
    );

const taskFilter =
    document.getElementById(
        "taskFilter"
    );

const taskSort =
    document.getElementById(
        "taskSort"
    );

const taskList =
    document.getElementById(
        "taskList"
    );


// Statistics

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


// Progress

const progressBar =
    document.getElementById(
        "progressBar"
    );

const progressPercentage =
    document.getElementById(
        "progressPercentage"
    );


// Notes

const notesInput =
    document.getElementById(
        "notesInput"
    );

const clearNotes =
    document.getElementById(
        "clearNotes"
    );


// Calendar

const calendarMonth =
    document.getElementById(
        "calendarMonth"
    );

const calendarDays =
    document.getElementById(
        "calendarDays"
    );

const previousMonth =
    document.getElementById(
        "previousMonth"
    );

const nextMonth =
    document.getElementById(
        "nextMonth"
    );

const todayButton =
    document.getElementById(
        "todayButton"
    );

const selectedDayTasks =
    document.getElementById(
        "selectedDayTasks"
    );


// Upcoming

const upcomingTasks =
    document.getElementById(
        "upcomingTasks"
    );


// Mobile navigation

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


// Analytics

const weeklyChart =
    document.getElementById(
        "weeklyChart"
    );

const weeklyCompleted =
    document.getElementById(
        "weeklyCompleted"
    );

const categoryChart =
    document.getElementById(
        "categoryChart"
    );

const priorityChart =
    document.getElementById(
        "priorityChart"
    );

const scoreValue =
    document.getElementById(
        "scoreValue"
    );

const scoreMessage =
    document.getElementById(
        "scoreMessage"
    );

const scoreCircle =
    document.querySelector(
        ".score-circle"
    );


// Toast

const toast =
    document.getElementById(
        "toast"
    );

const toastMessage =
    document.getElementById(
        "toastMessage"
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


let editingTaskId =
    null;


let calendarDate =
    new Date();


let selectedDate =
    formatDateKey(
        new Date()
    );


let sortPreference =
    localStorage.getItem(
        "dashboardTaskSort"
    ) || "created";


let toastTimeout;


/* ========================================
   RESTORE SETTINGS
======================================== */

taskSort.value =
    sortPreference;


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
   DATE KEY
======================================== */

function formatDateKey(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* ========================================
   STORAGE
======================================== */

function saveTasks() {

    localStorage.setItem(
        "dashboardTasks",
        JSON.stringify(tasks)
    );

}


/* ========================================
   DATE FORMAT
======================================== */

function formatDate(
    dateString
) {

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
   OVERDUE
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
   CAPITALIZE
======================================== */

function capitalize(value) {

    if (!value) {

        return "";

    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* ========================================
   FILTER + SORT
======================================== */

function getFilteredTasks() {

    const searchTerm =
        taskSearch.value
            .trim()
            .toLowerCase();


    const filter =
        taskFilter.value;


    let filtered =
        tasks.filter(
            task => {

                const matchesSearch =
                    task.title
                        .toLowerCase()
                        .includes(
                            searchTerm
                        );


                let matchesFilter =
                    true;


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
                        task.priority ===
                        "high";

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    return sortTasks(
        filtered,
        sortPreference
    );

}


/* ========================================
   SORT TASKS
======================================== */

function sortTasks(
    taskArray,
    sortType
) {

    const sorted =
        [...taskArray];


    switch (
        sortType
    ) {

        case "oldest":

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    getTaskTime(a) -
                    getTaskTime(b)
            );


        case "priority":

            const priorityOrder = {

                high: 1,

                medium: 2,

                low: 3

            };


            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    priorityOrder[
                        a.priority
                    ] -
                    priorityOrder[
                        b.priority
                    ]
            );


        case "dueDate":

            return sorted.sort(
                (
                    a,
                    b
                ) => {

                    if (
                        !a.dueDate &&
                        !b.dueDate
                    ) {

                        return 0;

                    }


                    if (
                        !a.dueDate
                    ) {

                        return 1;

                    }


                    if (
                        !b.dueDate
                    ) {

                        return -1;

                    }


                    return a.dueDate.localeCompare(
                        b.dueDate
                    );

                }
            );


        case "alphabetical":

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    a.title.localeCompare(
                        b.title
                    )
            );


        case "completed":

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.completed
                    ) -
                    Number(
                        b.completed
                    )
            );


        case "created":

        default:

            return sorted.sort(
                (
                    a,
                    b
                ) =>
                    getTaskTime(b) -
                    getTaskTime(a)
            );

    }

}


/* ========================================
   TASK TIME
======================================== */

function getTaskTime(task) {

    if (
        task.createdAt
    ) {

        return task.createdAt;

    }


    /*
       Backwards compatibility for
       Stage 6 tasks that used Date.now()
       as their ID.
    */

    if (
        typeof task.id ===
        "number"
    ) {

        return task.id;

    }


    return 0;

}


/* ========================================
   RENDER TASKS
======================================== */

function renderTasks() {

    taskList.innerHTML =
        "";


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


        emptyState.textContent =
            tasks.length === 0
                ? "No tasks yet. Add your first task."
                : "No tasks match your search or filter.";


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


            if (
                task.completed
            ) {

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


            /* Title */

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
                `${capitalize(
                    task.priority
                )} priority`;


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
                        ? `Overdue · ${formatDate(
                            task.dueDate
                        )}`
                        : `Due · ${formatDate(
                            task.dueDate
                        )}`;


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
   CREATE TASK
======================================== */

function createTask(
    title
) {

    const task = {

        id:
            crypto.randomUUID(),

        createdAt:
            Date.now(),

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


    refreshDashboard();


    showToast(
        "Task added successfully."
    );

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


    refreshDashboard();


    showToast(
        "Task updated successfully."
    );

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

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    tasks =
        tasks.filter(
            item =>
                item.id !== id
        );


    saveTasks();


    refreshDashboard();


    showToast(
        task
            ? `"${task.title}" deleted.`
            : "Task deleted."
    );

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


    refreshDashboard();


    showToast(
        task.completed
            ? "Task completed! ✓"
            : "Task marked as active."
    );

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
   REFRESH DASHBOARD
======================================== */

function refreshDashboard() {

    renderTasks();

    updateStats();

    renderCalendar();

    renderSelectedDayTasks();

    renderUpcomingTasks();

    renderAnalytics();

}


/* ========================================
   FORM SUBMIT
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
   CANCEL
======================================== */

cancelTaskButton.addEventListener(
    "click",
    resetTaskForm
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
   SORT
======================================== */

taskSort.addEventListener(
    "change",
    () => {

        sortPreference =
            taskSort.value;


        localStorage.setItem(
            "dashboardTaskSort",
            sortPreference
        );


        renderTasks();


        showToast(
            "Task sorting updated."
        );

    }
);


/* ========================================
   STATISTICS
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
                (
                    completed /
                    total
                ) * 100
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


        showToast(
            "Notes cleared."
        );

    }
);


/* ========================================
   CALENDAR
======================================== */

function renderCalendar() {

    calendarDays.innerHTML =
        "";


    const year =
        calendarDate.getFullYear();


    const month =
        calendarDate.getMonth();


    calendarMonth.textContent =
        calendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement(
                "div"
            );


        emptyDay.className =
            "calendar-day empty";


        calendarDays.appendChild(
            emptyDay
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            formatDateKey(
                date
            );


        const dayButton =
            document.createElement(
                "button"
            );


        dayButton.type =
            "button";


        dayButton.className =
            "calendar-day";


        if (
            dateKey ===
            formatDateKey(
                new Date()
            )
        ) {

            dayButton.classList.add(
                "today"
            );

        }


        if (
            dateKey ===
            selectedDate
        ) {

            dayButton.classList.add(
                "selected"
            );

        }


        const number =
            document.createElement(
                "span"
            );


        number.className =
            "calendar-day-number";


        number.textContent =
            day;


        dayButton.appendChild(
            number
        );


        const dateTasks =
            tasks.filter(
                task =>
                    task.dueDate ===
                    dateKey
            );


        if (
            dateTasks.length > 0
        ) {

            const dot =
                document.createElement(
                    "span"
                );


            dot.className =
                "calendar-task-dot";


            dayButton.appendChild(
                dot
            );


            if (
                dateTasks.length > 1
            ) {

                const count =
                    document.createElement(
                        "span"
                    );


                count.className =
                    "calendar-task-count";


                count.textContent =
                    dateTasks.length;


                dayButton.appendChild(
                    count
                );

            }

        }


        dayButton.addEventListener(
            "click",
            () => {

                selectedDate =
                    dateKey;


                renderCalendar();

                renderSelectedDayTasks();

            }
        );


        calendarDays.appendChild(
            dayButton
        );

    }

}


/* ========================================
   SELECTED DAY
======================================== */

function renderSelectedDayTasks() {

    selectedDayTasks.innerHTML =
        "";


    const heading =
        document.createElement(
            "p"
        );


    heading.className =
        "selected-day-title";


    const date =
        new Date(
            `${selectedDate}T00:00:00`
        );


    heading.textContent =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    selectedDayTasks.appendChild(
        heading
    );


    const dateTasks =
        tasks.filter(
            task =>
                task.dueDate ===
                selectedDate
        );


    if (
        dateTasks.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "No tasks scheduled for this day.";


        empty.style.color =
            "var(--text-muted)";


        empty.style.fontSize =
            "12px";


        selectedDayTasks.appendChild(
            empty
        );


        return;

    }


    dateTasks.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "selected-task";


            if (
                task.completed
            ) {

                item.classList.add(
                    "completed"
                );

            }


            const priority =
                document.createElement(
                    "span"
                );


            priority.className =
                `selected-task-priority ${task.priority}`;


            const title =
                document.createElement(
                    "span"
                );


            title.textContent =
                task.title;


            item.appendChild(
                priority
            );


            item.appendChild(
                title
            );


            selectedDayTasks.appendChild(
                item
            );

        }
    );

}


/* ========================================
   UPCOMING
======================================== */

function renderUpcomingTasks() {

    upcomingTasks.innerHTML =
        "";


    const upcoming =
        tasks
            .filter(
                task =>
                    task.dueDate &&
                    !task.completed
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.dueDate.localeCompare(
                        b.dueDate
                    )
            )
            .slice(
                0,
                6
            );


    if (
        upcoming.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "No upcoming tasks.";


        empty.style.color =
            "var(--text-muted)";


        empty.style.fontSize =
            "12px";


        upcomingTasks.appendChild(
            empty
        );


        return;

    }


    upcoming.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "upcoming-task";


            if (
                isOverdue(task)
            ) {

                item.classList.add(
                    "overdue"
                );

            }


            const date =
                document.createElement(
                    "p"
                );


            date.className =
                "upcoming-task-date";


            date.textContent =
                isOverdue(task)
                    ? `Overdue · ${formatDate(
                        task.dueDate
                    )}`
                    : formatDate(
                        task.dueDate
                    );


            const title =
                document.createElement(
                    "p"
                );


            title.className =
                "upcoming-task-title";


            title.textContent =
                task.title;


            const meta =
                document.createElement(
                    "div"
                );


            meta.className =
                "upcoming-task-meta";


            meta.textContent =
                `${task.category} · ${capitalize(
                    task.priority
                )} priority`;


            item.appendChild(
                date
            );


            item.appendChild(
                title
            );


            item.appendChild(
                meta
            );


            upcomingTasks.appendChild(
                item
            );

        }
    );

}


/* ========================================
   CALENDAR NAVIGATION
======================================== */

previousMonth.addEventListener(
    "click",
    () => {

        calendarDate.setMonth(
            calendarDate.getMonth() - 1
        );


        renderCalendar();

    }
);


nextMonth.addEventListener(
    "click",
    () => {

        calendarDate.setMonth(
            calendarDate.getMonth() + 1
        );


        renderCalendar();

    }
);


todayButton.addEventListener(
    "click",
    () => {

        calendarDate =
            new Date();


        selectedDate =
            formatDateKey(
                new Date()
            );


        renderCalendar();

        renderSelectedDayTasks();

    }
);


/* ========================================
   MOBILE NAVIGATION
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


sidebarOverlay.addEventListener(
    "click",
    closeMobileMenu
);


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
   ESCAPE KEY
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
   ANALYTICS
======================================== */

function renderAnalytics() {

    renderWeeklyChart();

    renderCategoryChart();

    renderPriorityChart();

    renderProductivityScore();

}


/* ========================================
   WEEKLY CHART
======================================== */

function renderWeeklyChart() {

    weeklyChart.innerHTML =
        "";


    const today =
        new Date();


    const days = [];


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


    const values =
        days.map(
            date => {

                const dateKey =
                    formatDateKey(
                        date
                    );


                return tasks.filter(
                    task =>
                        task.dueDate ===
                        dateKey &&
                        task.completed
                ).length;

            }
        );


    const totalCompleted =
        values.reduce(
            (
                total,
                value
            ) =>
                total + value,
            0
        );


    weeklyCompleted.textContent =
        totalCompleted;


    const maxValue =
        Math.max(
            ...values,
            1
        );


    days.forEach(
        (
            date,
            index
        ) => {

            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "chart-column";


            const value =
                document.createElement(
                    "span"
                );


            value.className =
                "chart-value";


            value.textContent =
                values[index];


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
                values[index] === 0
                    ? 3
                    : (
                        values[index] /
                        maxValue
                    ) * 100;


            bar.style.height =
                `${height}%`;


            wrapper.appendChild(
                bar
            );


            const label =
                document.createElement(
                    "span"
                );


            label.className =
                "chart-label";


            label.textContent =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


            column.appendChild(
                value
            );


            column.appendChild(
                wrapper
            );


            column.appendChild(
                label
            );


            weeklyChart.appendChild(
                column
            );

        }
    );

}


/* ========================================
   CATEGORY CHART
======================================== */

function renderCategoryChart() {

    categoryChart.innerHTML =
        "";


    const categories = {};


    tasks.forEach(
        task => {

            if (
                !categories[
                    task.category
                ]
            ) {

                categories[
                    task.category
                ] = 0;

            }


            categories[
                task.category
            ]++;

        }
    );


    const entries =
        Object.entries(
            categories
        );


    if (
        entries.length === 0
    ) {

        showAnalyticsEmpty(
            categoryChart,
            "No category data yet."
        );


        return;

    }


    const maxValue =
        Math.max(
            ...entries.map(
                entry =>
                    entry[1]
            ),
            1
        );


    entries.forEach(
        (
            [
                category,
                count
            ]
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "category-row";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "category-name";


            name.textContent =
                category;


            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "category-track";


            const fill =
                document.createElement(
                    "div"
                );


            fill.className =
                "category-fill";


            fill.style.width =
                `${(
                    count /
                    maxValue
                ) * 100}%`;


            track.appendChild(
                fill
            );


            const countElement =
                document.createElement(
                    "span"
                );


            countElement.className =
                "category-count";


            countElement.textContent =
                count;


            row.appendChild(
                name
            );


            row.appendChild(
                track
            );


            row.appendChild(
                countElement
            );


            categoryChart.appendChild(
                row
            );

        }
    );

}


/* ========================================
   PRIORITY CHART
======================================== */

function renderPriorityChart() {

    priorityChart.innerHTML =
        "";


    const priorities = {

        high: 0,

        medium: 0,

        low: 0

    };


    tasks.forEach(
        task => {

            if (
                priorities[
                    task.priority
                ] !== undefined
            ) {

                priorities[
                    task.priority
                ]++;

            }

        }
    );


    const maxValue =
        Math.max(
            ...Object.values(
                priorities
            ),
            1
        );


    Object.entries(
        priorities
    ).forEach(
        (
            [
                priority,
                count
            ]
        ) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "priority-row";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "priority-name";


            name.textContent =
                capitalize(
                    priority
                );


            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "priority-track";


            const fill =
                document.createElement(
                    "div"
                );


            fill.className =
                `priority-fill ${priority}`;


            fill.style.width =
                `${(
                    count /
                    maxValue
                ) * 100}%`;


            track.appendChild(
                fill
            );


            const countElement =
                document.createElement(
                    "span"
                );


            countElement.className =
                "priority-count";


            countElement.textContent =
                count;


            row.appendChild(
                name
            );


            row.appendChild(
                track
            );


            row.appendChild(
                countElement
            );


            priorityChart.appendChild(
                row
            );

        }
    );

}


/* ========================================
   PRODUCTIVITY SCORE
======================================== */

function renderProductivityScore() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    scoreValue.textContent =
        `${percentage}%`;


    const degrees =
        percentage * 3.6;


    scoreCircle.style.background =
        `conic-gradient(
            var(--primary)
            0deg,
            var(--primary)
            ${degrees}deg,
            #e9ebf0
            ${degrees}deg,
            #e9ebf0
            360deg
        )`;


    if (
        total === 0
    ) {

        scoreMessage.textContent =
            "Start completing tasks to build your score.";

    } else if (
        percentage >= 80
    ) {

        scoreMessage.textContent =
            "Excellent work. You're operating at a high level.";

    } else if (
        percentage >= 60
    ) {

        scoreMessage.textContent =
            "Great progress. Keep pushing toward your goals.";

    } else if (
        percentage >= 40
    ) {

        scoreMessage.textContent =
            "You're making progress. Stay consistent.";

    } else {

        scoreMessage.textContent =
            "Keep going. Small completed tasks add up.";

    }

}


/* ========================================
   ANALYTICS EMPTY
======================================== */

function showAnalyticsEmpty(
    container,
    message
) {

    const empty =
        document.createElement(
            "p"
        );


    empty.textContent =
        message;


    empty.style.color =
        "var(--text-muted)";


    empty.style.fontSize =
        "11px";


    container.appendChild(
        empty
    );

}


/* ========================================
   TOAST
======================================== */

function showToast(
    message,
    type = "success"
) {

    clearTimeout(
        toastTimeout
    );


    toastMessage.textContent =
        message;


    toast.className =
        "toast";


    toast.classList.add(
        type
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ========================================
   KEYBOARD SHORTCUTS
======================================== */

document.addEventListener(
    "keydown",
    event => {

        const activeElement =
            document.activeElement;


        const isTyping =
            activeElement.tagName ===
                "INPUT" ||
            activeElement.tagName ===
                "TEXTAREA" ||
            activeElement.tagName ===
                "SELECT";


        if (
            isTyping
        ) {

            return;

        }


        /* N = New task */

        if (
            event.key.toLowerCase() ===
            "n"
        ) {

            event.preventDefault();


            taskForm.classList.remove(
                "hidden"
            );


            taskInput.focus();

        }


        /* / = Search */

        if (
            event.key === "/"
        ) {

            event.preventDefault();


            taskSearch.focus();

        }


        /* Escape */

        if (
            event.key ===
            "Escape"
        ) {

            if (
                !taskForm.classList.contains(
                    "hidden"
                )
            ) {

                resetTaskForm();

            }

        }

    }
);


/* ========================================
   INITIALIZE
======================================== */

refreshDashboard();