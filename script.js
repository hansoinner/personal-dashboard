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

const taskList =
    document.getElementById("taskList");


const completedCount =
    document.getElementById("completedCount");

const remainingCount =
    document.getElementById("remainingCount");

const productivity =
    document.getElementById("productivity");


const progressBar =
    document.getElementById("progressBar");

const progressPercentage =
    document.getElementById("progressPercentage");


const notesInput =
    document.getElementById("notesInput");

const clearNotes =
    document.getElementById("clearNotes");


/* ========================================
   MOBILE NAVIGATION ELEMENTS
======================================== */

const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );

const sidebar =
    document.getElementById("sidebar");

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


/* ========================================
   CLOCK
======================================== */

function updateClock() {

    const now = new Date();


    const date =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    const time =
        now.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    currentDate.textContent =
        date;

    currentTime.textContent =
        time;
}


updateClock();


setInterval(
    updateClock,
    1000
);


/* ========================================
   SAVE TASKS
======================================== */

function saveTasks() {

    localStorage.setItem(
        "dashboardTasks",
        JSON.stringify(tasks)
    );

}


/* ========================================
   RENDER TASKS
======================================== */

function renderTasks() {

    taskList.innerHTML = "";


    tasks.forEach(
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
                `Mark ${task.title} as complete`
            );


            checkbox.addEventListener(
                "change",
                () => {

                    task.completed =
                        checkbox.checked;


                    saveTasks();

                    renderTasks();

                    updateStats();

                }
            );


            /* Task title */

            const title =
                document.createElement(
                    "span"
                );


            title.className =
                "task-title";


            title.textContent =
                task.title;


            /* Delete button */

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
                `Delete ${task.title}`
            );


            deleteButton.addEventListener(
                "click",
                () => {

                    tasks =
                        tasks.filter(
                            item =>
                                item.id !== task.id
                        );


                    saveTasks();

                    renderTasks();

                    updateStats();

                }
            );


            /* Build task */

            li.appendChild(
                checkbox
            );

            li.appendChild(
                title
            );

            li.appendChild(
                deleteButton
            );


            taskList.appendChild(
                li
            );

        }
    );

}


/* ========================================
   ADD TASK
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


        const task = {

            id: Date.now(),

            title: title,

            completed: false

        };


        tasks.push(task);


        saveTasks();


        renderTasks();


        updateStats();


        taskInput.value = "";


        taskInput.focus();

    }
);


/* ========================================
   SHOW TASK FORM
======================================== */

addTaskButton.addEventListener(
    "click",
    () => {

        taskForm.classList.toggle(
            "hidden"
        );


        if (
            !taskForm.classList.contains(
                "hidden"
            )
        ) {

            taskInput.focus();

        }

    }
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


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


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

        notesInput.value = "";


        localStorage.removeItem(
            "dashboardNotes"
        );

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


/* ========================================
   TOGGLE MOBILE MENU
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
   CLOSE ON OVERLAY CLICK
======================================== */

sidebarOverlay.addEventListener(
    "click",
    closeMobileMenu
);


/* ========================================
   NAVIGATION LINKS
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
   INITIALIZE
======================================== */

renderTasks();

updateStats();