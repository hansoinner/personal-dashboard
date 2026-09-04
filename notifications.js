/* =========================================================
   STAGE 13 — SMART NOTIFICATIONS & ALERTS
========================================================= */

(() => {
    "use strict";

    const TASKS_KEY = "dashboardTasks";
    const GOALS_KEY = "dashboardGoals";
    const HISTORY_KEY = "dashboardHistory";
    const NOTIFICATIONS_KEY = "dashboardNotifications";
    const MAX_NOTIFICATIONS = 50;

    const state = { notifications: [] };

    const escapeHtml = (value) => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const read = (key, fallback = []) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value ?? fallback;
        } catch {
            return fallback;
        }
    };

    const save = () => {
        try {
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(state.notifications.slice(0, MAX_NOTIFICATIONS)));
        } catch {
            // Keep the dashboard usable if storage is unavailable.
        }
    };

    const today = () => new Date().toISOString().slice(0, 10);

    const addDays = (dateString, days) => {
        const date = new Date(`${dateString}T12:00:00`);
        date.setDate(date.getDate() + days);
        return date.toISOString().slice(0, 10);
    };

    const daysUntil = (dateString) => {
        if (!dateString) return null;
        const target = new Date(`${dateString}T12:00:00`);
        const current = new Date(`${today()}T12:00:00`);
        return Math.round((target - current) / 86400000);
    };

    const normalizeTasks = () => read(TASKS_KEY, []).filter(Boolean).map((task) => ({
        ...task,
        completed: Boolean(task.completed),
        priority: task.priority || "medium",
        dueDate: task.dueDate || ""
    }));

    const normalizeGoals = () => read(GOALS_KEY, []).filter(Boolean).map((goal) => ({
        ...goal,
        progress: Number(goal.progress) || 0,
        deadline: goal.deadline || ""
    }));

    const addAlert = ({ id, type, severity, title, message, target = "#tasks" }) => {
        if (state.notifications.some((item) => item.id === id)) return;
        state.notifications.unshift({
            id,
            type,
            severity,
            title,
            message,
            target,
            read: false,
            createdAt: new Date().toISOString()
        });
    };

    const buildAlerts = () => {
        const tasks = normalizeTasks();
        const goals = normalizeGoals();
        const history = read(HISTORY_KEY, []).filter(Boolean);
        const currentDay = today();
        const tomorrow = addDays(currentDay, 1);

        tasks.filter((task) => !task.completed && task.dueDate && task.dueDate < currentDay)
            .slice(0, 5)
            .forEach((task) => addAlert({
                id: `overdue-task-${task.id || task.text}-${currentDay}`,
                type: "overdue",
                severity: "danger",
                title: "Overdue task",
                message: `${task.text} is overdue.`,
                target: "#tasks"
            }));

        const dueToday = tasks.filter((task) => !task.completed && task.dueDate === currentDay);
        if (dueToday.length) addAlert({
            id: `due-today-${currentDay}`,
            type: "deadline",
            severity: "warning",
            title: "Tasks due today",
            message: `${dueToday.length} active task${dueToday.length === 1 ? " is" : "s are"} due today.`,
            target: "#tasks"
        });

        const dueTomorrow = tasks.filter((task) => !task.completed && task.dueDate === tomorrow);
        if (dueTomorrow.length) addAlert({
            id: `due-tomorrow-${currentDay}`,
            type: "deadline",
            severity: "info",
            title: "Tomorrow's deadlines",
            message: `${dueTomorrow.length} active task${dueTomorrow.length === 1 ? " is" : "s are"} due tomorrow.`,
            target: "#tasks"
        });

        goals.forEach((goal) => {
            const remaining = daysUntil(goal.deadline);
            if (goal.deadline && remaining < 0 && goal.progress < 100) {
                addAlert({
                    id: `overdue-goal-${goal.id || goal.title}-${currentDay}`,
                    type: "goal",
                    severity: "danger",
                    title: "Goal deadline passed",
                    message: `${goal.title} is overdue at ${goal.progress}% progress.`,
                    target: "#goals"
                });
            } else if (goal.deadline && remaining >= 0 && remaining <= 3 && goal.progress < 100) {
                addAlert({
                    id: `goal-deadline-${goal.id || goal.title}-${goal.deadline}`,
                    type: "goal",
                    severity: "warning",
                    title: "Goal deadline approaching",
                    message: `${goal.title} is ${goal.progress}% complete and due in ${remaining} day${remaining === 1 ? "" : "s"}.`,
                    target: "#goals"
                });
            }

            [25, 50, 75, 100].forEach((milestone) => {
                if (goal.progress >= milestone) addAlert({
                    id: `goal-milestone-${goal.id || goal.title}-${milestone}`,
                    type: "milestone",
                    severity: milestone === 100 ? "success" : "info",
                    title: milestone === 100 ? "Goal completed" : "Goal milestone reached",
                    message: `${goal.title} reached ${milestone}% progress.`,
                    target: "#goals"
                });
            });
        });

        const active = tasks.filter((task) => !task.completed).length;
        if (active >= 10) addAlert({
            id: `workload-${currentDay}`,
            type: "workload",
            severity: "warning",
            title: "Heavy active workload",
            message: `You have ${active} active tasks. Consider narrowing your focus.`,
            target: "#recommendations"
        });

        if (history.length >= 2) {
            const latest = Number(history[history.length - 1].completionRate) || 0;
            const previous = Number(history[history.length - 2].completionRate) || 0;
            const change = latest - previous;
            if (change >= 15) addAlert({
                id: `trend-up-${currentDay}`,
                type: "trend",
                severity: "success",
                title: "Productivity is rising",
                message: `Your completion rate improved by ${Math.round(change)} percentage points.`,
                target: "#insights"
            });
            if (change <= -15) addAlert({
                id: `trend-down-${currentDay}`,
                type: "trend",
                severity: "warning",
                title: "Productivity dip detected",
                message: `Your completion rate dropped by ${Math.abs(Math.round(change))} percentage points.`,
                target: "#insights"
            });
        }
    };

    const markRead = (id) => {
        const item = state.notifications.find((notification) => notification.id === id);
        if (item) item.read = true;
        save();
        render();
    };

    const dismiss = (id) => {
        state.notifications = state.notifications.filter((notification) => notification.id !== id);
        save();
        render();
    };

    const markAllRead = () => {
        state.notifications.forEach((notification) => { notification.read = true; });
        save();
        render();
    };

    const render = () => {
        const card = document.getElementById("alerts");
        if (!card) return;

        const unread = state.notifications.filter((item) => !item.read).length;
        const badge = document.getElementById("notificationCount");
        if (badge) {
            badge.textContent = unread;
            badge.hidden = unread === 0;
        }

        const bell = document.querySelector('.topbar-button[aria-label="Notifications"]');
        if (bell) {
            bell.setAttribute("aria-label", unread ? `Notifications, ${unread} unread` : "Notifications");
            bell.classList.toggle("has-alerts", unread > 0);
        }

        const list = state.notifications.length
            ? state.notifications.slice(0, 12).map((item) => `
                <article class="alert-item alert-${escapeHtml(item.severity)} ${item.read ? "is-read" : "is-unread"}">
                    <div class="alert-icon" aria-hidden="true">${item.severity === "danger" ? "⚠" : item.severity === "warning" ? "!" : item.severity === "success" ? "✓" : "•"}</div>
                    <div class="alert-content">
                        <strong>${escapeHtml(item.title)}</strong>
                        <p>${escapeHtml(item.message)}</p>
                        <div class="alert-actions">
                            <button type="button" class="alert-action" data-alert-target="${escapeHtml(item.target)}">View</button>
                            ${!item.read ? `<button type="button" class="alert-action" data-mark-read="${escapeHtml(item.id)}">Mark read</button>` : ""}
                            <button type="button" class="alert-action muted" data-dismiss-alert="${escapeHtml(item.id)}">Dismiss</button>
                        </div>
                    </div>
                </article>`).join("")
            : `<div class="alerts-empty"><span aria-hidden="true">✓</span><strong>You're all caught up</strong><p>No smart alerts right now.</p></div>`;

        card.innerHTML = `
            <div class="card-header">
                <div><p class="card-eyebrow">SMART ALERTS</p><h2 id="alerts-title">Notifications</h2></div>
                <div class="alerts-header-actions">${unread ? `<span class="alert-unread-badge">${unread} unread</span>` : ""}${state.notifications.length ? `<button type="button" class="alert-clear-read">Mark all read</button>` : ""}</div>
            </div>
            <div class="alerts-list" aria-live="polite">${list}</div>`;

        card.querySelectorAll("[data-alert-target]").forEach((button) => {
            button.addEventListener("click", () => {
                const target = document.querySelector(button.dataset.alertTarget);
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });
        card.querySelectorAll("[data-mark-read]").forEach((button) => button.addEventListener("click", () => markRead(button.dataset.markRead)));
        card.querySelectorAll("[data-dismiss-alert]").forEach((button) => button.addEventListener("click", () => dismiss(button.dataset.dismissAlert)));
        card.querySelector(".alert-clear-read")?.addEventListener("click", markAllRead);
    };

    const injectStyles = () => {
        if (document.getElementById("notifications-stage13-styles")) return;
        const style = document.createElement("style");
        style.id = "notifications-stage13-styles";
        style.textContent = `
            #alerts { grid-column: 1 / -1; scroll-margin-top: 24px; }
            .alerts-header-actions { display:flex; align-items:center; gap:10px; }
            .alert-unread-badge { padding:6px 10px; border-radius:999px; font-size:.75rem; font-weight:700; background:rgba(239,68,68,.12); color:#dc2626; }
            .alert-clear-read, .alert-action { border:0; background:transparent; cursor:pointer; font:inherit; }
            .alert-clear-read { font-size:.8rem; font-weight:700; color:var(--primary-color,#2563eb); }
            .alerts-list { display:grid; gap:10px; }
            .alert-item { display:flex; gap:12px; padding:14px; border:1px solid var(--border-color,#e5e7eb); border-radius:14px; background:var(--card-bg,#fff); }
            .alert-item.is-unread { box-shadow:0 0 0 1px rgba(37,99,235,.08); }
            .alert-icon { width:34px; height:34px; flex:0 0 34px; display:grid; place-items:center; border-radius:50%; font-weight:800; background:rgba(37,99,235,.1); color:#2563eb; }
            .alert-danger .alert-icon { background:rgba(239,68,68,.12); color:#dc2626; }
            .alert-warning .alert-icon { background:rgba(245,158,11,.14); color:#d97706; }
            .alert-success .alert-icon { background:rgba(16,185,129,.12); color:#059669; }
            .alert-content { min-width:0; flex:1; }
            .alert-content strong { display:block; margin-bottom:4px; }
            .alert-content p { margin:0; color:var(--muted-text,#6b7280); line-height:1.5; }
            .alert-actions { display:flex; gap:12px; margin-top:8px; flex-wrap:wrap; }
            .alert-action { padding:0; color:var(--primary-color,#2563eb); font-size:.78rem; font-weight:700; }
            .alert-action.muted { color:var(--muted-text,#6b7280); }
            .alerts-empty { text-align:center; padding:28px 16px; color:var(--muted-text,#6b7280); }
            .alerts-empty span { display:block; font-size:2rem; margin-bottom:8px; }
            .alerts-empty strong { display:block; color:var(--text-color,#111827); margin-bottom:4px; }
            .topbar-button.has-alerts { position:relative; }
            .topbar-button.has-alerts::after { content:""; position:absolute; top:7px; right:7px; width:7px; height:7px; border-radius:50%; background:#ef4444; box-shadow:0 0 0 2px var(--surface-color,#fff); }
            @media (max-width: 640px) {
                .alerts-header-actions { gap:6px; }
                .alert-item { padding:12px; }
            }
        `;
        document.head.appendChild(style);
    };

    const mount = () => {
        if (!document.querySelector(".dashboard-grid") || document.getElementById("alerts")) return;
        injectStyles();
        const card = document.createElement("section");
        card.className = "dashboard-card";
        card.id = "alerts";
        card.setAttribute("aria-labelledby", "alerts-title");
        document.querySelector(".dashboard-grid").prepend(card);

        const bell = document.querySelector('.topbar-button[aria-label="Notifications"]');
        bell?.addEventListener("click", () => card.scrollIntoView({ behavior: "smooth", block: "start" }));
    };

    const init = () => {
        state.notifications = read(NOTIFICATIONS_KEY, []).filter((item) => item && item.id);
        mount();
        buildAlerts();
        save();
        render();
        setInterval(() => {
            buildAlerts();
            save();
            render();
        }, 3000);
    };

    window.dashboardNotifications = {
        refresh: () => { buildAlerts(); save(); render(); },
        getUnreadCount: () => state.notifications.filter((item) => !item.read).length,
        markAllRead
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
