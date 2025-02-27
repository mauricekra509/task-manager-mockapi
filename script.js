const MOCKAPI_URL = "https://67c0f56561d8935867e19037.mockapi.io/tasks";

document.addEventListener("DOMContentLoaded", loadTasks);

async function addTask() {
    let taskInput = document.getElementById("taskInput").value;
    let deadlineInput = document.getElementById("deadlineInput").value;
    let priorityInput = document.getElementById("priorityInput").value;

    if (!taskInput || !deadlineInput) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    let newTask = {
        task: taskInput,
        deadline: new Date(deadlineInput).toISOString(),
        priority: parseInt(priorityInput) // Convertir en nombre pour MockAPI
    };

    try {
        await fetch(MOCKAPI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });
        loadTasks(); // Recharger les tâches après l'ajout
    } catch (error) {
        console.error("Erreur lors de l'ajout :", error);
    }
}

// Variable pour stocker l'état précédent et éviter les rechargements inutiles
let previousTasks = [];

async function loadTasks() {
    try {
        let response = await fetch(MOCKAPI_URL);
        let tasks = await response.json();

        // Trier les tâches par priorité (1 = plus urgent)
        tasks.sort((a, b) => a.priority - b.priority);

        // Vérifier si les tâches ont changé pour éviter le clignotement
        if (JSON.stringify(previousTasks) !== JSON.stringify(tasks)) {
            previousTasks = tasks;
            renderTasks(tasks);
        }
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }

    setTimeout(loadTasks, 3000); // Rafraîchir toutes les 3 secondes
}

// Fonction pour afficher les tâches
function renderTasks(tasks) {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Efface uniquement si les tâches ont changé

    tasks.forEach(taskObj => {
        let li = document.createElement("li");
        li.className = "task-item";

        let now = new Date().getTime();
        let remainingTime = Math.max(new Date(taskObj.deadline).getTime() - now, 0);
        let totalTime = new Date(taskObj.deadline).getTime() - new Date().setHours(0, 0, 0, 0);
        let progress = totalTime > 0 ? (100 - (remainingTime / totalTime) * 100) : 100;

        let priorityColors = ["#ff0000", "#ff6600", "#ffcc00", "#99cc00", "#339900", "#006600"];
        let priorityColor = priorityColors[taskObj.priority - 1] || "#999";

        li.style.borderLeft = `8px solid ${priorityColor}`;

        li.innerHTML = `
            <div>
                <strong>${taskObj.task}</strong>
                <br>
                <small>Échéance : ${new Date(taskObj.deadline).toLocaleString()}</small>
                <div class="progress-bar"><div style="width: ${progress}%; background: ${priorityColor};"></div></div>
            </div>
            <button class="delete-btn" onclick="deleteTask('${taskObj.id}')">X</button>
        `;

        taskList.appendChild(li);
    });
}

async function deleteTask(id) {
    try {
        await fetch(`${MOCKAPI_URL}/${id}`, {
            method: "DELETE"
        });
        loadTasks();
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
    }
}
