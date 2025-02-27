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
        let response = await fetch(MOCKAPI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });
        let createdTask = await response.json();
        renderTask(createdTask); // 🔥 On ajoute seulement la nouvelle tâche
    } catch (error) {
        console.error("Erreur lors de l'ajout :", error);
    }
}

// Stocker les tâches existantes pour éviter les doublons
let taskCache = new Map();

async function loadTasks() {
    try {
        let response = await fetch(MOCKAPI_URL);
        let tasks = await response.json();

        // Trier les tâches par priorité
        tasks.sort((a, b) => a.priority - b.priority);

        tasks.forEach(taskObj => {
            if (!taskCache.has(taskObj.id)) {
                taskCache.set(taskObj.id, taskObj);
                renderTask(taskObj);
            }
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}

// 🔥 Fonction pour ajouter une tâche sans clignotement
function renderTask(taskObj) {
    let taskList = document.getElementById("taskList");

    let li = document.createElement("li");
    li.className = "task-item";
    li.setAttribute("data-id", taskObj.id); // On garde l'ID pour éviter les doublons

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
        <button class="delete-btn" onclick="deleteTask('${taskObj.id}', this)">X</button>
    `;

    taskList.appendChild(li);
}

// 🔥 Suppression instantanée sans recharger toute la liste
async function deleteTask(id, element) {
    try {
        await fetch(`${MOCKAPI_URL}/${id}`, {
            method: "DELETE"
        });
        taskCache.delete(id); // Supprime de la mémoire cache
        element.closest(".task-item").remove(); // Supprime l'élément HTML
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
    }
}
