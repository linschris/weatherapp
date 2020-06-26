let cityNameSearchBox = document.getElementById('city-name-box')
let searchButton = document.getElementById('city-button')
let weatherSearchForm = document.getElementById('weather-search-form')
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


function submitCityName() {
    let city_name = cityNameSearchBox.value
    fadeOutSearchBox()
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
       console.log('CURRENT TEMP:' + data.main.temp)
       console.log('TEMP HIGH:' + data.main.temp_max)
       console.log('TEMP LOW:' + data.main.temp_min)
       console.log('COORDS:' + JSON.stringify(data.coord))
       renderData(data)
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
        renderFiveDayData(data);
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

function calculateSunInfo(sunRiseTime, sunSetTime) {
    var sunRiseTime = new Date(sunRiseTime * 1000)
    var sunSetTime = new Date(sunSetTime * 1000)
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var SRhours = sunRiseTime.getHours();
    var SShours = sunSetTime.getHours();
    if(sunRiseTime < sunSetTime) {
        var minutes = "0" + sunRiseTime.getMinutes()
        return `The next sunrise is at: ${sunRiseTime.getHours() % 12}:${minutes.substr(-2)} ${calculateAmPm(sunRiseTime.getHours())}`
    }
    else {
        var minutes = "0" + sunSetTime.getMinutes()
        return `The next sunset is at: ${sunSetTime.getHours() % 12}:${minutes.substr(-2)} ${calculateAmPm(sunSetTime.getHours())}`
    }
}



function renderData(data) {
    let cityName = document.getElementById('city-name-title')
    let currentTemp = document.getElementById('current-temp')
    let tempHighLow = document.getElementById('temp-high-low')
    let weatherInfo = document.getElementById('weather-info')
    let currentWeatherDetails = document.getElementsByClassName('current-weather-details')
    let sunInfo = document.getElementById("sun-information")
    currentTemp.innerHTML = `${convertKtoF(data.main.temp)}<sup><span>°F<span><sup>`
    tempHighLow.innerHTML = `${convertKtoF(data.main.temp_max)}<sup>°F<sup>    |   ${convertKtoF(data.main.temp_min)}<sup>°F<sup>`
    cityName.innerHTML = `${data.name}, ${data.sys.country}`
    weatherInfo.innerHTML = `${calculateWeatherIcon(calculateWeather(data.weather[0].description))} Currently... ${calculateWeather(data.weather[0].description)}`
    sunInfo.innerHTML = `${calculateSunInfo(data.sys.sunrise, data.sys.sunset)}`
    wrapText();
    setTimeout(function() {
        for(let i = 0; i < currentWeatherDetails.length; i++) {
            currentWeatherDetails[i].classList.add('fade-in')
        }
        weatherInfo.classList.add('fade-in')
        sunInfo.classList.add('fade-in')
    }, 1500)
    

}

function renderFiveDayData(data) {
    console.log(data)
    for(let i = 1; i <= 5; i++) {
        let currentElement = document.getElementById('day'.concat(i))
        let weatherDesc = calculateWeather(data.list[i * 4].weather[0].description)
        let currentDay = (8 * (i-1)) + 4
        currentElement.innerHTML = `${findCurrentDay(data.list[currentDay].dt)}: <span>${convertKtoF(data.list[currentDay].main.temp_min)}<sup>°F</sup> | ${convertKtoF(data.list[currentDay].main.temp_max)}<sup>°F</sup></span><br>${weatherDesc}  ${calculateWeatherIcon(weatherDesc)}`
        addBackground(currentElement, weatherDesc)
    }

}

function findCurrentDay(date) {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(date * 1000).getDay()]
}

function addBackground(elem, desc) {
    if(elem.classList[1] != undefined) elem.classList.remove(elem.classList[1])
    if(desc === 'Clear' || desc === 'Sunny') elem.classList.add('sunny')
    if(desc === 'Cloudy') elem.classList.add('cloudy')
    if(desc === 'Raining' || desc === 'A thunderstorm') elem.classList.add('rainy')
    if(desc === 'Snowing' || desc === 'Foggy') elem.classList.add('snowy')
}

function wrapText() {
    const currentTemp = new CircleType(document.getElementById("current-temp")).radius(200).dir(1);
    const highLowTemp = new CircleType(document.getElementById("temp-high-low")).radius(400).dir(-1);
}

function calculateWeather(description) {
    switch(description) {
        case 'clear sky':
            return 'Clear'
            break;
        case 'few clouds':
        case 'scattered clouds':
        case 'broken clouds':
        case 'overcast clouds':
            return 'Cloudy'
            break;
        case 'shower rain':
        case 'rain':
        case 'light rain':
            return 'Raining'
            break;
        case 'thunderstorm':
            return 'A thunderstorm'
        case 'snow':
            return 'Snowing'
        case 'mist':
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

function convertFtoC(fahr) {
    if(fahr != null) return ((5/9 * fahr) - 32).toFixed(2)
}

function renderDateAndTime() {
    let date = new Date();
    let currentDate = document.getElementById('currentDate')
    currentDate.innerHTML = `${date.toLocaleString('default', { month: 'long'})} ${date.getDate()}, ${date.getUTCFullYear()}`
    let currentTime = document.getElementById('currentTime')
    currentTime.innerHTML = `${date.getHours() % 12}:${fixMinutes(date.getMinutes())} ${calculateAmPm(date.getHours())}`
}

function fixMinutes(minutes) {
    if(minutes < 10) return '0' + minutes
    else { return minutes }
}
function calculateAmPm(hours) {
    if(hours > 12) return 'PM'
    else { return 'AM' }
}


