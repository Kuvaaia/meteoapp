const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherResult = document.getElementById("weather-result");

searchBtn.addEventListener("click", function () {
    const city = cityInput.value.trim();

    if (city === "") {
        weatherResult.innerHTML = "<p>Merci d'entrer une ville.</p>";
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

async function getWeather(city) {
    try {
        weatherResult.innerHTML = "<p>⏳ Chargement...</p>";

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML = "<p>Ville introuvable.</p>";
            return;
        }

        const place = geoData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;
        const cityName = place.name;
        const country = place.country;

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        const temperature = Math.round(weatherData.current.temperature_2m);
        const weatherCode = weatherData.current.weather_code;
        const wind = weatherData.current.wind_speed_10m;
        const humidity = weatherData.current.relative_humidity_2m;
        const description = getWeatherDescription(weatherCode);
        const icon = getWeatherIcon(weatherCode);

        updateWeatherTheme(weatherCode);

        weatherResult.innerHTML = `
            <div class="weather-card">
                <h2>${cityName}, ${country}</h2>

                <div class="weather-main">
                    <p style="font-size: 40px;">${icon}</p>
                    <p class="temperature">${temperature}°C</p>
                    <p class="description">${description}</p>
                    <p>💨 Vent : ${wind} km/h</p>
                    <p>💧 Humidité : ${humidity}%</p>
                </div>
            </div>
        `;
    } catch (error) {
        weatherResult.innerHTML = "<p>Une erreur est survenue.</p>";
    }
}

function getWeatherDescription(code) {
    if (code === 0) return "Ciel dégagé";
    if ([1, 2, 3].includes(code)) return "Partiellement nuageux";
    if ([45, 48].includes(code)) return "Brouillard";
    if ([51, 53, 55, 56, 57].includes(code)) return "Bruine";
    if ([61, 63, 65, 66, 67].includes(code)) return "Pluie";
    if ([71, 73, 75, 77].includes(code)) return "Neige";
    if ([80, 81, 82].includes(code)) return "Averses";
    if ([95, 96, 99].includes(code)) return "Orage";
    return "Météo inconnue";
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([61, 63, 65].includes(code)) return "🌧️";
    if ([71, 73, 75].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
}

function updateWeatherTheme(code) {
    document.body.classList.remove("sunny", "cloudy", "rainy", "snowy", "stormy", "default-weather");

    if (code === 0) {
        document.body.classList.add("sunny");
    } else if ([1, 2, 3, 45, 48].includes(code)) {
        document.body.classList.add("cloudy");
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        document.body.classList.add("rainy");
    } else if ([71, 73, 75, 77].includes(code)) {
        document.body.classList.add("snowy");
    } else if ([95, 96, 99].includes(code)) {
        document.body.classList.add("stormy");
    } else {
        document.body.classList.add("default-weather");
    }
}