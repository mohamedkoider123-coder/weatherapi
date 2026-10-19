let API_KEY = "698d239bdc9346e9ba790704261910";

let searchInput = document.querySelector("#search");
let locateBtn = document.querySelector("#locate");
let statusEl = document.querySelector("#status");
let placeEl = document.querySelector("#place");
let cardsEl = document.querySelector("#cards");
// ai
function setStatus(msg, isError = false) { // loding && error لو بحث غلط
  statusEl.textContent = msg;
  statusEl.classList.toggle("error", isError);
}
//
async function getWeather(query) {
  setStatus("Loading forecast…"); // لحد ما موقع يحمل async
  try {
    let res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=3`);
    let data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Request failed");
    render(data);
    setStatus("");
  } catch (err) {
    setStatus(`Couldn't load weather: ${err.message}. Check the city name and your API key.`, true);
  }
}

// بيغير لون الخلفية حسب حالة الجو
function getTheme(text) {
  text = text.toLowerCase();
  if (text.includes("snow") || text.includes("sleet") || text.includes("ice") || text.includes("blizzard")) return "snowy";
  if (text.includes("rain") || text.includes("drizzle") || text.includes("thunder") || text.includes("shower")) return "rainy";
  if (text.includes("sunny") || text.includes("clear")) return "sunny";
  return "cloudy";
}

// عرض البيانات في الكروت
function render(data) {
  let { location, forecast } = data;
  placeEl.innerHTML = `${location.name}<small>${location.region ? location.region + ", " : ""}${location.country}</small>`;

  document.body.className = getTheme(forecast.forecastday[0].day.condition.text);
// عشان وقت ميتغيرش
  cardsEl.innerHTML = forecast.forecastday
    .map((item, i) => {
      let d = new Date(`${item.date}T00:00:00`);
      let dayName = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "long" });
      let dateText = d.toLocaleDateString("en-US", { day: "numeric", month: "long" });
      let day = item.day;
      return `
        <article class="card ${i === 0 ? "today" : ""}">
          <div class="day">${dayName}</div>
          <div class="date">${dateText}</div>
          <img src="https:${day.condition.icon}" alt="${day.condition.text}" />
          <div class="temp">${Math.round(day.maxtemp_c)}°C</div>
          <div class="temp-min">Low ${Math.round(day.mintemp_c)}°C</div>
          <p class="cond">${day.condition.text}</p>
          <div class="meta">
            <span><b>${day.daily_chance_of_rain}%</b>Rain</span>
            <span><b>${day.avghumidity}%</b>Humidity</span>
            <span><b>${Math.round(day.maxwind_kph)}</b>km/h wind</span>
          </div>
        </article>`;
    })
    .join("");
}

let timer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(timer);
  let city = e.target.value.trim();
  if (city.length < 3) return;
  timer = setTimeout(() => getWeather(city), 500); // بيشغل البحث بعد نص ثانيه
});
function useMyLocation() {
  if (!navigator.geolocation) return getWeather("Cairo"); // لو حصل ايرور هيبحث ع قاهره لوجدو
  setStatus("Finding your location…");
  navigator.geolocation.getCurrentPosition(
    (pos) => getWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => getWeather("Cairo") // لو المستخدم رفض، نعرض القاهرة
  );
}
locateBtn.addEventListener("click", useMyLocation);
useMyLocation();