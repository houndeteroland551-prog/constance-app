// Données globales
let studentData = {
    schedule: {},
    exams: [],
    difficulties: {},
    priorities: [],
    constraints: {
        maxHoursPerDay: 4,
        preferredTimes: ['soir']
    }
};

// Données des matières ISE
const matieresISE = [
    { id: "algebre", name: "Algèbre linéaire", credits: 5, type: "maths" },
    { id: "analyse", name: "Analyse", credits: 4.5, type: "maths" },
    { id: "topologie", name: "Topologie", credits: 4, type: "maths" },
    { id: "calcul", name: "Calcul intégral/différentiel", credits: 4.5, type: "maths" },
    { id: "stats", name: "Statistique descriptive", credits: 5, type: "stats" },
    { id: "python", name: "Python", credits: 2.5, type: "info" },
    { id: "excel", name: "Excel & VBA", credits: 1.5, type: "info" },
    { id: "proba", name: "Probabilités", credits: 3, type: "stats" },
    { id: "macro", name: "Macroéconomie", credits: 2.5, type: "eco" },
    { id: "micro", name: "Microéconomie", credits: 3.5, type: "eco" },
    { id: "series", name: "Séries temporelles", credits: 2, type: "stats" },
    { id: "acp", name: "Analyse des données (ACP)", credits: 2, type: "stats" }
];

// Conseils par type de matière
const conseilsParType = {
    maths: "Refais les TD et exercices corrigés. Fais des fiches de formules.",
    stats: "Applique les concepts sur des jeux de données réels avec R ou Python.",
    info: "Code des exemples concrets. Travaille sur des mini-projets.",
    eco: "Comprends les mécanismes théoriques puis applique sur des cas pratiques."
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initSchedule();
    initDifficulties();
});

// Initialisation de l'emploi du temps
function initSchedule() {
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const container = document.querySelector('.week-schedule');
    
    jours.forEach(jour => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${jour.charAt(0).toUpperCase() + jour.slice(1)}</div>
                <div class="rest-checkbox">
                    <input type="checkbox" id="rest-${jour}" onchange="toggleRestDay('${jour}', this.checked)">
                    <label for="rest-${jour}">Repos</label>
                </div>
            </div>
            <div class="cours-section">
                <input type="text" class="cours-input" placeholder="Cours/TD (ex: 8h-12h, 14h-16h)" 
                       onchange="updateSchedule('${jour}', this.value)">
            </div>
            <div class="free-slots" id="free-slots-${jour}">
                <!-- Créneaux libres ajoutés dynamiquement -->
            </div>
        `;
        container.appendChild(dayCard);
        
        // Initialiser les données
        studentData.schedule[jour] = {
            cours: [],
            repos: false,
            freeSlots: []
        };
    });
}

// Initialisation des difficultés
function initDifficulties() {
    const container = document.querySelector('.difficulties-container');
    const prioritiesContainer = document.querySelector('.priorities-list');
    
    matieresISE.forEach(matiere => {
        // Slider de difficulté
        const diffItem = document.createElement('div');
        diffItem.className = 'difficulty-item';
        diffItem.innerHTML = `
            <div class="matiere-name">${matiere.name}</div>
            <div class="slider-container">
                <input type="range" min="1" max="10" value="5" class="difficulty-slider" 
                       id="slider-${matiere.id}" oninput="updateDifficulty('${matiere.id}', this.value)">
            </div>
            <div class="difficulty-value" id="value-${matiere.id}">5/10</div>
            <div class="level-indicator" id="level-${matiere.id}">😐</div>
        `;
        container.appendChild(diffItem);
        
        // Priorités (checkbox)
        const priorityTag = document.createElement('div');
        priorityTag.className = 'priority-tag';
        priorityTag.innerHTML = `
            <input type="checkbox" id="priority-${matiere.id}" onchange="togglePriority('${matiere.id}', this.checked)">
            <label for="priority-${matiere.id}">${matiere.name}</label>
        `;
        prioritiesContainer.appendChild(priorityTag);
        
        // Initialiser les données
        studentData.difficulties[matiere.id] = 5;
    });
}

// Gestion des étapes
function nextStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step-${step}`).classList.add('active');
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    
    if (step === 4) {
        generatePlanning();
    }
}

function prevStep(step) {
    nextStep(step);
}

// Mise à jour de l'emploi du temps
function updateSchedule(jour, value) {
    studentData.schedule[jour].cours = value.split(',').map(s => s.trim()).filter(s => s);
}

function toggleRestDay(jour, isRest) {
    studentData.schedule[jour].repos = isRest;
}

// Ajout de créneau libre
let currentModalDay = '';
function addFreeSlot() {
    currentModalDay = 'lundi';
    document.getElementById('modal-day').value = 'lundi';
    document.getElementById('freeSlotModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('freeSlotModal').style.display = 'none';
}

function saveFreeSlot() {
    const day = document.getElementById('modal-day').value;
    const start = document.getElementById('modal-start').value;
    const end = document.getElementById('modal-end').value;
    
    if (start && end) {
        const slot = `${start}-${end}`;
        studentData.schedule[day].freeSlots.push(slot);
        
        const container = document.getElementById(`free-slots-${day}`);
        const slotTag = document.createElement('span');
        slotTag.className = 'slot-tag';
        slotTag.innerHTML = `
            ${slot}
            <span class="remove-slot" onclick="removeFreeSlot('${day}', '${slot}')">×</span>
        `;
        container.appendChild(slotTag);
        
        closeModal();
    }
}

function removeFreeSlot(day, slot) {
    studentData.schedule[day].freeSlots = studentData.schedule[day].freeSlots.filter(s => s !== slot);
    // Rafraîchir l'affichage
    const container = document.getElementById(`free-slots-${day}`);
    container.innerHTML = studentData.schedule[day].freeSlots.map(s => 
        `<span class="slot-tag">${s} <span class="remove-slot" onclick="removeFreeSlot('${day}', '${s}')">×</span></span>`
    ).join('');
}

// Gestion des examens
function addExam() {
    const container = document.querySelector('.exams-list');
    const examItem = document.createElement('div');
    examItem.className = 'exam-item';
    examItem.innerHTML = `
        <input type="text" class="exam-matiere" placeholder="Matière (ex: Algèbre)">
        <input type="date" class="exam-date">
        <select class="exam-type">
            <option value="examen">Examen</option>
            <option value="compo">Composition</option>
            <option value="projet">Projet à rendre</option>
            <option value="oral">Oral</option>
        </select>
        <select class="exam-coeff">
            <option value="1">Coeff 1</option>
            <option value="1.5">Coeff 1.5</option>
            <option value="2">Coeff 2</option>
            <option value="3">Coeff 3</option>
        </select>
        <button class="btn-remove" onclick="removeExam(this)"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(examItem);
}

function removeExam(button) {
    button.parentElement.remove();
}

// Mise à jour des difficultés
function updateDifficulty(matiereId, value) {
    studentData.difficulties[matiereId] = parseInt(value);
    
    // Mettre à jour l'affichage
    document.getElementById(`value-${matiereId}`).textContent = `${value}/10`;
    
    // Mettre à jour l'emoji
    const levelIndicator = document.getElementById(`level-${matiereId}`);
    const numValue = parseInt(value);
    
    if (numValue <= 3) levelIndicator.textContent = '😊';
    else if (numValue <= 5) levelIndicator.textContent = '😐';
    else if (numValue <= 7) levelIndicator.textContent = '😓';
    else levelIndicator.textContent = '😫';
}

// Gestion des priorités
function togglePriority(matiereId, isChecked) {
    if (isChecked) {
        studentData.priorities.push(matiereId);
    } else {
        studentData.priorities = studentData.priorities.filter(id => id !== matiereId);
    }
}

// Génération du planning
function generatePlanning() {
    // Récupérer les examens
    const exams = [];
    document.querySelectorAll('.exam-item').forEach(item => {
        const matiere = item.querySelector('.exam-matiere').value;
        const date = item.querySelector('.exam-date').value;
        const type = item.querySelector('.exam-type').value;
        const coeff = parseFloat(item.querySelector('.exam-coeff').value);
        
        if (matiere && date) {
            exams.push({ matiere, date: new Date(date), type, coeff });
        }
    });
    studentData.exams = exams;
    
    // Mettre à jour la contrainte d'heures max
    const maxHours = document.getElementById('max-hours').value;
    document.getElementById('max-hours-value').textContent = `${maxHours}h`;
    studentData.constraints.maxHoursPerDay = parseInt(maxHours);
    
    // Passer à l'étape 4
    nextStep(4);
    
    // Générer le planning
    generatePlanningDisplay();
}

function generatePlanningDisplay() {
    const planningContainer = document.querySelector('.planning-container');
    const alertsContainer = document.getElementById('alerts-container');
    
    // Effacer le contenu précédent
    planningContainer.innerHTML = '';
    alertsContainer.innerHTML = '';
    
    // Calculer les priorités
    const matieresPriorisees = calculerPriorites();
    
    // Générer les alertes
    genererAlertes(alertsContainer, matieresPriorisees);
    
    // Générer le planning jour par jour
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    
    jours.forEach(jour => {
        if (!studentData.schedule[jour].repos) {
            const dayPlanning = genererPlanningJour(jour, matieresPriorisees);
            if (dayPlanning) {
                planningContainer.appendChild(dayPlanning);
            }
        }
    });
    
    // Mettre à jour les statistiques
    updateStats();
}

function calculerPriorites() {
    const today = new Date();
    const matieres = [];
    
    // Pour chaque matière, calculer un score de priorité
    matieresISE.forEach(matiere => {
        let score = 0;
        
        // Base : difficulté (coefficient 2)
        score += studentData.difficulties[matiere.id] * 2;
        
        // Urgence : examens proches (coefficient 3)
        const examensMatiere = studentData.exams.filter(e => 
            e.matiere.toLowerCase().includes(matiere.name.toLowerCase().substring(0, 5)) ||
            matiere.name.toLowerCase().includes(e.matiere.toLowerCase().substring(0, 5))
        );
        
        examensMatiere.forEach(examen => {
            const joursRestants = Math.ceil((examen.date - today) / (1000 * 60 * 60 * 24));
            if (joursRestants > 0 && joursRestants <= 30) {
                const urgence = Math.max(1, 10 - joursRestants);
                score += urgence * 3 * examen.coeff;
            }
        });
        
        // Priorité personnelle (coefficient 2)
        if (studentData.priorities.includes(matiere.id)) {
            score += 20; // Bonus important
        }
        
        // Coefficient de la matière
        score += matiere.credits * 1.5;
        
        matieres.push({
            ...matiere,
            score: Math.round(score),
            priorityLevel: getPriorityLevel(score)
        });
    });
    
    // Trier par score décroissant
    return matieres.sort((a, b) => b.score - a.score);
}

function getPriorityLevel(score) {
    if (score >= 80) return 'max';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

function genererAlertes(container, matieresPriorisees) {
    const today = new Date();
    
    // Alerte pour les examens proches (moins de 7 jours)
    const examensProches = studentData.exams.filter(e => {
        const joursRestants = Math.ceil((e.date - today) / (1000 * 60 * 60 * 24));
        return joursRestants > 0 && joursRestants <= 7;
    });
    
    examensProches.forEach(examen => {
        const joursRestants = Math.ceil((examen.date - today) / (1000 * 60 * 60 * 24));
        const alerte = document.createElement('div');
        alerte.className = 'alert-item';
        alerte.innerHTML = `
            <i class="fas fa-exclamation-circle" style="color: #e74c3c"></i>
            <span><strong>${examen.matiere}</strong> : ${examen.type} dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}</span>
        `;
        container.appendChild(alerte);
    });
    
    // Alerte pour les matières prioritaires
    const topPriorites = matieresPriorisees.slice(0, 3);
    if (topPriorites.length > 0) {
        const alerte = document.createElement('div');
        alerte.className = 'alert-item';
        alerte.innerHTML = `
            <i class="fas fa-flag" style="color: #3498db"></i>
            <span>Priorités cette semaine : <strong>${topPriorites.map(m => m.name).join(', ')}</strong></span>
        `;
        container.appendChild(alerte);
    }
    
    // Alerte si trop de matière difficile
    const matieresDifficiles = matieresPriorisees.filter(m => studentData.difficulties[m.id] >= 7);
    if (matieresDifficiles.length >= 3) {
        const alerte = document.createElement('div');
        alerte.className = 'alert-item';
        alerte.innerHTML = `
            <i class="fas fa-brain" style="color: #f39c12"></i>
            <span>Attention : ${matieresDifficiles.length} matières difficiles cette semaine. Pense à alterner.</span>
        `;
        container.appendChild(alerte);
    }
}

function genererPlanningJour(jour, matieresPriorisees) {
    const dayData = studentData.schedule[jour];
    const freeSlots = dayData.freeSlots;
    
    if (freeSlots.length === 0) return null;
    
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-planning';
    
    // En-tête du jour
    const header = document.createElement('div');
    header.className = 'day-planning-header';
    header.innerHTML = `
        <div class="day-planning-title">${jour.charAt(0).toUpperCase() + jour.slice(1)}</div>
        <div class="day-planning-meta">
            <span><i class="far fa-clock"></i> ${freeSlots.join(', ')}</span>
            <span><i class="fas fa-book"></i> ${dayData.cours.length > 0 ? dayData.cours.join(', ') : 'Pas de cours'}</span>
        </div>
    `;
    dayDiv.appendChild(header);
    
    // Générer les créneaux de révision
    const matieresDuJour = getMatieresPourJour(jour, matieresPriorisees);
    
    matieresDuJour.forEach((matiere, index) => {
        const slot = genererSlotRevision(matiere, index);
        dayDiv.appendChild(slot);
    });
    
    // Ajouter un conseil du mentor
    const conseil = genererConseilJour(jour, matieresDuJour);
    if (conseil) {
        const conseilDiv = document.createElement('div');
        conseilDiv.className = 'mentor-advice';
        conseilDiv.innerHTML = `<i class="fas fa-comment-medical"></i> <strong>Conseil du mentor :</strong> ${conseil}`;
        dayDiv.appendChild(conseilDiv);
    }
    
    return dayDiv;
}

function getMatieresPourJour(jour, matieresPriorisees) {
    // Pour simplifier, on prend les 2-3 premières matières prioritaires
    // En réalité, il faudrait une logique plus sophistiquée
    const today = new Date();
    const dayIndex = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'].indexOf(jour);
    
    // Vérifier s'il y a un examen demain
    const examenDemain = studentData.exams.some(e => {
        const examenDay = e.date.getDay();
        return examenDay === (dayIndex + 1) % 7;
    });
    
    if (examenDemain) {
        // Si examen demain, seulement révision légère
        return matieresPriorisees.slice(0, 1).map(m => ({
            ...m,
            duree: 1,
            conseil: "Révision légère uniquement, pas de nouvelle matière"
        }));
    }
    
    // Sinon, prendre 2-3 matières selon la difficulté
    const count = studentData.schedule[jour].freeSlots.length >= 2 ? 3 : 2;
    return matieresPriorisees.slice(0, count).map((m, i) => ({
        ...m,
        duree: i === 0 ? 2 : 1.5,
        chapitre: getChapitreAleatoire(m.type),
        exercices: getExercicesRecommandes(m.type)
    }));
}

function genererSlotRevision(matiere, index) {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'revision-slot';
    
    const priorityClass = `priority-${matiere.priorityLevel}`;
    
    slotDiv.innerHTML = `
        <div class="slot-priority ${priorityClass}">
            ${matiere.priorityLevel === 'max' ? '⚠️ PRIORITÉ MAX' : 
              matiere.priorityLevel === 'high' ? '🎯 HAUTE PRIORITÉ' :
              matiere.priorityLevel === 'medium' ? '📘 PRIORITÉ MOYENNE' : '📗 RÉVISION'}
        </div>
        
        <div class="slot-content">
            <h4>${matiere.name} - ${matiere.chapitre || 'Révision générale'}</h4>
            <p><i class="far fa-clock"></i> Durée recommandée : ${matiere.duree}h</p>
            <p><i class="fas fa-tasks"></i> ${matiere.exercices || conseilsParType[matiere.type] || 'Travail sur les exercices du cours'}</p>
            <div class="slot-actions">
                <span><i class="far fa-check-circle"></i> Cocher quand terminé</span>
            </div>
        </div>
    `;
    
    return slotDiv;
}

function genererConseilJour(jour, matieres) {
    const today = new Date();
    const dayIndex = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'].indexOf(jour);
    
    // Vérifier s'il y a un examen demain
    const examenDemain = studentData.exams.some(e => {
        const examenDay = e.date.getDay();
        return examenDay === (dayIndex + 1) % 7;
    });
    
    if (examenDemain) {
        return "Examen demain ! Limite-toi à 1-2h de révision légère ce soir. Prépare tes affaires et dors tôt.";
    }
    
    // Vérifier la charge
    const totalHeures = matieres.reduce((sum, m) => sum + m.duree, 0);
    if (totalHeures > studentData.constraints.maxHoursPerDay) {
        return `Attention : ${totalHeures}h prévues aujourd'hui, alors que ta limite est ${studentData.constraints.maxHoursPerDay}h. Considère décaler une matière à demain.`;
    }
    
    if (matieres.length >= 3) {
        return "3 matières aujourd'hui ! Pense à faire des pauses de 10 minutes entre chaque session.";
    }
    
    return "Alterne bien entre théorie et pratique. Fais des pauses régulières pour maximiser ta concentration.";
}

// Fonctions utilitaires
function getChapitreAleatoire(type) {
    const chapitres = {
        maths: ["Espaces vectoriels", "Déterminants", "Diagonalisation", "Suites et séries"],
        stats: ["Distributions statistiques", "Corrélations", "Tests d'hypothèses", "Régression"],
        info: ["Structures de données", "Fonctions", "Manipulation fichiers", "Visualisation"],
        eco: ["Théorie du consommateur", "Équilibre général", "Modèles macro", "Comptabilité nationale"]
    };
    
    const liste = chapitres[type] || ["Révision générale"];
    return liste[Math.floor(Math.random() * liste.length)];
}

function getExercicesRecommandes(type) {
    const exercices = {
        maths: "Exercices 4, 7, 9 + refaire un TD corrigé",
        stats: "Analyser un jeu de données avec R, calculer indicateurs",
        info: "Coder un exemple concret, créer une fonction utilitaire",
        eco: "Résoudre des cas pratiques, appliquer formules théoriques"
    };
    
    return exercices[type] || "Refaire les exercices du cours";
}

// Mise à jour des statistiques
function updateStats() {
    // Calculer le total des heures (simplifié)
    const totalHeures = 18; // À calculer en réalité
    document.getElementById('total-hours').textContent = `${totalHeures}h`;
    
    // Matière prioritaire
    const priorites = calculerPriorites();
    if (priorites.length > 0) {
        document.getElementById('priority-matiere').textContent = priorites[0].name;
    }
    
    // Jours critiques (avec examens)
    const joursAvecExamens = studentData.exams.map(e => 
        ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][e.date.getDay()]
    );
    document.getElementById('critical-days').textContent = 
        joursAvecExamens.length > 0 ? joursAvecExamens.join(', ') : 'Aucun';
    
    // Niveau de risque (simplifié)
    const matieresDifficiles = Object.values(studentData.difficulties).filter(d => d >= 7).length;
    const risque = matieresDifficiles >= 3 ? 'ÉLEVÉ' : matieresDifficiles >= 2 ? 'MODÉRÉ' : 'FAIBLE';
    document.getElementById('risk-level').textContent = risque;
    
    // Mettre à jour l'indicateur de charge
    const chargePourcentage = Math.min(100, 20 + matieresDifficiles * 15);
    const chargeFill = document.querySelector('.charge-fill');
    const chargeLevel = document.getElementById('charge-level');
    
    if (chargeFill) {
        chargeFill.style.width = `${chargePourcentage}%`;
    }
    
    if (chargeLevel) {
        chargeLevel.textContent = `${risque} (${chargePourcentage}%)`;
        chargeLevel.className = `charge-${risque.toLowerCase()}`;
    }
}

// Export
function exportToCalendar() {
    alert('Export vers Google Calendar (fonctionnalité à implémenter)');
    // Ici, on générerait un fichier .ics
}

function exportToPDF() {
    alert('Export PDF (fonctionnalité à implémenter)');
    // Ici, on utiliserait jsPDF
}

function regeneratePlanning() {
    generatePlanningDisplay();
}

function startOver() {
    if (confirm('Recommencer un nouveau planning ?')) {
        // Réinitialiser les données
        studentData = {
            schedule: {},
            exams: [],
            difficulties: {},
            priorities: [],
            constraints: { maxHoursPerDay: 4, preferredTimes: ['soir'] }
        };
        
        // Réinitialiser l'interface
        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
        
        document.getElementById('step-1').classList.add('active');
        document.querySelector('.step[data-step="1"]').classList.add('active');
        
        // Réinitialiser les inputs
        initSchedule();
        initDifficulties();
        
        // Réinitialiser les examens
        document.querySelector('.exams-list').innerHTML = `
            <div class="exam-item">
                <input type="text" class="exam-matiere" placeholder="Matière (ex: Algèbre)" value="Algèbre">
                <input type="date" class="exam-date" value="2024-03-15">
                <select class="exam-type">
                    <option value="examen">Examen</option>
                    <option value="compo" selected>Composition</option>
                    <option value="projet">Projet à rendre</option>
                    <option value="oral">Oral</option>
                </select>
                <select class="exam-coeff">
                    <option value="1">Coeff 1</option>
                    <option value="1.5" selected>Coeff 1.5</option>
                    <option value="2">Coeff 2</option>
                    <option value="3">Coeff 3</option>
                </select>
                <button class="btn-remove" onclick="removeExam(this)"><i class="fas fa-times"></i></button>
            </div>
        `;
    }
}
