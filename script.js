var constants = {
  API_KEY: "788c4d1d86f79c1c706f3980424b0cb7",
  WEATHER_API_BASE_URL: "https://api.openweathermap.org/data/2.5",
  LOCALSTORAGE_KEY_NAME: "weatherHistory",
  DEFAULT_WEATHER: "Chicago",
};

$(document).ready(function () {
  tryCreateHistory();
  generateHistory();
  fetchForecastByName(constants.DEFAULT_WEATHER);
});

function generateHistory() {
  var currentHistory = getCurrentHistory();
  for (var i = 0; i < currentHistory.length; i++) {
    var location = currentHistory[i];
    addToHistoryHTML(location);
  }
}

function tryCreateHistory() {
  if (localStorage.getItem(constants.LOCALSTORAGE_KEY_NAME)) {
    return;
  }
  localStorage.setItem(constants.LOCALSTORAGE_KEY_NAME, "[]");
}

function getCurrentHistory() {
  var currentHistoryString = localStorage.getItem(
    constants.LOCALSTORAGE_KEY_NAME
  );
  return JSON.parse(currentHistoryString);
}

function addToHistory(location) {
  tryCreateHistory();
  var currentHistory = getCurrentHistory();
  currentHistory.push(location);
  var newHistoryString = JSON.stringify(currentHistory);
  localStorage.setItem(constants.LOCALSTORAGE_KEY_NAME, newHistoryString);
  onHistoryAdd(location);
}

var weatherByCityParams = {
  appid: constants.API_KEY,
  q: "",
};

function getWeatherCardHTML(date, temp, humidity, iconID) {
  var iconURL = "http://openweathermap.org/img/wn/" + iconID + "@2x.png";
  return (
    '\
    <div class="card" style="width: 18rem;">\
      <img src="' +
    iconURL +
    '" class="card-img-top" alt="Weather Icon">\
      <div class="card-body">\
          <h5 class="card-title">' +
    date +
    '</h5>\
          <p class="card-text">Temp: ' +
    temp +
    '&#176;F</p>\
          <p class="card-text">Humidity: ' +
    humidity +
    "%</p>\
      </div>\
      </div>"
  );
}

function getHistoryCardHTML(location) {
  return '<li class="list-group-item">' + location + "</li>";
}

function addToHistoryHTML(location) {
  $("ul#history").prepend(getHistoryCardHTML(location));
}

function onHistoryAdd(location) {
  addToHistoryHTML(location);
}

// Loop for Extrating Weather Data

function onForecast(data) {
  console.log("Forecast Daily Weather: ", data.daily);
  var htmlContent = "";
  for (var i = 0; i < 5; i++) {
    var weather = data.daily[i];
    var date = new Date(weather.dt * 1000).toLocaleDateString();
    var weatherIcon = weather.weather[0].icon;
    var temp = weather.temp.day;
    var humidity = weather.humidity;
    htmlContent += getWeatherCardHTML(date, temp, humidity, weatherIcon);
  }
  $("div#weather-display").html(htmlContent);
}

function fetchForecastByName(name) {
  weatherByCityParams.q = name;

  weatherByCityEndpoint =
    constants.WEATHER_API_BASE_URL + "/weather?" + $.param(weatherByCityParams);
  $.get(weatherByCityEndpoint, function (weatherData, status) {
    if (status != "success") {
      console.log(
        "Responsible returned a non-200 Status Code. Status: " + status
      );
      return;
    }

    var cityCoord = weatherData.coord;
    var forecastParams = {
      appid: constants.API_KEY,
      lat: cityCoord.lat,
      lon: cityCoord.lon,
      units: "imperial",
    };
    forecastEndpoint =
      constants.WEATHER_API_BASE_URL + "/onecall?" + $.param(forecastParams);
    $.get(forecastEndpoint, function (forecastData, status) {
      if (status != "success") {
        console.log(
          "Responsible returned a non-200 Status Code. Status: " + status
        );
        return;
      }
      onForecast(forecastData);
    });
  });
}

$("button#get-weather").click(function () {
  var location = $("#location").val();
  if (!location) {
    return;
  }
  addToHistory(location);
  fetchForecastByName(location);
});
