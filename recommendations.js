/* =========================================================
   STAGE 11 — SMART TASK RECOMMENDATIONS
========================================================= */

(() => {
    "use strict";

    const TASKS_KEY = "dashboardTasks";
    const GOALS_KEY = "dashboardGoals";

    const read = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    };

    const getTasks = () => {
        const tasks = read(TASKS_KEY, []);
        return Array.isArray(tasks) ? tasks : [];
    };

    const getGoals = () => {
        const goals = read(GOALS_KEY, []);
        return Array.isArray(goals) ? goals : [];
    };

    const today = () => new Date().toISOString().slice(0, 10);

    const daysUntil = (date) => {
        if (!date) return 999;
        const target = new Date(`${date}T12:00:00`);
        const current = new Date(`${today()}T12:00:00`);
        return Math.ceil((target - current) / 86400000);
    };

    const priorityWeight = {
        high: 30,
        medium: 20,
        low: 10
    };

    const scoreTask = (task, goals) => {
        if (task.completed) return -1;

        let score = priorityWeight[task.priority] || 20;
        const dueIn = daysUntil(task.dueDate);

        if (dueIn < 0) score += 55;
        else if (dueIn === 0) score += 45;
        else if (dueIn === 1) score += 35;
        else if (dueIn <= 3) score += 20;
        else if (dueIn <= 7) score += 10;

        if (task.goalId) score += 15;

        const goal = goals.find(item => item.id === task.goalId);
        if (goal) {
            const progress = Number(goal.progress || 0);
            if (progress < 50) score += 5;
            if (goal.deadline) {
                const goalDue = daysUntil(goal.deadline);
                if (goalDue < 0) score += 15;
                else if (goalDue <= 7) score += 10;
            }
        }

        return score;
    };

    const recommendationReason = (task, goals) => {
        const dueIn = daysUntil(task.dueDate);
        const goal = goals.find(item => item.id === task.goalId);

        if (dueIn < 0) return "Overdue — handle this first.";
        if (dueIn === 0) return "Due today — high urgency.";
        if (dueIn === 1) return "Due tomorrow — worth prioritizing.";
        if (task.priority === "high") return "High priority task.";
        if (goal && Number(goal.progress || 0) < 50) return `Supports goal: ${goal.title}`;
        if (task.goalId) return "Aligned with one of your goals.";
        return "Good next task based on your current workload.";
    };

    const calculate = () => {
        const tasks = getTasks();
        const goals = getGoals();
        const active = tasks
            .filter(task => !task.completed)
            .map(task => ({ ...task, recommendationScore: scoreTask(task, goals) }))
            .sort((a, b) => b.recommendationScore - a.recommendationScore);

        return {
            recommended: active.slice(0, 3),
            totalActive: active.length,
            overdue: active.filter(task => daysUntil(task.dueDate) < 0).length,
            dueToday: active.filter(task => daysUntil(task.dueDate) === 0).length
        };
    };

    const injectStyles = () => {
        if (document.getElementById("recommendations-styles")) return;

        const style = document.createElement("style");
        style.id = "recommendations-styles";
        style.textContent = `
            .recommendations-card { grid-column: 1 / -1; }
            .recommendation-list { display: grid; gap: 10px; }
            .recommendation-item {
                display: grid;
                grid-template-columns: 36px 1fr auto;
                gap: 12px;
                align-items: center;
                padding: 14px;
                border: 1px solid var(--border-color, rgba(148,163,184,.18));
                border-radius: 12px;
                background: var(--surface-secondary, rgba(148,163,184,.04));
            }
            .recommendation-rank {
                width: 32px;
                height: 32px;
                display: grid;
                place-items: center;
                border-radius: 50%;
                font-weight: 800;
                background: var(--accent-color, currentColor);
                color: var(--background-color, #fff);
            }
            .recommendation-title { font-weight: 700; line-height: 1.35; }
            .recommendation-reason { margin-top: 4px; font-size: .78rem; opacity: .65; }
            .recommendation-meta { text-align: right; font-size: .75rem; opacity: .7; }
            .recommendation-score { font-weight: 800; font-size: .9rem; opacity: .9; }
            .recommendation-empty { padding: 22px; text-align: center; opacity: .6; }
            .recommendation-footer { margin-top: 14px; font-size: .75rem; opacity: .6; }
            @media (max-width: 640px) {
                .recommendation-item { grid-template-columns: 32px 1fr; }
                .recommendation-meta { grid-column: 2; text-align: left; }
            }
        `;
        document.head.appendChild(style);
    };

    const render = () => {
        injectStyles();

        const grid = document.querySelector(".dashboard-grid");
        if (!grid) return;

        let card = document.getElementById("recommendations");
        if (!card) {
            card = document.createElement("section");
            card.id = "recommendations";
            card.className = "dashboard-card recommendations-card";
            grid.appendChild(card);
        }

        const data = calculate();

        card.innerHTML = `
            <div class="card-header">
                <div>
                    <p class="card-eyebrow">SMART PRODUCTIVITY</p>
                    <h2>Recommended Focus</h2>
                </div>
                <span class="badge">AI-style ranking</span>
            </div>
            <div class="recommendation-list">
                ${data.recommended.length ? data.recommended.map((task, index) => `
                    <article class="recommendation-item">
                        <span class="recommendation-rank">${index + 1}</span>
                        <div>
                            <div class="recommendation-title">${escapeHtml(task.text || task.title || "Untitled task")}</div>
                            <div class="recommendation-reason">${escapeHtml(recommendationReason(task, getGoals()))}</div>
                        </div>
                        <div class="recommendation-meta">
                            <div class="recommendation-score">Score ${task.recommendationScore}</div>
                            <div>${task.priority || "medium"} priority</div>
                        </div>
                    </article>
                `).join("") : `
                    <div class="recommendation-empty">No active tasks. Add a task and I’ll help prioritize it.</div>
                `}
            </div>
            <div class="recommendation-footer">
                Ranking considers priority, deadlines, overdue status and goal alignment.
                ${data.overdue ? ` ${data.overdue} overdue task${data.overdue === 1 ? "" : "s"} detected.` : ""}
            </div>
        `;
    };

    const escapeHtml = (value) => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    window.dashboardRecommendations = {
        refresh: render,
        calculate
    };

    render();
    window.setInterval(render, 1000);
})();
