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
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        const temperature = Math.round(weatherData.current.temperature_2m);
        const weatherCode = weatherData.current.weather_code;
        const description = getWeatherDescription(weatherCode);

        weatherResult.innerHTML = `
    <h2>${cityName}, ${country}</h2>
    <p style="font-size: 32px; margin: 10px 0;"><strong>${temperature}°C</strong></p>
    <p style="color: #555;">${description}</p>
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