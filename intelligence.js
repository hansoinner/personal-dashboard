/* =========================================================
   PERSONAL DASHBOARD — STAGE 9
   Dashboard intelligence and actionable insights
========================================================= */

(() => {
    const TASKS_KEY = "dashboardTasks";
    const GOALS_KEY = "dashboardGoals";
    const GRID = document.querySelector(".dashboard-grid");
    if (!GRID) return;

    function read(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function calculate() {
        const tasks = read(TASKS_KEY);
        const goals = read(GOALS_KEY);
        const today = new Date().toISOString().slice(0, 10);
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const active = total - completed;
        const overdue = tasks.filter(task => !task.completed && task.dueDate && task.dueDate < today).length;
        const dueToday = tasks.filter(task => !task.completed && task.dueDate === today).length;
        const linked = tasks.filter(task => task.goalId);
        const linkedCompleted = linked.filter(task => task.completed).length;
        const completionRate = total ? Math.round(completed / total * 100) : 0;
        const goalCoverage = total ? Math.round(linked.length / total * 100) : 0;
        const goalProgress = goals.length
            ? Math.round(goals.reduce((sum, goal) => sum + Math.min(100, Math.max(0, Number(goal.progress) || 0)), 0) / goals.length)
            : 0;

        let score = completionRate;
        if (overdue) score -= Math.min(25, overdue * 5);
        if (dueToday && active) score += Math.min(10, Math.round((dueToday / active) * 10));
        score = Math.max(0, Math.min(100, score));

        return { total, completed, active, overdue, dueToday, linked, linkedCompleted, completionRate, goalCoverage, goalProgress, score, goals };
    }

    function insight(data) {
        if (!data.total) return "Add a few tasks and goals to unlock personalized productivity insights.";
        if (data.overdue >= 3) return `You have ${data.overdue} overdue tasks. Clearing the oldest deadlines should be your next priority.`;
        if (data.overdue > 0) return `${data.overdue} overdue ${data.overdue === 1 ? "task needs" : "tasks need"} attention before you add more work.`;
        if (data.goals.length && data.goalProgress >= 80) return `Your goals are at ${data.goalProgress}% average progress. You're close to a strong finish.`;
        if (data.linked && data.goalCoverage < 50) return `Only ${data.goalCoverage}% of your tasks are connected to goals. Link important work to stay focused on outcomes.`;
        if (data.completionRate >= 80) return `You're completing ${data.completionRate}% of your tasks. Protect this momentum by keeping the active list small.`;
        if (data.dueToday > 0) return `${data.dueToday} task${data.dueToday === 1 ? " is" : "s are"} due today. A focused session could make a noticeable difference.`;
        return `${data.active} active ${data.active === 1 ? "task" : "tasks"} remain. Keep the next action clear and manageable.`;
    }

    function render() {
        let card = document.getElementById("intelligence-card");
        if (!card) {
            card = document.createElement("section");
            card.id = "intelligence-card";
            card.className = "dashboard-card intelligence-card";
            card.setAttribute("aria-labelledby", "intelligence-title");
            GRID.append(card);
        }

        const data = calculate();
        const scoreLabel = data.score >= 80 ? "Excellent" : data.score >= 60 ? "Good" : data.score >= 40 ? "Building" : "Needs focus";
        const goalText = data.goals.length ? `${data.goals.length} goal${data.goals.length === 1 ? "" : "s"} · ${data.goalProgress}% average progress` : "No goals yet";

        card.innerHTML = `
            <div class="card-header">
                <div><p class="card-eyebrow">SMART OVERVIEW</p><h2 id="intelligence-title">Dashboard Intelligence</h2></div>
                <span class="intelligence-score">${data.score}/100</span>
            </div>
            <div class="intelligence-grid">
                <div class="intelligence-score-panel">
                    <div class="intelligence-ring" style="--score:${data.score}%"><span>${data.score}</span></div>
                    <div><strong>${scoreLabel}</strong><p>Productivity score</p></div>
                </div>
                <div class="intelligence-stat"><span>Goal alignment</span><strong>${data.goalCoverage}%</strong><small>${data.linked.length} linked tasks</small></div>
                <div class="intelligence-stat"><span>Goal progress</span><strong>${data.goalProgress}%</strong><small>${goalText}</small></div>
                <div class="intelligence-stat"><span>Completed today</span><strong>${data.completed}</strong><small>${data.active} active remaining</small></div>
            </div>
            <div class="intelligence-insight"><span aria-hidden="true">💡</span><div><strong>Recommended focus</strong><p>${insight(data)}</p></div></div>
        `;
    }

    const style = document.createElement("style");
    style.id = "stage9IntelligenceStyles";
    style.textContent = `
        .intelligence-card{grid-column:1/-1}.intelligence-score{font-size:.75rem;font-weight:800;padding:.35rem .6rem;border-radius:999px;background:var(--surface-soft);color:var(--primary)}
        .intelligence-grid{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:.75rem}.intelligence-score-panel,.intelligence-stat{min-height:92px;padding:1rem;border:1px solid var(--border-soft);border-radius:10px;background:var(--surface-soft)}
        .intelligence-score-panel{display:flex;align-items:center;gap:1rem}.intelligence-ring{width:58px;height:58px;flex:0 0 58px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--primary) var(--score),var(--border) 0);position:relative}.intelligence-ring::after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--surface-soft)}.intelligence-ring span{position:relative;z-index:1;font-weight:800;font-size:.8rem}.intelligence-score-panel strong{font-size:.85rem}.intelligence-score-panel p,.intelligence-stat small{display:block;margin:.2rem 0 0;color:var(--text-muted);font-size:.68rem}.intelligence-stat{display:flex;flex-direction:column;justify-content:center}.intelligence-stat span{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;font-weight:700}.intelligence-stat strong{font-size:1.35rem;margin-top:.2rem}.intelligence-insight{display:flex;gap:.7rem;align-items:flex-start;margin-top:.75rem;padding:.85rem 1rem;border:1px solid var(--border-soft);border-radius:10px;background:var(--surface-soft)}.intelligence-insight>span{font-size:1.1rem}.intelligence-insight strong{font-size:.78rem}.intelligence-insight p{margin:.2rem 0 0;color:var(--text-secondary);font-size:.72rem;line-height:1.5}
        @media(max-width:900px){.intelligence-grid{grid-template-columns:1fr 1fr}.intelligence-score-panel{grid-column:1/-1}}@media(max-width:520px){.intelligence-grid{grid-template-columns:1fr}.intelligence-score-panel{grid-column:auto}}
    `;
    document.head.append(style);

    render();
    window.dashboardIntelligence = { refresh: render, calculate };
    setInterval(render, 1000);
})();
