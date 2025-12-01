// BMI Calculator Functionality
document.getElementById('calculateBtn').addEventListener('click', function() {
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
        info = "Votre IMC indique une corpulence maigre. Nous vous recommandons de consulter un nutritionniste pour un programme adapté.";
        color = "#4caf50";
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
        info = "Votre IMC indique une obésité. Nous vous recommandons de consulter un professionnel de santé et de découvrir nos programmes adaptés.";
        color = "#f44336";
    }

    document.getElementById('bmiValue').textContent = bmiValue;
    document.getElementById('bmiCategory').textContent = category;
    document.getElementById('bmiCategory').style.color = color;
    document.getElementById('bmiInfo').textContent = info;
});

// Initialize with a default calculation
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calculateBtn').click();
});

// Newsletter form submission
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('.newsletter-input').value;
    if (email) {
        alert(`Merci pour votre inscription avec l'adresse : ${email}`);
        this.querySelector('.newsletter-input').value = '';
    }
});

// Button interactions
document.querySelector('.btn-hero').addEventListener('click', function() {
    alert("Bienvenue chez HealFit ! Redirection vers la page d'inscription...");
});

document.querySelector('.btn-login').addEventListener('click', function() {
    alert("Ouverture de la fenêtre de connexion...");
});

document.querySelector('.btn-signup').addEventListener('click', function() {
    alert("Ouverture de la fenêtre d'inscription...");
});

// Recipe buttons
document.querySelectorAll('.recipe-btn').forEach(button => {
    button.addEventListener('click', function() {
        const recipeTitle = this.closest('.recipe-card').querySelector('.recipe-title').textContent;
        alert(`Ouverture de la recette : ${recipeTitle}`);
    });
});
