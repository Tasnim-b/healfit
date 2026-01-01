class Messagerie {
    constructor() {
        this.currentUser = window.currentUser;
        this.activeConversation = null;
        this.checkInterval = null;
        this.lastMessageDate = null;
        this.typingTimeout = null;
        this.isTyping = false;
        this.messageCount = 0;
        this.MAX_MESSAGE_LENGTH = 500;

        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.startMessageChecker();
        this.updateUnreadCount();
        this.setupTextareaAutoresize();
        this.setupCharCounter();

        // Initialiser l'état responsive
        this.setupResponsive();
    }

    bindEvents() {
        // Nouvelle conversation
        document.getElementById('newConversationBtn')?.addEventListener('click', () => this.showContacts());
        document.getElementById('startNewFromEmpty')?.addEventListener('click', () => this.showContacts());
        document.getElementById('closeContactsBtn')?.addEventListener('click', () => this.hideContacts());

        // Bouton retour aux conversations (responsive)
        document.getElementById('backToConversations')?.addEventListener('click', () => this.showConversationList());

        // Recherche
        document.getElementById('searchConversations')?.addEventListener('input', (e) =>
            this.searchConversations(e.target.value));
        document.getElementById('searchContacts')?.addEventListener('input', (e) =>
            this.searchContacts(e.target.value));

        // Formulaire d'envoi
        const sendForm = document.getElementById('sendMessageForm');
        if (sendForm) {
            sendForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Clic sur une conversation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.userId;
                this.loadConversation(userId);
            });
        });

        // Clic sur un contact
        document.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.userId;
                this.startNewConversation(userId);
            });
        });

        // Gestion du texte en cours de frappe
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', (e) => {
                this.handleTyping(e.target.value);
                this.updateCharCounter(e.target.value);
                this.autoResizeTextarea(e);
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Boutons d'action
        document.getElementById('attachFileBtn')?.addEventListener('click', () => this.attachFile());
        document.getElementById('emojiBtn')?.addEventListener('click', () => this.showEmojiPicker());
            document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'sendMessageBtn' ||
                        e.target.closest('#sendMessageBtn'))) {
            e.preventDefault();
            console.log('Bouton d\'envoi cliqué via event delegation');
            this.sendMessage();
        }
    });
    }

    setupResponsive() {
        const checkResponsive = () => {
            const isMobile = window.innerWidth <= 992;
            const content = document.querySelector('.messagerie-content');

            if (isMobile) {
                content.classList.remove('show-conversations');
            } else {
                content.classList.add('show-conversations');
            }
        };

        checkResponsive();
        window.addEventListener('resize', checkResponsive);
    }

    showConversationList() {
        const content = document.querySelector('.messagerie-content');
        content.classList.add('show-conversations');
    }

    showContacts() {
        document.getElementById('contactsSidebar').style.display = 'flex';
        document.getElementById('conversationsList').style.display = 'none';
    }

    hideContacts() {
        document.getElementById('contactsSidebar').style.display = 'none';
        document.getElementById('conversationsList').style.display = 'block';
    }

    searchConversations(query) {
        const items = document.querySelectorAll('.conversation-item');
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            items.forEach(item => item.style.display = 'flex');
            return;
        }

        items.forEach(item => {
            const name = item.querySelector('h4').textContent.toLowerCase();
            const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();

            if (name.includes(normalizedQuery) || lastMessage.includes(normalizedQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    searchContacts(query) {
        const items = document.querySelectorAll('.contact-item');
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            items.forEach(item => item.style.display = 'flex');
            return;
        }

        items.forEach(item => {
            const name = item.querySelector('h4').textContent.toLowerCase();
            const email = item.querySelector('.contact-email').textContent.toLowerCase();

            if (name.includes(normalizedQuery) || email.includes(normalizedQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }


// Dans messagerie.js
// async loadConversation(userId) {
//     try {
//         this.showLoader();
//         // Stocker l'ID utilisateur séparément
//         this.activeUserId = userId;

//         const response = await fetch(`/messagerie/chat/${userId}`);

//         if (!response.ok) {
//             throw new Error('Impossible de charger la conversation');
//         }

//         const html = await response.text();

//         // Remplacer le contenu de la conversation
//         document.querySelector('.conversation-main').innerHTML = html;

//         // Mettre à jour la conversation active
//         document.querySelectorAll('.conversation-item').forEach(item => {
//             item.classList.remove('active');
//             if (parseInt(item.dataset.userId) === userId) {
//                 item.classList.add('active');
//             }
//         });

//         // Cacher "aucune conversation sélectionnée"
//         document.getElementById('noConversationSelected').style.display = 'none';
//         document.getElementById('conversationActive').style.display = 'flex';

//         this.activeConversation = {
//             userId: userId
//         };

//         // Réattacher les événements du formulaire
//         this.bindConversationEvents();

//         // Scroller vers le bas
//         this.scrollToBottom();

//         // Focus sur le champ de texte
//         setTimeout(() => {
//             const messageInput = document.getElementById('messageInput');
//             if (messageInput) {
//                 messageInput.focus();
//             }
//         }, 200);

//     } catch (error) {
//         console.error('Erreur:', error);
//         this.showError('Impossible de charger la conversation');
//     } finally {
//         this.hideLoader();
//     }
// }
async loadConversation(userId) {
    try {
        this.showLoader();
        // Stocker l'ID utilisateur séparément
        this.activeUserId = userId;

        const response = await fetch(`/messagerie/chat/${userId}`);

        if (!response.ok) {
            throw new Error('Impossible de charger la conversation');
        }

        const html = await response.text();

        // Remplacer le contenu de la conversation
        document.querySelector('.conversation-main').innerHTML = html;

        // Mettre à jour la conversation active
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.userId) === userId) {
                item.classList.add('active');
            }
        });


        // Cacher "aucune conversation sélectionnée" SI IL EXISTE
        const noConversationElement = document.getElementById('noConversationSelected');
        if (noConversationElement) {
            noConversationElement.style.display = 'none';
        }

        // Afficher la conversation active
        const conversationActiveElement = document.getElementById('conversationActive');
        if (conversationActiveElement) {
            conversationActiveElement.style.display = 'flex';
        }

        this.activeConversation = {
            userId: userId
        };

        // Réattacher les événements du formulaire
        this.bindConversationEvents();

        // Scroller vers le bas
        this.scrollToBottom();

        // Focus sur le champ de texte
        setTimeout(() => {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.focus();
            }
        }, 200);

    } catch (error) {
        console.error('Erreur:', error);
        this.showError('Impossible de charger la conversation');
    } finally {
        this.hideLoader();
    }
}



    async markConversationAsRead(userId) {
        try {
            await fetch(`/messagerie/mark-read/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Mettre à jour le badge dans la liste
            const conversationItem = document.querySelector(`.conversation-item[data-user-id="${userId}"]`);
            if (conversationItem) {
                const badge = conversationItem.querySelector('.unread-badge');
                if (badge) badge.remove();
            }

            // Mettre à jour le compteur global
            this.updateUnreadCount();
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    }

    updateActiveConversationUI(userId, name, avatar) {
        const nameElement = document.getElementById('activeConversationName');
        const avatarElement = document.getElementById('activeConversationAvatar');

        if (nameElement) nameElement.textContent = name;
        if (avatarElement) {
            avatarElement.src = avatar;
            avatarElement.alt = name;
        }
    }

    async startNewConversation(userId) {
        // Cacher la liste des contacts
        this.hideContacts();
          // Définir activeUserId avant de charger
    this.activeUserId = userId;

        // Charger la conversation
        await this.loadConversation(userId);
    }

async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    console.log('sendMessage appelé');
    console.log('Contenu:', content);
    console.log('activeUserId:', this.activeUserId);
    console.log('activeConversation:', this.activeConversation);
    console.log('Type de activeConversation:', typeof this.activeConversation);

    if (!content || !this.activeUserId) {
                console.log('Condition bloquante: content=', content, 'activeUserId=', this.activeUserId);
        return;
    }

    try {
                console.log('Tentative d\'envoi vers /messagerie/send/' + this.activeUserId);
        const formData = new FormData();
        formData.append('content', content);
                // Ajouter le token CSRF
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            formData.append('_token', token);
        }

        // Envoyer le message à l'utilisateur actif
        const response = await fetch(`/messagerie/send/${this.activeUserId}`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('Réponse reçue, status:', response.status);

        const data = await response.json();
        console.log('Données JSON:', data);

        if (data.success) {
            // Ajouter le message à l'interface
            this.addMessageToUI(data.message, true);

            // Vider le champ
            messageInput.value = '';
            this.autoResizeTextarea({ target: messageInput });

            // Scroller vers le bas
            this.scrollToBottom();

            // Rafraîchir la liste des conversations
            this.refreshConversationsList();

            // Focus sur le champ
            messageInput.focus();
        } else {
            this.showError(data.message || 'Erreur lors de l\'envoi du message');
        }

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        this.showError('Impossible d\'envoyer le message');
    }
}

    addMessageToUI(messageData, isSent = false) {
        const template = document.getElementById('messageTemplate');
        const clone = template.content.cloneNode(true);
        const messageElement = clone.querySelector('.message');

        messageElement.dataset.messageId = messageData.id;
        messageElement.classList.add(isSent ? 'sent' : 'received');
        messageElement.classList.add('new');

        const messageText = messageElement.querySelector('.message-text');
        const messageTime = messageElement.querySelector('.message-time');
        const checkIcon = messageElement.querySelector('.check-icon');
        const doubleCheckIcon = messageElement.querySelector('.double-check-icon');

        messageText.textContent = messageData.content;
        messageTime.textContent = messageData.createdAt;

        // Gestion des icônes de lecture
        if (isSent) {
            checkIcon.style.display = 'inline-block';
            doubleCheckIcon.style.display = messageData.isRead ? 'inline-block' : 'none';
        } else {
            checkIcon.style.display = 'none';
            doubleCheckIcon.style.display = 'none';
        }

        // Ajouter le séparateur de date si nécessaire
        if (this.lastMessageDate !== messageData.date) {
            this.addDateSeparator(messageData.date);
            this.lastMessageDate = messageData.date;
        }

        // Ajouter au container
        const container = document.getElementById('messagesContainer');
        container.appendChild(messageElement);

        // Animation d'apparition
        setTimeout(() => {
            messageElement.classList.remove('new');
        }, 1000);
    }

    addDateSeparator(date) {
        const template = document.getElementById('dateSeparatorTemplate');
        const clone = template.content.cloneNode(true);
        const separator = clone.querySelector('.date-separator span');

        separator.textContent = date;

        document.getElementById('messagesContainer').appendChild(clone);
    }

    updateLastMessageInList(userId, content) {
        const conversationItem = document.querySelector(`.conversation-item[data-user-id="${userId}"]`);
        if (conversationItem) {
            const lastMessageElement = conversationItem.querySelector('.last-message');
            const timeElement = conversationItem.querySelector('.message-time');

            if (lastMessageElement) {
                lastMessageElement.textContent = content.length > 40 ? content.substring(0, 40) + '...' : content;
            }

            if (timeElement) {
                const now = new Date();
                timeElement.textContent = now.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
    }

    startMessageChecker() {
        // Arrêter l'intervalle précédent
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Démarrer un nouvel intervalle
        this.checkInterval = setInterval(() => {
            if (this.activeConversation) {
                this.checkNewMessages();
            }
            this.updateUnreadCount();
        }, 3000);
    }

    async checkNewMessages() {
        if (!this.activeUserId) return;

        try {
            const response = await fetch(`/messagerie/check-new/${this.activeUserId}`);
            const data = await response.json();

            if (data.success && data.messages.length > 0) {
                // Ajouter les nouveaux messages
                data.messages.forEach(message => {
                    const isSent = message.senderId === this.currentUser.id;
                    this.addMessageToUI(message, isSent);
                });

                // Scroller vers le bas si l'utilisateur est en bas
                this.scrollToBottomIfNeeded();

                // Mettre à jour le badge
                this.updateUnreadCount();
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des nouveaux messages:', error);
        }
    }

    async updateUnreadCount() {
        try {
            const response = await fetch('/messagerie/unread-count');
            const data = await response.json();

            // Mettre à jour le badge global
            const globalBadge = document.getElementById('globalUnreadCount');
            if (globalBadge) {
                globalBadge.textContent = data.count > 0 ? data.count : '';
                globalBadge.style.display = data.count > 0 ? 'flex' : 'none';
            }

            // Mettre à jour le badge dans la sidebar
            const sidebarBadge = document.querySelector('.messaging-icon .message-badge');
            if (sidebarBadge) {
                sidebarBadge.textContent = data.count > 0 ? data.count : '';
                sidebarBadge.style.display = data.count > 0 ? 'flex' : 'none';
            }

        } catch (error) {
            console.error('Erreur lors de la mise à jour du compteur:', error);
        }
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    scrollToBottomIfNeeded() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        // Seulement scroller si l'utilisateur est proche du bas
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom < 100) {
            this.scrollToBottom();
        }
    }

    setupTextareaAutoresize() {
        const textarea = document.getElementById('messageInput');
        if (textarea) {
            textarea.addEventListener('input', this.autoResizeTextarea);
        }
    }

    autoResizeTextarea(event) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    setupCharCounter() {
        const messageInput = document.getElementById('messageInput');
        const charCounter = document.querySelector('.char-count');

        if (messageInput && charCounter) {
            messageInput.addEventListener('input', (e) => {
                this.updateCharCounter(e.target.value);
            });
        }
    }

    updateCharCounter(text) {
        const charCounter = document.querySelector('.char-count');
        if (!charCounter) return;

        const count = text.length;
        charCounter.textContent = `${count}/${this.MAX_MESSAGE_LENGTH}`;

        charCounter.classList.remove('warning', 'error');
        if (count > this.MAX_MESSAGE_LENGTH * 0.8) {
            charCounter.classList.add('warning');
        }
        if (count > this.MAX_MESSAGE_LENGTH) {
            charCounter.classList.add('error');
        }
    }

    handleTyping(text) {
        if (!this.activeConversation) return;

        // Simuler l'indication de frappe (à adapter avec WebSocket)
        if (text.length > 0 && !this.isTyping) {
            this.isTyping = true;
            this.showTypingIndicator();
        } else if (text.length === 0 && this.isTyping) {
            this.isTyping = false;
            this.hideTypingIndicator();
        }

        // Réinitialiser le timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.typingTimeout = setTimeout(() => {
            if (this.isTyping) {
                this.isTyping = false;
                this.hideTypingIndicator();
            }
        }, 1000);
    }

    showTypingIndicator() {
        // À implémenter avec WebSocket pour l'indication de frappe
        // Pour l'instant, c'est juste un placeholder
    }

    hideTypingIndicator() {
        // À implémenter avec WebSocket
    }

    attachFile() {
        // À implémenter : logique d'attachement de fichier
        this.showError('Fonctionnalité d\'attachement en cours de développement');
    }

    showEmojiPicker() {
        // À implémenter : sélecteur d'emoji
        this.showError('Sélecteur d\'emoji en cours de développement');
    }

    showLoader() {
        const loading = document.getElementById('loadingMessages');
        if (loading) loading.style.display = 'flex';
    }

    hideLoader() {
        const loading = document.getElementById('loadingMessages');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideInFromRight 0.3s ease reverse';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideInFromRight 0.3s ease reverse';
            setTimeout(() => successDiv.remove(), 300);
        }, 2000);
    }



    // Dans la classe Messagerie

async refreshConversationsList() {
    try {
        const response = await fetch('/messagerie/get-conversations');
        const data = await response.json();

        if (data.conversations && data.conversations.length > 0) {
            this.renderConversationsList(data.conversations);
        } else {
            this.renderEmptyConversationsList();
        }

        // Mettre à jour le compteur global
        this.updateUnreadCount();

    } catch (error) {
        console.error('Erreur lors du rafraîchissement des conversations:', error);
    }
}

renderConversationsList(conversations) {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    container.innerHTML = '';

    conversations.forEach(conversation => {
        const conversationItem = this.createConversationItem(conversation);
        container.appendChild(conversationItem);

        // Ajouter l'événement click
        conversationItem.addEventListener('click', () => {
            this.loadConversation(conversation.id);
        });
    });
}

createConversationItem(conversation) {
    const div = document.createElement('div');
    div.className = 'conversation-item';
    div.dataset.userId = conversation.id;

    // Avatar
    const avatarSrc = conversation.profileImage
        ? `/uploads/profile_images/${conversation.profileImage}`
        : '/assets/images/default-avatar.jpg';

    const lastMessage = conversation.lastMessage
        ? (conversation.lastMessage.isSentByMe
            ? `Vous: ${this.truncate(conversation.lastMessage.content, 40)}`
            : this.truncate(conversation.lastMessage.content, 40))
        : 'Commencez une conversation';

    const time = conversation.lastMessage
        ? conversation.lastMessage.createdAt
        : '--';

    div.innerHTML = `
        <div class="conversation-avatar">
            <img src="${avatarSrc}" alt="${conversation.fullName}"
                 onerror="this.src='/assets/images/default-avatar.jpg'">
        </div>
        <div class="conversation-info">
            <h4>${conversation.fullName}</h4>
            <p class="last-message">${lastMessage}</p>
        </div>
        <div class="conversation-meta">
            <span class="message-time">${time}</span>
            ${conversation.unreadCount > 0
                ? `<span class="unread-badge">${conversation.unreadCount}</span>`
                : ''}
        </div>
    `;

    return div;
}

truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

renderEmptyConversationsList() {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    container.innerHTML = `
        <div class="no-conversations">
            <i class="fas fa-comment-slash"></i>
            <p>Aucune conversation</p>
        </div>
    `;
}

// Modifiez la méthode sendMessage pour rafraîchir la liste
// async sendMessage() {
//     const messageInput = document.getElementById('messageInput');
//     const content = messageInput.value.trim();
//      console.log('sendMessage appelé');
//     console.log('Contenu:', content);
//     console.log('activeUserId:', this.activeUserId);
//     console.log('activeConversation:', this.activeConversation);
//     console.log('Type de activeConversation:', typeof this.activeConversation);
//     const sendBtn = document.getElementById('sendMessageBtn');

//     if (!content || !this.activeUserId) {
//         return;
//     }

//     try {
//         sendBtn.disabled = true;

//         const formData = new FormData();
//         formData.append('content', content);

//         const response = await fetch(`/messagerie/send/${this.activeConversation}`, {
//             method: 'POST',
//             body: formData
//         });

//         const data = await response.json();

//         if (data.success) {
//             // Ajouter le message à l'interface
//             this.addMessageToUI(data.message, true);

//             // Vider le champ
//             messageInput.value = '';
//             messageInput.style.height = 'auto';

//             // Scroller vers le bas
//             this.scrollToBottom();

//             // RAFRAÎCHIR LA LISTE DES CONVERSATIONS
//             await this.refreshConversationsList();

//             // Focus sur le champ
//             messageInput.focus();
//         } else {
//             this.showError(data.message || 'Erreur lors de l\'envoi du message');
//         }

//     } catch (error) {
//         console.error('Erreur lors de l\'envoi du message:', error);
//         this.showError('Impossible d\'envoyer le message');
//     } finally {
//         sendBtn.disabled = false;
//     }
// }

async refreshConversationsList() {
    try {
        // Rafraîchir la page ou recharger les données
        // Pour simplifier, nous allons recharger la page
        // OU utiliser AJAX pour mettre à jour seulement la liste

        // Option 1: Rafraîchissement AJAX (recommandé)
        const response = await fetch('/messagerie/get-conversations-data');
        const data = await response.json();

        if (data.success) {
            this.updateConversationsList(data.conversations);
        }

        // Option 2: Simple rechargement de la liste côté serveur
        // window.location.reload(); // Décommentez si l'AJAX ne fonctionne pas

    } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
    }
}

updateConversationsList(conversations) {
    // Implémentez la logique pour mettre à jour la liste des conversations
    // avec les nouvelles données
    console.log('Conversations mises à jour:', conversations);
}
bindConversationEvents() {
    console.log('bindConversationEvents appelé');
    // Réattacher les événements du formulaire
    const sendForm = document.getElementById('sendMessageForm');
    if (sendForm) {
                console.log('Formulaire trouvé');
        // Supprimer l'ancien écouteur pour éviter les doublons
        sendForm.replaceWith(sendForm.cloneNode(true));

        // Réattacher l'événement submit
        document.getElementById('sendMessageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }

    // Réattacher les événements du textarea
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        // Supprimer les anciens écouteurs
        messageInput.replaceWith(messageInput.cloneNode(true));

        // Réattacher les événements
        const newInput = document.getElementById('messageInput');
        newInput.addEventListener('input', (e) => {
            this.handleTyping(e.target.value);
            this.updateCharCounter(e.target.value);
            this.autoResizeTextarea(e);
        });

        newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Focus automatique
        newInput.focus();
    }

    // Réattacher les boutons d'action
    const attachBtn = document.getElementById('attachFileBtn');
    if (attachBtn) {
        attachBtn.addEventListener('click', () => this.attachFile());
    }
}


}

// Initialiser la messagerie quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.messagerie = new Messagerie();
});
