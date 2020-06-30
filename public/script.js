let cityNameSearchBox = document.getElementById('city-name-box')
let searchButton = document.getElementById('city-button')
let weatherSearchForm = document.getElementById('weather-search-form')
let newCityNameSearchBox = document.getElementById('new-city-name-box')
let newCityNameSearchForm = document.getElementById('new-city-search-form')
let newCityNameSearchBoxMobile = document.getElementById('new-city-name-box-mobile')
let newCityNameSearchFormMobile = document.getElementById('new-city-search-form-mobile')
let mobileNavBar = document.getElementById('mobile-phone-nav-bar')
let currentData = undefined;
let currentFiveDayData = undefined;
let tempSliderContainer = document.getElementById('temp-slide-container')
let tempSlider = document.getElementById('temp-slider')
let currentTempMeasure = "F";

window.onload = function() {
    setInterval(renderDateAndTime, 100)
    cityNameSearchBox.classList.add('fade-in')
    searchButton.classList.add('fade-in')
}

weatherSearchForm.addEventListener('submit', e => {
    submitCityName()
    e.preventDefault();
    cityNameSearchBox.value = '';
}, false)

newCityNameSearchForm.addEventListener('submit', event => {
    submitCityName(newCityNameSearchBox.value)
    event.preventDefault();
    newCityNameSearchBox.value = '';
}, false)

newCityNameSearchFormMobile.addEventListener('submit', event => {
    submitCityName(newCityNameSearchBoxMobile.value)
    event.preventDefault();
    newCityNameSearchBox.value = '';
}, false)


function submitCityName(new_city_name) {
    let city_name = new_city_name || cityNameSearchBox.value;
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            city: city_name
        })
    }).then(res => res.json()).then(data => {
        console.log(data)
       if(data.cod !== 200) {
           let searchBox = document.getElementById('city-name-box')
           let errorMessage = document.getElementById('error-message')
           if(!searchBox.classList.contains('error')) searchBox.classList.add('error')
           errorMessage.innerHTML = 'City could not be found.'
           searchBox.value = '';
       }
       else {
        let errorMessage = document.getElementById('error-message')
        fadeOutSearchBox()
        errorMessage.style.display = 'none';
        renderData(data)
        currentData = data;
       }
    })

    //fetch for 5 day forecast
    fetch('/five-day-forecast', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            city: city_name
        })
    }).then(res => res.json()).then(data => {
        console.log(data)
        if(data.cod !== "200") {
            return;
        }
        else {
            renderFiveDayData(data)
            currentFiveDayData = data;
        }
    })
}

function fadeOutSearchBox() {
    cityNameSearchBox.classList.remove('fade-in')
    searchButton.classList.remove('fade-in')
    cityNameSearchBox.classList.add('fade-out');
    searchButton.classList.add('fade-out');
    setTimeout(function() {
        cityNameSearchBox.style.display = 'none';
        cityNameSearchBox.style.display = 'none';
        searchButton.style.display = 'none';
    }, 1500)
}

function calculateSunInfo(sunTime, offset, time) {
    let localTime = new Date();
    let localTimeZoneOffset = (localTime.getTimezoneOffset() * -1) / 60;
    let differenceInHours = Math.round(Math.abs(localTimeZoneOffset) + (offset / 3600))
    var newSunTime = new Date(sunTime * 1000)
    var sunHours = newSunTime.getHours();
    if(time == "sunrise") {
        var minutes = "0" + newSunTime.getMinutes()
        return `The next sunrise is at: ${(sunHours + differenceInHours) % 12}:${minutes.substr(-2)} ${calculateAmPm((sunHours + differenceInHours) % 12)}`
    }
    else {
        var minutes = "0" + newSunTime.getMinutes()
        return `The next sunset is at: ${(sunHours + differenceInHours) % 12}:${minutes.substr(-2)} ${calculateAmPm((sunHours + differenceInHours))}`
    }
}

function renderData(data, new_temp_measure) {
    let tempMeasure = new_temp_measure || currentTempMeasure
    let cityName = document.getElementById('city-name-title')
    let currentTemp = document.getElementById('current-temp')
    let tempHighLow = document.getElementById('temp-high-low')
    let weatherInfo = document.getElementById('weather-info')
    let currentWeatherDetails = document.getElementsByClassName('current-weather-details')
    let sunInfo = document.getElementById("sun-information")
    let foreCastInfo = document.getElementById("five-day-forecast")
    currentTemp.innerHTML = `${calcTemp(data.main.temp, tempMeasure)}<sup><span>${"°".concat(tempMeasure)}<span><sup>`
    tempHighLow.innerHTML = `${calcTemp(data.main.temp_min, tempMeasure)}<sup>${"°".concat(tempMeasure)}<sup>    |   ${calcTemp(data.main.temp_max, tempMeasure)}<sup>${"°".concat(tempMeasure)}<sup>`
    cityName.innerHTML = `${data.name}, ${data.sys.country || "N/A"}`
    weatherInfo.innerHTML = `${calculateWeatherIcon(calculateWeather(data.weather[0].description))} Currently... ${calculateWeather(data.weather[0].description)}`
    sunInfo.innerHTML = `${calculateSunInfo(data.sys.sunrise, data.timezone, "sunrise")}<br> ${calculateSunInfo(data.sys.sunset, data.timezone, "sunset")}`
    wrapText();
    setTimeout(function() {
        for(let i = 0; i < currentWeatherDetails.length; i++) {
            currentWeatherDetails[i].classList.add('fade-in')
        }
        weatherInfo.classList.add('fade-in')
        sunInfo.classList.add('fade-in')
        mobileNavBar.classList.add('fade-in')
        foreCastInfo.style.opacity = 1;
        newCityNameSearchBox.classList.add('fade-in')
        tempSliderContainer.classList.add('fade-in')
    }, 1500)
    

}

function calcTemp(datapoint, tempMeasure) {
    if(tempMeasure == "K") {
        return (datapoint).toFixed(2)
    }
    else if(tempMeasure == "C") {
        return convertKtoC(datapoint)
    }
    else { 
        return convertKtoF(datapoint)
    }
}


function renderFiveDayData(data, new_temp_measure) {
    let tempMeasure = new_temp_measure || currentTempMeasure
    for(let i = 1; i <= 5; i++) {
        let currentElement = document.getElementById('day'.concat(i))
        let weatherDesc = calculateWeather(data.list[i * 4].weather[0].description)
        let currentDay = (8 * (i-1)) + 4
        currentElement.innerHTML = `${findCurrentDay(data.list[currentDay].dt)}: <span>${calcTemp(data.list[currentDay].main.temp_min, tempMeasure)}<sup>${"°".concat(tempMeasure)}</sup> | ${calcTemp(data.list[currentDay].main.temp_max, tempMeasure)}<sup>${"°".concat(tempMeasure)}</sup></span><br>${weatherDesc}  ${calculateWeatherIcon(weatherDesc)}`
        addBackground(currentElement, weatherDesc)
    }

}

function findCurrentDay(date) {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(date * 1000).getDay()]
}

function addBackground(elem, desc) {
    let randomNumber = Math.round(Math.random() * 1 + 1)
    if(elem.classList[1] != undefined) elem.classList.remove(elem.classList[1])
    if(desc === 'Clear' || desc === 'Sunny') elem.classList.add('sunny'.concat(randomNumber))
    if(desc === 'Cloudy') elem.classList.add('cloudy'.concat(randomNumber))
    if(desc === 'Raining' || desc === 'A thunderstorm') elem.classList.add('rainy'.concat(randomNumber))
    if(desc === 'Snowing' || desc === 'Foggy') elem.classList.add('snowy'.concat(randomNumber))
}

function wrapText() {
    const currentTemp = new CircleType(document.getElementById("current-temp")).radius(200).dir(1);
    const highLowTemp = new CircleType(document.getElementById("temp-high-low")).radius(400).dir(-1);
}

function calculateWeather(description) {
    switch(description) {
        case 'clear sky':
        case (description.indexOf('clear') != -1):
            return 'Clear'
            break;
        case 'few clouds':
        case 'scattered clouds':
        case 'broken clouds':
        case 'overcast clouds':
        case (description.indexOf('cloud') != -1):
            return 'Cloudy'
            break;
        case 'shower rain':
        case 'rain':
        case 'light rain':
        case 'moderate rain':
        case 'heavy rain':
        case (description.indexOf('rain') != -1):
            return 'Raining'
            break;
        case 'thunderstorm':
        case (description.indexOf('thunder') != -1):
            return 'A thunderstorm'
        case 'snow':
        case (description.indexOf('snow') != -1):
            return 'Snowing'
        case 'mist':
        case (description.indexOf('mist') != -1):
            return 'Foggy'
        default:
            return description
    }
}
function calculateWeatherIcon(description) {
    switch(description) {
        case 'Clear':
        case 'Sunny':
            return '<span class="weather-icon"><i class="fa fa-sun"></i></span>';
            break;
        case 'Cloudy':
            return '<span class="weather-icon"><i class="fa fa-cloud"></i></span>';
            break;
        case 'Raining':
            return '<span class="weather-icon"><i class="fa fa-cloud-rain"></i></span>';
            break;
        case 'A thunderstorm':
            return '<span class="weather-icon"><i class="fa fa-bolt"></i></span>';
            break;
        case 'Snowing':
            return '<span class="weather-icon"><i class="fa fa-snowflake"></i></span>';
            break;
        case 'Foggy':
            return '<span class="weather-icon"><i class="fa fa-wind"></i></span>';
            break;
        default:
            return 'No icon found.'
    }
}

function convertKtoF(kelvin) {
    if(kelvin != null) return ((kelvin - 273.15) * 9/5 + 32).toFixed(2)
}
function convertKtoC(kelvin) {
    if(kelvin != null) return (kelvin - 273.15).toFixed(2)
}


function renderDateAndTime() {
    let date = new Date();
    let currentDate = document.getElementById('currentDate')
    currentDate.innerHTML = `${date.toLocaleString('default', { month: 'long'})} ${date.getDate()}, ${date.getUTCFullYear()}`
    let currentTime = document.getElementById('currentTime')
    currentTime.innerHTML = `${date.getHours() % 12 == 0 ? 12 : date.getHours() % 12}:${fixMinutes(date.getMinutes())} ${calculateAmPm(date.getHours())}`
}

function fixMinutes(minutes) {
    if(minutes < 10) return '0' + minutes
    else { return minutes }
}
function calculateAmPm(hours) {
    if(hours > 12) return 'PM'
    else { return 'AM' }
}

function slideInOutForecast() {
    let forecastElement = document.getElementById('five-day-forecast')
    if(forecastElement.classList.contains('slide-in')) {
        forecastElement.classList.remove('slide-in')
        forecastElement.classList.add('slide-out')
    }
    else if(forecastElement.classList.contains('slide-out')) {
        forecastElement.classList.remove('slide-out')
        forecastElement.classList.add('slide-in')
    }
    else {
        forecastElement.classList.add('slide-in')
    }
}



tempSlider.onchange = function() {
    if(tempSlider.value <= 33) {
        currentTempMeasure = "F";
        renderData(currentData, "F")
        renderFiveDayData(currentFiveDayData, "F")
    }
    else if(tempSlider.value <= 66) {
        currentTempMeasure = "C";
        renderData(currentData, "C")
        renderFiveDayData(currentFiveDayData, "C")
    }
    else {
        currentTempMeasure = "K";
        renderData(currentData, "K")
        renderFiveDayData(currentFiveDayData, "K")
    }
}

function openCityBox() {
    fadeInOutElement(newCityNameSearchBoxMobile)
    
}

function openTempMeasure() {
    fadeInOutElement(tempSliderContainer)
}

function fadeInOutElement(elem) {
    if(elem.classList.contains('fade-in')) {
        elem.classList.remove('fade-in')
        elem.classList.add('fade-out')
    }
    else if(newCityNameSearchBoxMobile.classList.contains('fade-out')) {
        elem.classList.remove('fade-out')
        elem.classList.add('fade-in')
    }
    else {
        elem.classList.add('fade-in')
    }
}

