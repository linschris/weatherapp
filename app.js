const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const port = process.env.PORT || 3000
const axios = require('axios')
const api_key = 'd9e2a78a333fcaa11a93dd2dd1155edf'
const weather_url = 'http://api.openweathermap.org/data/2.5/weather'
const forecast_url = 'http://api.openweathermap.org/data/2.5/forecast'

let homePage = __dirname + '/index.html'
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(homePage)
})

app.post('/weather', (req, res) => {
    axios.get(`${weather_url}?q=${req.body.city}&appid=${api_key}`)
    .then(response => res.send(response.data))
    .catch(err => res.send({message: err}))
    //res.send({message: `${req.body.city} BITCH`})
})

app.post('/five-day-forecast', (req, res) => {
    axios.get(`${forecast_url}?q=${req.body.city}&appid=${api_key}`)
    .then(response => res.send(response.data))
    .catch(err => res.send({message: err}))
})

http.listen(port, function() {
    console.log(`Server is listening on port: ${port}`)
})






