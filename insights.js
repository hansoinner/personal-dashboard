/* =========================================================
   STAGE 12 — PRODUCTIVITY INSIGHTS & TRENDS
========================================================= */

(() => {
    "use strict";

    const TASKS_KEY = "dashboardTasks";
    const GOALS_KEY = "dashboardGoals";
    const HISTORY_KEY = "dashboardHistory";

    const read = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    };

    const tasks = () => {
        const value = read(TASKS_KEY, []);
        return Array.isArray(value) ? value : [];
    };

    const goals = () => {
        const value = read(GOALS_KEY, []);
        return Array.isArray(value) ? value : [];
    };

    const history = () => {
        const value = read(HISTORY_KEY, []);
        return Array.isArray(value) ? value : [];
    };

    const daysUntil = (date) => {
        if (!date) return 999;
        const start = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`);
        const end = new Date(`${date}T12:00:00`);
        return Math.ceil((end - start) / 86400000);
    };

    const calculate = () => {
        const currentTasks = tasks();
        const currentGoals = goals();
        const records = history().slice(-7);

        const total = currentTasks.length;
        const completed = currentTasks.filter(task => task.completed).length;
        const active = total - completed;
        const overdue = currentTasks.filter(task =>
            !task.completed && task.dueDate && daysUntil(task.dueDate) < 0
        ).length;
        const linked = currentTasks.filter(task => task.goalId).length;
        const goalProgress = currentGoals.length
            ? Math.round(currentGoals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0) / currentGoals.length)
            : 0;

        const rates = records.map(record => Number(record.completionRate || 0));
        const average = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
        const latest = rates.length ? rates[rates.length - 1] : 0;
        const previous = rates.length > 1 ? rates[rates.length - 2] : latest;
        const trend = latest - previous;

        return {
            total,
            completed,
            active,
            overdue,
            linked,
            goalProgress,
            average,
            trend,
            records
        };
    };

    const insight = (data) => {
        if (!data.total) return { title: "Start small", text: "Add your first task and your dashboard will begin learning your productivity patterns." };
        if (data.overdue >= 3) return { title: "Clear the backlog", text: `You have ${data.overdue} overdue tasks. Finishing one before starting something new could improve your momentum.` };
        if (data.trend >= 10) return { title: "Momentum is up", text: `Your completion rate is up ${data.trend} points from the previous snapshot. Keep the current pace.` };
        if (data.goalProgress < 40 && data.total >= 3) return { title: "Reconnect with your goals", text: "Your goals are progressing slowly. Prioritize tasks linked to your objectives." };
        if (data.average >= 80) return { title: "Strong consistency", text: `Your recent average completion rate is ${data.average}%. Protect the routine that is working.` };
        if (data.active > data.completed * 2) return { title: "Workload is growing", text: "You have significantly more active than completed tasks. Consider reducing your active queue." };
        return { title: "Steady progress", text: "Your dashboard shows a balanced workload. Focus on the highest-priority task next." };
    };

    const injectStyles = () => {
        if (document.getElementById("insights-styles")) return;
        const style = document.createElement("style");
        style.id = "insights-styles";
        style.textContent = `
            .insights-card { grid-column: 1 / -1; }
            .insights-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
            .insight-panel { padding:16px; border:1px solid var(--border-color,rgba(148,163,184,.18)); border-radius:12px; background:var(--surface-secondary,rgba(148,163,184,.04)); }
            .insight-label { display:block; font-size:.72rem; opacity:.6; margin-bottom:6px; text-transform:uppercase; letter-spacing:.05em; }
            .insight-value { font-size:1.45rem; font-weight:800; }
            .insight-value small { font-size:.75rem; font-weight:600; opacity:.65; }
            .insight-main { margin-top:14px; padding:16px; border-radius:12px; border:1px solid var(--border-color,rgba(148,163,184,.18)); }
            .insight-main strong { display:block; margin-bottom:5px; }
            .insight-main p { margin:0; opacity:.7; line-height:1.5; }
            .insight-trend-up { font-size:.78rem; font-weight:700; }
            .insight-trend-down { font-size:.78rem; font-weight:700; }
            .insight-footer { margin-top:12px; font-size:.73rem; opacity:.55; }
            @media (max-width:640px) { .insights-grid { grid-template-columns:1fr; } }
        `;
        document.head.appendChild(style);
    };

    const render = () => {
        injectStyles();
        const grid = document.querySelector(".dashboard-grid");
        if (!grid) return;

        let card = document.getElementById("insights");
        if (!card) {
            card = document.createElement("section");
            card.id = "insights";
            card.className = "dashboard-card insights-card";
            grid.appendChild(card);
        }

        const data = calculate();
        const message = insight(data);
        const trend = data.trend > 0
            ? `<span class="insight-trend-up">↑ ${data.trend} pts</span>`
            : data.trend < 0
                ? `<span class="insight-trend-down">↓ ${Math.abs(data.trend)} pts</span>`
                : `<span>— stable</span>`;

        card.innerHTML = `
            <div class="card-header">
                <div><p class="card-eyebrow">STAGE 12</p><h2>Productivity Insights</h2></div>
                <span class="badge">Live analysis</span>
            </div>
            <div class="insights-grid">
                <div class="insight-panel"><span class="insight-label">Current completion</span><span class="insight-value">${data.total ? Math.round((data.completed / data.total) * 100) : 0}%</span></div>
                <div class="insight-panel"><span class="insight-label">7-day average</span><span class="insight-value">${data.average}%</span></div>
                <div class="insight-panel"><span class="insight-label">Trend</span><span class="insight-value">${trend}</span></div>
            </div>
            <div class="insight-main"><strong>💡 ${message.title}</strong><p>${message.text}</p></div>
            <div class="insight-footer">Based on tasks, deadlines, goal progress and your saved productivity history.</div>
        `;
    };

    window.dashboardInsights = { refresh: render, calculate };
    render();
    window.setInterval(render, 2000);
})();
