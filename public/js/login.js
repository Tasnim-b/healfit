document.addEventListener('DOMContentLoaded', function() {
    console.log('Login JS chargé');

    // ===========================
    // ELEMENTS DOM
    // ===========================
    const loginModal = document.getElementById('loginModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openRegisterBtn = document.getElementById('openRegisterBtn');
    const openHeroRegisterBtn = document.getElementById('openHeroRegisterBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalLoginForm = document.getElementById('modalLoginForm');
    const modalRegisterForm = document.getElementById('modalRegisterForm');
    const modalTabBtns = document.querySelectorAll('.modal-tab-btn');

    console.log('Éléments trouvés:', {
        loginModal,
        openLoginBtn,
        openRegisterBtn,
        closeModalBtn,
        modalLoginForm,
        modalRegisterForm
    });

    // ===========================
    // OUVERTURE DU MODAL
    // ===========================
    function openLoginModal(tab = 'login') {
        console.log('Ouverture du modal avec onglet:', tab);

        // Afficher le modal
        loginModal.style.display = 'flex';
        // Appliquer l'animation d'ouverture (assure compatibilité avec le CSS)
        loginModal.style.animation = 'slideIn 0.35s ease-out forwards';

        // Ajouter la classe au body
        document.body.classList.add('modal-open');

        // Activer l'onglet approprié
        setTimeout(() => {
            switchTab(tab);
        }, 10);

        // Empêcher le scroll
        document.body.style.overflow = 'hidden';
    }

    // ===========================
    // FERMETURE DU MODAL
    // ===========================
    function closeLoginModal() {
        console.log('Fermeture du modal');

        // Animation de fermeture
        loginModal.style.animation = 'slideOut 0.3s ease-out forwards';

        setTimeout(() => {
            loginModal.style.display = 'none';
            loginModal.style.animation = '';

            // Retirer la classe du body
            document.body.classList.remove('modal-open');

            // Réactiver le scroll
            document.body.style.overflow = '';

            // Réinitialiser les formulaires
            if (modalLoginForm) modalLoginForm.reset();
            if (modalRegisterForm) modalRegisterForm.reset();

            // Réinitialiser l'onglet à login
            switchTab('login');
        }, 300);
    }

    // ===========================
    // GESTION DES ONGLETS LOGIN / REGISTER
    // ===========================
    function switchTab(tab) {
        console.log('Changement d\'onglet:', tab);

        // Mettre à jour les boutons d'onglets
        modalTabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        // Afficher le formulaire approprié
        const forms = document.querySelectorAll('.login-modal-form, .register-modal-form');
        forms.forEach(form => {
            form.classList.remove('active');
        });

        if (tab === 'login') {
            document.querySelector('.login-modal-form').classList.add('active');
        } else {
            document.querySelector('.register-modal-form').classList.add('active');
        }
    }

    // ===========================
    // EVENTS D'OUVERTURE
    // ===========================
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur Se connecter');
            openLoginModal('login');
        });
    }
    else {
        // fallback: lier le premier élément avec la classe .btn-login
        const fallbackLogin = document.querySelector('.btn-login');
        if (fallbackLogin) {
            console.log('Fallback: binding .btn-login click');
            fallbackLogin.addEventListener('click', function(e) {
                e.preventDefault();
                openLoginModal('login');
            });
        }
    }

    if (openRegisterBtn) {
        openRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur S\'inscrire');
            openLoginModal('register');
        });
    }
    else {
        // fallback: lier le premier élément avec la classe .btn-signup
        const fallbackRegister = document.querySelector('.btn-signup');
        if (fallbackRegister) {
            console.log('Fallback: binding .btn-signup click');
            fallbackRegister.addEventListener('click', function(e) {
                e.preventDefault();
                openLoginModal('register');
            });
        }
    }

    if (openHeroRegisterBtn) {
        openHeroRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur Commencer mon parcours');
            openLoginModal('register');
        });
    }

    // ===========================
    // EVENT DE FERMETURE
    // ===========================
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeLoginModal();
        });
    }

    // Fermer en cliquant sur l'overlay
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }

    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal.style.display === 'flex') {
            closeLoginModal();
        }
    });

    // ===========================
    // BOUTONS ONGLET
    // ===========================
    modalTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // ===========================
    // GESTION DES FORMULAIRES
    // ===========================
    initForms();
    initPasswordToggles();
});

// =========================================
// TOGGLES DE MOT DE PASSE
// =========================================
function initPasswordToggles() {
    console.log('Initialisation des toggles de mot de passe');

    const toggle = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);

        if (!btn || !input) {
            console.log(`Élément non trouvé: ${btnId} ou ${inputId}`);
            return;
        }

        btn.addEventListener('click', function() {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    };

    toggle('toggleModalLoginPassword', 'modalLoginPassword');
    toggle('toggleModalRegisterPassword', 'modalRegisterPassword');
    toggle('toggleModalConfirmPassword', 'modalConfirmPassword');
}

// =========================================
// GESTION DES FORMULAIRES
// =========================================
function initForms() {
    console.log('Initialisation des formulaires');

    const loginForm = document.getElementById('modalLoginForm');
    const registerForm = document.getElementById('modalRegisterForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Soumission formulaire login');

            const email = document.getElementById('modalLoginEmail').value;
            const password = document.getElementById('modalLoginPassword').value;

            if (!validateEmail(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
                return;
            }

            // Simuler la connexion
            showNotification('Connexion en cours...', 'info');

            setTimeout(() => {
                showNotification('Connexion réussie ! Redirection...');
                setTimeout(() => {
                    // Fermer le modal
                    document.getElementById('loginModal').style.display = 'none';
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';

                    // Rediriger
                    window.location.href = '/';
                }, 1500);
            }, 1000);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Soumission formulaire register');

            const name = document.getElementById('modalRegisterName').value;
            const email = document.getElementById('modalRegisterEmail').value;
            const password = document.getElementById('modalRegisterPassword').value;
            const confirm = document.getElementById('modalConfirmPassword').value;

            if (!name.trim()) {
                showNotification('Veuillez entrer votre nom complet', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }

            if (password.length < 8) {
                showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
                return;
            }

            if (password !== confirm) {
                showNotification('Les mots de passe ne correspondent pas', 'error');
                return;
            }

            // Simuler l'inscription
            showNotification('Création de votre compte...', 'info');

            setTimeout(() => {
                showNotification('Compte créé avec succès !');
                setTimeout(() => {
                    // Fermer le modal
                    document.getElementById('loginModal').style.display = 'none';
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';

                    // Rediriger
                    window.location.href = '/';
                }, 1500);
            }, 1000);
        });
    }
}

// =========================================
// VALIDATION EMAIL
// =========================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// =========================================
// NOTIFICATION
// =========================================
function showNotification(message, type = 'success') {
    // Créer une notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'info' ? '#2196f3' : '#4caf50'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
        font-family: 'Segoe UI', sans-serif;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);

    // Ajouter les animations CSS si elles n'existent pas
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }
}




// Gestion de l'upload d'image
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('modalProfileImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = imagePreview.querySelector('.preview-image');
    const previewPlaceholder = imagePreview.querySelector('.preview-placeholder');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const fileInfo = document.getElementById('fileInfo');

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Vérification de la taille (5MB max)
                const maxSize = 5 * 1024 * 1024; // 5MB en bytes
                if (file.size > maxSize) {
                    alert('L\'image ne doit pas dépasser 5MB');
                    this.value = '';
                    return;
                }

                // Vérification du type de fichier
                if (!file.type.match('image.*')) {
                    alert('Veuillez sélectionner une image valide');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.classList.add('loaded');
                    previewPlaceholder.style.display = 'none';
                    removeImageBtn.style.display = 'inline-flex';

                    // Afficher les infos du fichier
                    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                    fileInfo.textContent = `${file.name} (${sizeInMB} MB)`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Bouton de suppression d'image
        removeImageBtn.addEventListener('click', function() {
            imageInput.value = '';
            previewImage.src = '';
            previewImage.classList.remove('loaded');
            previewPlaceholder.style.display = 'flex';
            this.style.display = 'none';
            fileInfo.textContent = '';
        });

        // Drag and drop (optionnel)
        imagePreview.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary)';
            this.style.backgroundColor = 'rgba(46, 125, 50, 0.1)';
        });

        imagePreview.addEventListener('dragleave', function() {
            this.style.borderColor = 'var(--light-gray)';
            this.style.backgroundColor = '';
        });

        imagePreview.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--light-gray)';
            this.style.backgroundColor = '';

            const file = e.dataTransfer.files[0];
            if (file && file.type.match('image.*')) {
                imageInput.files = e.dataTransfer.files;
                imageInput.dispatchEvent(new Event('change'));
            }
        });
    }
});
