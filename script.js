// ========== Config ==========
// ===== Replace with your WeatherAPI key =====
const API_KEY = "7cbf61a6d6484deabd755744252608"; 
const PROFILE_NAME = "Riya Aggarwal";
const PROFILE_LINK = "https://www.linkedin.com/in/riya-aggarwal-28429b260";
// ===========================================

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const statusEl = document.getElementById("status");
const card = document.getElementById("weatherCard");
const forecastCard = document.getElementById("forecastCard");
const forecastGrid = document.getElementById("forecastGrid");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");

// Profile
document.getElementById("profileLink").textContent = PROFILE_NAME;
document.getElementById("profileLink").href = PROFILE_LINK;

// State
let isCelsius = true;

function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.style.display = "block";
}
function clearStatus() {
  statusEl.textContent = "";
  statusEl.style.display = "none";
}

async function fetchWeather(city) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City not found");
  return res.json();
}

async function fetchForecast(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5&aqi=no&alerts=no`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast not found");
  return res.json();
}

function renderWeather(data) {
  document.getElementById("location").textContent = `${data.location.name}, ${data.location.country}`;
  document.getElementById("date").textContent = data.location.localtime;
  document.getElementById("icon").src = "https:" + data.current.condition.icon;
  document.getElementById("temp").textContent = Math.round(data.current.temp_c);
  document.querySelector(".unit").textContent = "°C";
  document.getElementById("desc").textContent = data.current.condition.text;
  document.getElementById("feels").textContent = `${Math.round(data.current.feelslike_c)}°C`;
  document.getElementById("humidity").textContent = `${data.current.humidity}%`;
  document.getElementById("wind").textContent = `${data.current.wind_kph} kph`;
  document.getElementById("pressure").textContent = `${data.current.pressure_mb} mb`;
  card.hidden = false;
}

function renderForecast(data) {
  forecastGrid.innerHTML = "";
  data.forecast.forecastday.forEach(day => {
    const div = document.createElement("div");
    div.className = "forecast-item";
    div.innerHTML = `
      <p>${day.date}</p>
      <img src="https:${day.day.condition.icon}" alt="">
      <p>${Math.round(day.day.avgtemp_c)}°C</p>
    `;
    forecastGrid.appendChild(div);
  });
  forecastCard.hidden = false;
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  try {
    showStatus("Loading...");
    const weather = await fetchWeather(city);
    renderWeather(weather);
    const forecast = await fetchForecast(city);
    renderForecast(forecast);
    clearStatus();
  } catch (err) {
    showStatus(err.message);
    card.hidden = true;
    forecastCard.hidden = true;
  }
});

geoBtn.addEventListener("click", async () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      showStatus("Fetching location weather...");
      const { latitude, longitude } = pos.coords;
      const query = `${latitude},${longitude}`;
      const weather = await fetchWeather(query);
      renderWeather(weather);
      const forecast = await fetchForecast(query);
      renderForecast(forecast);
      clearStatus();
    } catch (err) {
      showStatus(err.message);
    }
  });
});

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  const tempEl = document.getElementById("temp");
  const feelsEl = document.getElementById("feels");

  let temp = parseFloat(tempEl.textContent);
  let feels = parseFloat(feelsEl.textContent);

  if (isCelsius) {
    temp = Math.round((temp - 32) * 5 / 9);
    feels = Math.round((feels - 32) * 5 / 9);
    document.querySelector(".unit").textContent = "°C";
    unitToggle.textContent = "°F";
  } else {
    temp = Math.round(temp * 9 / 5 + 32);
    feels = Math.round(feels * 9 / 5 + 32);
    document.querySelector(".unit").textContent = "°F";
    unitToggle.textContent = "°C";
  }

  tempEl.textContent = temp;
  feelsEl.textContent = feels + (isCelsius ? "°C" : "°F");
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Auto-run
window.addEventListener("DOMContentLoaded", () => {
  cityInput.value = "London";
  form.requestSubmit();
});
