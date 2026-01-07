// assets/js/notifications.js
class NotificationsPage {
    constructor() {
        this.currentUser = window.currentUser;
        this.notifications = [];
        this.filteredNotifications = [];
        this.currentFilter = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 10;

        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.loadNotifications();
        this.startNotificationChecker();
    }

    bindEvents() {
        // Boutons de filtre
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Bouton marquer tout comme lu
        document.getElementById('btnMarkAllRead')?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Bouton rafraîchir
        document.getElementById('btnRefresh')?.addEventListener('click', () => {
            this.loadNotifications();
        });

        // Boutons marquer comme lu
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-mark-read')) {
                const btn = e.target.closest('.btn-mark-read');
                const notificationId = btn.dataset.id;
                this.markAsRead(notificationId);
            }
        });

        // Recherche
        const searchInput = document.getElementById('searchNotifications');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchNotifications(e.target.value);
            });
        }

        // Pagination
        document.getElementById('btnPrev')?.addEventListener('click', () => {
            this.prevPage();
        });

        document.getElementById('btnNext')?.addEventListener('click', () => {
            this.nextPage();
        });
    }

    async loadNotifications() {
        try {
            this.showLoading();

            const response = await fetch('/api/notifications/all');
            const data = await response.json();

            if (data.success) {
                this.notifications = data.notifications;
                this.applyFilter();
                this.renderNotifications();
                this.updateBadges();
            } else {
                this.showError('Impossible de charger les notifications');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de charger les notifications');
        } finally {
            this.hideLoading();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Mettre à jour les boutons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.applyFilter();
        this.renderNotifications();
    }

    applyFilter() {
        switch (this.currentFilter) {
            case 'unread':
                this.filteredNotifications = this.notifications.filter(n => !n.isRead);
                break;
            case 'message':
                this.filteredNotifications = this.notifications.filter(n => n.type === 'message');
                break;
            case 'water_reminder':
                this.filteredNotifications = this.notifications.filter(n => n.type === 'water_reminder');
                break;
            default:
                this.filteredNotifications = [...this.notifications];
        }
    }

    searchNotifications(query) {
        if (!query.trim()) {
            this.applyFilter();
        } else {
            const normalizedQuery = query.toLowerCase().trim();
            this.filteredNotifications = this.notifications.filter(notification => {
                return notification.title.toLowerCase().includes(normalizedQuery) ||
                       notification.message.toLowerCase().includes(normalizedQuery);
            });
        }

        this.currentPage = 1;
        this.renderNotifications();
    }

    renderNotifications() {
        const container = document.getElementById('notificationsTimeline');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedNotifications = this.filteredNotifications.slice(startIndex, endIndex);

        if (paginatedNotifications.length === 0) {
            container.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <h3>Aucune notification</h3>
                    <p>${this.currentFilter !== 'all' ? 'Aucune notification avec ce filtre' : 'Vous n\'avez aucune notification'}</p>
                </div>
            `;
            return;
        }

        const template = document.getElementById('notificationCardTemplate');
        container.innerHTML = '';

        paginatedNotifications.forEach(notification => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.notification-card');

            card.dataset.id = notification.id;
            card.dataset.type = notification.type;

            if (!notification.isRead) {
                card.classList.add('unread');
            }

            // Icône
            const icon = card.querySelector('.notification-icon i');
            switch (notification.type) {
                case 'message':
                    icon.className = 'fas fa-comment';
                    break;
                case 'water_reminder':
                    icon.className = 'fas fa-tint';
                    break;
                default:
                    icon.className = 'fas fa-bell';
            }

            // Titre
            card.querySelector('.notification-title').textContent = notification.title;

            // Message
            card.querySelector('.notification-message').textContent = notification.message;

            // Temps
            card.querySelector('.notification-time').textContent = notification.createdAt;

            // Bouton marquer comme lu
            const markReadBtn = card.querySelector('.btn-mark-read');
            markReadBtn.dataset.id = notification.id;

            // Action
            const actionBtn = card.querySelector('.btn-notification-action');
            if (notification.route) {
                actionBtn.href = this.generateRoute(notification.route, notification.routeParams);
            }

            container.appendChild(card);
        });

        this.updatePagination();
    }

    generateRoute(route, params) {
        if (route === 'app_messagerie_chat' && params.userId) {
            return `/messagerie/chat/${params.userId}`;
        }
        return '/dashboard';
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        const prevBtn = document.getElementById('btnPrev');
        const nextBtn = document.getElementById('btnNext');
        const pageInfo = document.querySelector('.pagination-info');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        }

        if (pageInfo) {
            pageInfo.textContent = `Page ${this.currentPage} sur ${totalPages || 1}`;
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderNotifications();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderNotifications();
        }
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/mark-read/${notificationId}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                // Mettre à jour l'interface
                const card = document.querySelector(`.notification-card[data-id="${notificationId}"]`);
                if (card) {
                    card.classList.remove('unread');
                    card.querySelector('.unread-dot')?.remove();
                }

                // Mettre à jour la liste
                const notification = this.notifications.find(n => n.id == notificationId);
                if (notification) {
                    notification.isRead = true;
                }

                this.updateBadges();
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de marquer comme lu');
        }
    }

    async markAllAsRead() {
        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                // Mettre à jour toutes les notifications
                this.notifications.forEach(n => n.isRead = true);
                this.filteredNotifications.forEach(n => n.isRead = true);

                // Mettre à jour l'interface
                document.querySelectorAll('.notification-card').forEach(card => {
                    card.classList.remove('unread');
                    card.querySelector('.unread-dot')?.remove();
                });

                this.updateBadges();
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de tout marquer comme lu');
        }
    }

    async updateBadges() {
        try {
            const response = await fetch('/api/notifications/count');
            const data = await response.json();

            if (data.success) {
                this.updateNotificationBadge(data.count);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    updateNotificationBadge(count) {
        // Badge dans la navbar
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            if (count > 0) {
                notificationBadge.textContent = count;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }

        // Badge dans le menu
        const menuBadge = document.getElementById('menuNotificationBadge');
        if (menuBadge) {
            if (count > 0) {
                menuBadge.textContent = count;
                menuBadge.style.display = 'flex';
            } else {
                menuBadge.style.display = 'none';
            }
        }
    }

    startNotificationChecker() {
        // Vérifier les nouvelles notifications toutes les 30 secondes
        setInterval(() => {
            this.updateBadges();
        }, 30000);
    }

    showLoading() {
        const container = document.getElementById('notificationsTimeline');
        if (container) {
            container.innerHTML = `
                <div class="loading-notifications">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Chargement des notifications...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // La méthode renderNotifications s'occupe de l'affichage
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
            errorDiv.remove();
        }, 3000);
    }
}

// Initialiser la page des notifications
document.addEventListener('DOMContentLoaded', () => {
    window.notificationsPage = new NotificationsPage();
});
