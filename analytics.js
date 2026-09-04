/* =========================================================
   PERSONAL DASHBOARD — STAGE 6
   Productivity analytics and insights
========================================================= */

(() => {
    const taskStorageKey = "dashboardTasks";
    const root = document.querySelector(".dashboard-grid");
    if (!root) return;

    const getTasks = () => {
        try {
            const value = JSON.parse(localStorage.getItem(taskStorageKey) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    };

    const today = new Date().toISOString().slice(0, 10);
    const tasks = getTasks();
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    const overdue = tasks.filter(task => !task.completed && task.dueDate && task.dueDate < today).length;
    const dueToday = tasks.filter(task => !task.completed && task.dueDate === today).length;
    const high = tasks.filter(task => task.priority === "high").length;
    const medium = tasks.filter(task => task.priority === "medium").length;
    const low = tasks.filter(task => task.priority === "low").length;
    const rate = total ? Math.round((completed / total) * 100) : 0;

    const style = document.createElement("style");
    style.textContent = `
        .analytics-card { grid-column: 1 / -1; }
        .analytics-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.75rem; }
        .analytics-stat { padding:1rem; border:1px solid var(--border-soft); border-radius:10px; background:var(--surface-soft); }
        .analytics-stat-label { color:var(--text-muted); font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
        .analytics-stat-value { margin-top:.25rem; font-size:1.5rem; font-weight:800; }
        .analytics-stat-detail { margin-top:.15rem; color:var(--text-secondary); font-size:.7rem; }
        .analytics-main { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-top:1.25rem; }
        .analytics-section-title { margin-bottom:.7rem; font-size:.82rem; }
        .priority-row { display:grid; grid-template-columns:85px 1fr 34px; align-items:center; gap:.6rem; margin:.6rem 0; font-size:.72rem; }
        .priority-track { height:8px; overflow:hidden; border-radius:999px; background:#e2e8f0; }
        .priority-fill { height:100%; width:0; border-radius:inherit; background:var(--primary); transition:width .5s ease; }
        .insight-list { display:grid; gap:.55rem; }
        .insight { padding:.7rem .8rem; border-radius:9px; background:var(--surface-soft); border:1px solid var(--border-soft); font-size:.75rem; color:var(--text-secondary); }
        .insight strong { color:var(--text); }
        @media (max-width:800px) { .analytics-grid { grid-template-columns:repeat(2,1fr); } .analytics-main { grid-template-columns:1fr; } }
        @media (max-width:480px) { .analytics-grid { grid-template-columns:1fr 1fr; } }
    `;
    document.head.append(style);

    const card = document.createElement("section");
    card.className = "dashboard-card analytics-card";
    card.id = "analytics";
    card.setAttribute("aria-labelledby", "analytics-title");

    const priorityMax = Math.max(high, medium, low, 1);
    const insight = overdue > 0
        ? `<strong>Focus:</strong> You have ${overdue} overdue ${overdue === 1 ? "task" : "tasks"}. Clear these first.`
        : rate === 100 && total > 0
            ? `<strong>Excellent:</strong> Every task is complete. You're on top of things! 🎉`
            : dueToday > 0
                ? `<strong>Today:</strong> ${dueToday} ${dueToday === 1 ? "task is" : "tasks are"} due today.`
                : total === 0
                    ? `<strong>Get started:</strong> Add a task to begin building your productivity data.`
                    : `<strong>Momentum:</strong> ${active} active ${active === 1 ? "task" : "tasks"} remain. Keep going.`;

    card.innerHTML = `
        <div class="card-header">
            <div><p class="card-eyebrow">INSIGHTS</p><h2 id="analytics-title">Productivity Analytics</h2></div>
            <span class="status-badge">Live</span>
        </div>
        <div class="analytics-grid">
            <div class="analytics-stat"><div class="analytics-stat-label">Completion rate</div><div class="analytics-stat-value">${rate}%</div><div class="analytics-stat-detail">${completed} of ${total} completed</div></div>
            <div class="analytics-stat"><div class="analytics-stat-label">Overdue</div><div class="analytics-stat-value">${overdue}</div><div class="analytics-stat-detail">Needs attention</div></div>
            <div class="analytics-stat"><div class="analytics-stat-label">Due today</div><div class="analytics-stat-value">${dueToday}</div><div class="analytics-stat-detail">Active deadlines</div></div>
            <div class="analytics-stat"><div class="analytics-stat-label">Active</div><div class="analytics-stat-value">${active}</div><div class="analytics-stat-detail">Tasks remaining</div></div>
        </div>
        <div class="analytics-main">
            <div>
                <h3 class="analytics-section-title">Priority breakdown</h3>
                <div class="priority-row"><span>High</span><div class="priority-track"><div class="priority-fill" style="width:${Math.round(high / priorityMax * 100)}%"></div></div><strong>${high}</strong></div>
                <div class="priority-row"><span>Medium</span><div class="priority-track"><div class="priority-fill" style="width:${Math.round(medium / priorityMax * 100)}%"></div></div><strong>${medium}</strong></div>
                <div class="priority-row"><span>Low</span><div class="priority-track"><div class="priority-fill" style="width:${Math.round(low / priorityMax * 100)}%"></div></div><strong>${low}</strong></div>
            </div>
            <div>
                <h3 class="analytics-section-title">Productivity insight</h3>
                <div class="insight-list"><div class="insight">${insight}</div><div class="insight"><strong>Task volume:</strong> ${total} total ${total === 1 ? "task" : "tasks"}, with ${completed} completed.</div></div>
            </div>
        </div>
    `;

    root.append(card);
})();
