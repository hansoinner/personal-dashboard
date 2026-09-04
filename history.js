/* =========================================================
   STAGE 10 — ACTIVITY & PRODUCTIVITY HISTORY
========================================================= */

(() => {
    "use strict";

    const HISTORY_KEY = "dashboardHistory";
    const TASKS_KEY = "dashboardTasks";
    const GOALS_KEY = "dashboardGoals";
    const MAX_DAYS = 30;

    const read = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    };

    const write = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    };

    const todayKey = () => new Date().toISOString().slice(0, 10);

    const dateLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString(
        undefined,
        { weekday: "short" }
    );

    const calculateSnapshot = () => {
        const tasks = Array.isArray(read(TASKS_KEY, [])) ? read(TASKS_KEY, []) : [];
        const goals = Array.isArray(read(GOALS_KEY, [])) ? read(GOALS_KEY, []) : [];

        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const active = total - completed;
        const now = new Date();
        const today = todayKey();

        const overdue = tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            return task.dueDate < today;
        }).length;

        const dueToday = tasks.filter(task =>
            !task.completed && task.dueDate === today
        ).length;

        const averageGoalProgress = goals.length
            ? Math.round(
                goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) /
                goals.length
            )
            : 0;

        return {
            date: today,
            total,
            completed,
            active,
            overdue,
            dueToday,
            completionRate: total ? Math.round((completed / total) * 100) : 0,
            goalProgress: averageGoalProgress,
            timestamp: now.toISOString()
        };
    };

    const getHistory = () => {
        const history = read(HISTORY_KEY, []);
        return Array.isArray(history) ? history : [];
    };

    const saveSnapshot = () => {
        const snapshot = calculateSnapshot();
        const history = getHistory();
        const existingIndex = history.findIndex(item => item.date === snapshot.date);

        if (existingIndex >= 0) {
            history[existingIndex] = snapshot;
        } else {
            history.push(snapshot);
        }

        history.sort((a, b) => a.date.localeCompare(b.date));
        write(HISTORY_KEY, history.slice(-MAX_DAYS));
        return history.slice(-MAX_DAYS);
    };

    const getLastSevenDays = (history) => {
        const result = [];
        const map = new Map(history.map(item => [item.date, item]));
        const now = new Date();

        for (let offset = 6; offset >= 0; offset -= 1) {
            const date = new Date(now);
            date.setHours(12, 0, 0, 0);
            date.setDate(date.getDate() - offset);
            const key = date.toISOString().slice(0, 10);
            result.push(map.get(key) || {
                date: key,
                total: 0,
                completed: 0,
                active: 0,
                overdue: 0,
                dueToday: 0,
                completionRate: 0,
                goalProgress: 0,
                missing: true
            });
        }

        return result;
    };

    const injectStyles = () => {
        if (document.getElementById("history-styles")) return;

        const style = document.createElement("style");
        style.id = "history-styles";
        style.textContent = `
            .history-card { grid-column: 1 / -1; }
            .history-summary {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            }
            .history-stat {
                padding: 14px;
                border: 1px solid var(--border-color, rgba(148,163,184,.18));
                border-radius: 12px;
                background: var(--surface-secondary, rgba(148,163,184,.05));
            }
            .history-stat-label {
                display: block;
                font-size: .75rem;
                opacity: .65;
                margin-bottom: 5px;
            }
            .history-stat-value { font-size: 1.25rem; font-weight: 700; }
            .history-chart {
                display: grid;
                grid-template-columns: repeat(7, minmax(0, 1fr));
                gap: 10px;
                align-items: end;
                min-height: 190px;
                padding: 18px 8px 8px;
                border-radius: 14px;
                background: var(--surface-secondary, rgba(148,163,184,.04));
            }
            .history-day {
                min-width: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 7px;
            }
            .history-bar-wrap {
                width: 100%;
                height: 130px;
                display: flex;
                align-items: end;
                justify-content: center;
            }
            .history-bar {
                width: min(34px, 70%);
                min-height: 4px;
                border-radius: 7px 7px 3px 3px;
                background: var(--accent-color, currentColor);
                opacity: .85;
                transition: height .25s ease;
            }
            .history-value { font-size: .75rem; font-weight: 700; }
            .history-label { font-size: .7rem; opacity: .6; }
            .history-empty { opacity: .55; text-align: center; padding: 20px; }
            .history-footer {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-top: 12px;
                font-size: .75rem;
                opacity: .65;
            }
            @media (max-width: 640px) {
                .history-summary { grid-template-columns: 1fr; }
                .history-chart { gap: 5px; padding-inline: 4px; }
                .history-bar { width: 55%; }
            }
        `;
        document.head.appendChild(style);
    };

    const render = () => {
        injectStyles();

        const grid = document.querySelector(".dashboard-grid");
        if (!grid) return;

        let card = document.getElementById("history");
        if (!card) {
            card = document.createElement("section");
            card.id = "history";
            card.className = "dashboard-card history-card";
            grid.appendChild(card);
        }

        const history = saveSnapshot();
        const days = getLastSevenDays(history);
        const recordedDays = days.filter(day => !day.missing);
        const bestDay = recordedDays.length
            ? recordedDays.reduce((best, day) =>
                day.completionRate > best.completionRate ? day : best
            )
            : null;
        const averageRate = recordedDays.length
            ? Math.round(
                recordedDays.reduce((sum, day) => sum + day.completionRate, 0) /
                recordedDays.length
            )
            : 0;

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <span class="card-eyebrow">STAGE 10</span>
                    <h2>Activity & Productivity History</h2>
                </div>
                <span class="badge">Last 7 days</span>
            </div>

            <div class="history-summary">
                <div class="history-stat">
                    <span class="history-stat-label">7-day average</span>
                    <span class="history-stat-value">${averageRate}%</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">Best day</span>
                    <span class="history-stat-value">${bestDay ? `${dateLabel(bestDay.date)} · ${bestDay.completionRate}%` : "—"}</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">Days recorded</span>
                    <span class="history-stat-value">${recordedDays.length}/7</span>
                </div>
            </div>

            ${recordedDays.length ? `
                <div class="history-chart" aria-label="Completion rate for the last seven days">
                    ${days.map(day => `
                        <div class="history-day">
                            <span class="history-value">${day.missing ? "—" : `${day.completionRate}%`}</span>
                            <div class="history-bar-wrap">
                                <div
                                    class="history-bar"
                                    style="height:${day.missing ? 4 : Math.max(4, day.completionRate)}%"
                                    title="${day.date}: ${day.missing ? "No data" : `${day.completionRate}% completion rate`}">
                                </div>
                            </div>
                            <span class="history-label">${dateLabel(day.date)}</span>
                        </div>
                    `).join("")}
                </div>
            ` : `<p class="history-empty">Your productivity history will appear here as you use the dashboard.</p>`}

            <div class="history-footer">
                <span>Snapshots are stored locally.</span>
                <span>Up to ${MAX_DAYS} days retained.</span>
            </div>
        `;
    };

    window.dashboardHistory = {
        refresh: render,
        getHistory,
        calculateSnapshot
    };

    render();
    window.setInterval(render, 5000);
})();
