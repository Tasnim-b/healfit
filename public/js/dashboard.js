// Dashboard JavaScript pour l'interactivité

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des graphiques avec Chart.js
    initCharts();

    // Gestion du chatbot
    initChatbot();

    // Gestion de la sidebar sur mobile
    initSidebarToggle();

    // Gestion du menu utilisateur
    initUserMenu();

    // Simulation des interactions
    initInteractiveElements();
});

function initCharts() {
    // Graphique de progression
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(progressCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
                label: 'Calories brûlées',
                data: [1200, 1900, 1500, 2100, 1800, 2300, 1950],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Distance (km)',
                data: [3, 5, 4, 6, 5, 7, 6],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });

    // Graphique des calories
    const caloriesCtx = document.getElementById('caloriesChart').getContext('2d');
    const caloriesChart = new Chart(caloriesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Protéines', 'Glucides', 'Lipides'],
            datasets: [{
                data: [35, 45, 20],
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FF9800'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function initChatbot() {
    const chatbotToggle = document.getElementById('openChatbot');
    const chatbotWidget = document.getElementById('chatbotWidget');
    const closeChatbot = document.getElementById('closeChatbot');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Ouvrir/fermer le chatbot
    chatbotToggle.addEventListener('click', function() {
        chatbotWidget.classList.add('active');
    });

    closeChatbot.addEventListener('click', function() {
        chatbotWidget.classList.remove('active');
    });

    // Envoyer un message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message === '') return;

        // Ajouter le message de l'utilisateur
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Réponse automatique du bot (simulation)
        setTimeout(function() {
            let response = getBotResponse(message);
            addMessage(response, 'bot');
        }, 1000);
    }

    sendMessageBtn.addEventListener('click', sendMessage);

    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);

        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
            return "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
        } else if (lowerMessage.includes('régime') || lowerMessage.includes('alimentation')) {
            return "Je peux vous recommander un régime personnalisé basé sur vos objectifs. Voulez-vous que je vous guide ?";
        } else if (lowerMessage.includes('entraînement') || lowerMessage.includes('workout')) {
            return "J'ai plusieurs programmes d'entraînement adaptés à votre niveau. Quel est votre objectif principal ?";
        } else if (lowerMessage.includes('salle') || lowerMessage.includes('gym')) {
            return "Je peux vous trouver la salle de sport la plus proche. Où vous trouvez-vous actuellement ?";
        } else if (lowerMessage.includes('nutritionniste')) {
            return "Nous pouvons vous mettre en contact avec un nutritionniste expert. Souhaitez-vous prendre rendez-vous ?";
        } else if (lowerMessage.includes('merci')) {
            return "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.";
        } else {
            return "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler votre question ? Je peux vous aider avec les régimes, entraînements, salles de sport et nutritionnistes.";
        }
    }

    function getCurrentTime() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
}

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.dashboard-sidebar');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');

        // Changer l'icône
        const icon = sidebarToggle.querySelector('i');
        if (sidebar.classList.contains('active')) {
            icon.style.transform = 'rotate(0deg)';
        } else {
            icon.style.transform = 'rotate(180deg)';
        }
    });
}

function initUserMenu() {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userMenu = document.getElementById('userMenu');

    userMenuTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        userMenu.style.opacity = userMenu.style.opacity === '1' ? '0' : '1';
        userMenu.style.visibility = userMenu.style.visibility === 'visible' ? 'hidden' : 'visible';
        userMenu.style.transform = userMenu.style.transform === 'translateY(0px)' ? 'translateY(-10px)' : 'translateY(0px)';
    });

    // Fermer le menu en cliquant ailleurs
    document.addEventListener('click', function() {
        userMenu.style.opacity = '0';
        userMenu.style.visibility = 'hidden';
        userMenu.style.transform = 'translateY(-10px)';
    });

    // Empêcher la fermeture en cliquant dans le menu
    userMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function initInteractiveElements() {
    // Simulation des boutons "Commencer" et "Terminer"
    const startButtons = document.querySelectorAll('.btn-start');
    const completeButtons = document.querySelectorAll('.meal-check, .workout-status');

    startButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('Démarrage de l\'entraînement ! Bonne séance 💪');
        });
    });

    completeButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('fa-circle') || this.classList.contains('far')) {
                this.innerHTML = '<i class="fas fa-check-circle"></i>';
                this.classList.remove('far', 'fa-circle');
                this.classList.add('fas', 'fa-check-circle');
                this.style.color = '#2e7d32';
            }
        });
    });

    // Simulation des boutons "Suivre"
    const followButtons = document.querySelectorAll('.btn-follow');

    followButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-check"></i> Suivi';
            this.classList.remove('btn-follow');
            this.classList.add('btn-following');
        });
    });

    // Simulation du rafraîchissement des salles de sport
    const refreshButton = document.querySelector('.btn-refresh');

    refreshButton.addEventListener('click', function() {
        const icon = this.querySelector('i');
        icon.style.transform = 'rotate(360deg)';

        setTimeout(() => {
            icon.style.transform = 'rotate(0deg)';
            alert('Liste des salles de sport actualisée !');
        }, 500);
    });
}
