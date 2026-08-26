// Configuration Burundi
const BURUNDI_LAT = -3.3731;
const BURUNDI_LNG = 29.9189;

// Charger la météo au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadWeather();
    setupForm();
});

// Charger la météo du Burundi via Open-Meteo API (gratuit, sans clé)
async function loadWeather() {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${BURUNDI_LAT}&longitude=${BURUNDI_LNG}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Africa/Bujumbura`
        );

        if (!response.ok) throw new Error('Erreur météo');

        const data = await response.json();
        const current = data.current;

        // Mapper les codes météo
        const weatherMap = {
            0: { emoji: '☀️', desc: 'Clair' },
            1: { emoji: '🌤️', desc: 'Peu nuageux' },
            2: { emoji: '⛅', desc: 'Nuageux' },
            3: { emoji: '☁️', desc: 'Très nuageux' },
            45: { emoji: '🌫️', desc: 'Brouillard' },
            51: { emoji: '🌧️', desc: 'Pluie légère' },
            61: { emoji: '🌧️', desc: 'Pluie' },
            80: { emoji: '🌧️', desc: 'Averses' },
            95: { emoji: '⛈️', desc: 'Orage' }
        };

        const weather = weatherMap[current.weather_code] || { emoji: '🌍', desc: '?' };

        // Afficher la météo
        document.getElementById('weather').innerHTML = `
            <div class="weather-item">
                <div class="icon">${weather.emoji}</div>
                <div class="label">Condition</div>
                <div class="value">${weather.desc}</div>
            </div>
            <div class="weather-item">
                <div class="icon">🌡️</div>
                <div class="label">Température</div>
                <div class="value">${current.temperature_2m}°C</div>
            </div>
            <div class="weather-item">
                <div class="icon">💧</div>
                <div class="label">Humidité</div>
                <div class="value">${current.relative_humidity_2m}%</div>
            </div>
            <div class="weather-item">
                <div class="icon">💨</div>
                <div class="label">Vent</div>
                <div class="value">${current.wind_speed_10m} km/h</div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('weather').innerHTML = `
            <div class="weather-item">
                <div class="label">Erreur</div>
                <div class="value">Données indisponibles</div>
            </div>
        `;
    }
}

// Configurer le formulaire
function setupForm() {
    const form = document.getElementById('paymentForm');
    form.addEventListener('submit', handleSubmit);
}

// Valider le formulaire
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const service = document.getElementById('service').value;

    if (!name) {
        showMessage('Entrez votre nom', 'error');
        return false;
    }

    if (!email || !email.includes('@')) {
        showMessage('Email invalide', 'error');
        return false;
    }

    if (!phone) {
        showMessage('Entrez votre numéro WhatsApp', 'error');
        return false;
    }

    if (isNaN(amount) || amount <= 0) {
        showMessage('Montant invalide', 'error');
        return false;
    }

    if (!service) {
        showMessage('Sélectionnez un service', 'error');
        return false;
    }

    return true;
}

// Afficher les messages
function showMessage(text, type) {
    // Créer le message s'il n'existe pas
    let messageDiv = document.getElementById('message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        messageDiv.className = 'message';
        document.querySelector('.payment-section').insertBefore(messageDiv, document.getElementById('paymentForm'));
    }

    messageDiv.textContent = text;
    messageDiv.className = `message show ${type}`;

    // Masquer après 3 secondes
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

// Formater le numéro WhatsApp
function formatWhatsAppNumber(phone) {
    // Enlever tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');

    // Si le numéro commence par 0, remplacer par le code du Burundi (257)
    if (cleaned.startsWith('0')) {
        cleaned = '257' + cleaned.substring(1);
    }

    // Si le numéro ne commence pas par 257, ajouter le code
    if (!cleaned.startsWith('257')) {
        cleaned = '257' + cleaned;
    }

    return cleaned;
}

// Gérer la soumission du formulaire
function handleSubmit(e) {
    e.preventDefault();

    // Valider
    if (!validateForm()) {
        return;
    }

    // Récupérer les données
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = formatWhatsAppNumber(document.getElementById('phone').value);
    const amount = parseFloat(document.getElementById('amount').value);
    const service = document.getElementById('service').value;
    const description = document.getElementById('description').value.trim();

    // Construire le message WhatsApp
    let message = `Bonjour! 👋\n\n`;
    message += `Je souhaite effectuer un paiement:\n\n`;
    message += `👤 Nom: ${name}\n`;
    message += `📧 Email: ${email}\n`;
    message += `💵 Montant: $${amount.toFixed(2)}\n`;
    message += `📦 Service: ${service}\n`;

    if (description) {
        message += `📝 Description: ${description}\n`;
    }

    message += `\nMerci d'avoir utilisé notre service! 🙏`;

    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);

    // Rediriger vers WhatsApp
    const whatsappURL = `https://wa.me/${phone}?text=${encodedMessage}`;

    // Ouvrir dans une nouvelle fenêtre
    window.open(whatsappURL, '_blank');

    // Afficher un message de confirmation
    showMessage('✓ Redirection vers WhatsApp...', 'success');

    // Réinitialiser le formulaire après un délai
    setTimeout(() => {
        document.getElementById('paymentForm').reset();
    }, 1000);
}
