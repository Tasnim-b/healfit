// // BMI Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
    // BMI Calculator Functionality
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            const height = parseFloat(document.getElementById('height').value) / 100; // Convert cm to m
            const weight = parseFloat(document.getElementById('weight').value);

            if (!height || !weight || height <= 0 || weight <= 0) {
                alert("Veuillez entrer des valeurs valides pour la taille et le poids.");
                return;
            }

            const bmi = weight / (height * height);
            const bmiValue = bmi.toFixed(1);

            let category = "";
            let info = "";
            let color = "";

            if (bmi < 18.5) {
                category = "Maigreur";
                info = "Votre IMC indique une corpulence maigre. Consultez un nutritionniste pour un programme adapté.";
                color = "#2E7D32";
            } else if (bmi >= 18.5 && bmi < 25) {
                category = "Normal";
                info = "Votre IMC est dans la norme. Continuez à maintenir une alimentation équilibrée et une activité physique régulière.";
                color = "#8bc34a";
            } else if (bmi >= 25 && bmi < 30) {
                category = "Surpoids";
                info = "Votre IMC indique un surpoids. Nos programmes de perte de poids peuvent vous aider à atteindre un poids santé.";
                color = "#ff9800";
            } else {
                category = "Obésité";
                info = "Votre IMC indique une obésité. Consultez un professionnel de santé et découvrez nos programmes adaptés.";
                color = "#f44336";
            }

            document.getElementById('bmiValue').textContent = bmiValue;
            document.getElementById('bmiCategory').textContent = category;
            document.getElementById('bmiCategory').style.color = color;
            document.getElementById('bmiInfo').textContent = info;
        });
    }
});

//Réinitialisation du formulaire et du résultat au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Réinitialiser les champs du formulaire IMC
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');

    if (heightInput && weightInput && ageInput && genderSelect) {
        heightInput.value = ''; // ou 175 si tu veux une valeur par défaut
        weightInput.value = ''; // ou 70
        ageInput.value = ''; // ou 30
        genderSelect.selectedIndex = 0; // première option
    }

    // Réinitialiser le résultat
    document.getElementById('bmiValue').textContent = '--';
    document.getElementById('bmiCategory').textContent = '--';
    document.getElementById('bmiCategory').style.color = '#000';
    document.getElementById('bmiInfo').textContent = 'Entrez vos données pour obtenir votre IMC et des conseils personnalisés.';
});


// Newsletter form submission
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            if (email) {
                alert(`Super ! Vous êtes maintenant inscrit(e) à notre newsletter avec l'adresse : ${email}. Merci de rejoindre la communauté HealFit !`);
                this.querySelector('.newsletter-input').value = '';
            }
        });
    }
});


// // Button interactions
// // document.querySelector('.btn-hero').addEventListener('click', function() {
// //     alert("Bienvenue chez HealFit ! Redirection vers la page d'inscription...");
// // });



// // Recipe buttons
// document.querySelectorAll('.recipe-btn').forEach(button => {
//     button.addEventListener('click', function() {
//         const recipeTitle = this.closest('.recipe-card').querySelector('.recipe-title').textContent;
//         alert(`Ouverture de la recette : ${recipeTitle}`);
//     });
// });
