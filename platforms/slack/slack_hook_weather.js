const schedule = require('node-schedule')
const axios = require('axios')
const config = require('./config.json')
const common = require('../common.json')
const { getAllSupportedRegion } = require('../../Hooks/data')

const textBox = async (cityName,capsule) => {
    let payload;
    try{
        const { code, data } = capsule
        // If code 1 -> throw error
        code ? (() => {throw new Error()})() : true
        // Convert Unix time to normal millisecond and convert to Date Object
        const measureTimeToDate = new Date(data.measuredTime * 1000)
        const sunriseTimeToDate = new Date(data.sunrise * 1000)
        const sunsetTimeToDate = new Date(data.sunset * 1000)
        // Build Text
        const integerStringFilter = (number) => {
            return number < 10 ?  "0" + number : number.toString()
        }
        
        const textbox = `*[  ${data.locale_name}시 현재날씨  |   측정시간 : ${measureTimeToDate.getFullYear()}년 ${integerStringFilter(measureTimeToDate.getMonth() + 1)}월 ${integerStringFilter(measureTimeToDate.getDate())}일 ${integerStringFilter(measureTimeToDate.getHours())} : ${integerStringFilter(measureTimeToDate.getMinutes())} : ${integerStringFilter(measureTimeToDate.getSeconds())}  ]*\n
    - *날씨* : ${data.weather}(${data.description})\n
    - *온도* : ${data.temperature}℃ (체감온도 : ${data.temperature_humanfeel}℃)\n
    - *최고/최저 기온* : ${data.temp_max}℃ / ${data.temp_min}℃\n
    - *기압* : ${data.pressure} hPa\n
    - *습도* : ${data.humidity} %\n
    - *풍속* : ${data.windspeed} meter/sec\n
    - *구름량* : ${data.cloudpercentage} %\n
    - *일출/일몰 시간* : ${integerStringFilter(sunriseTimeToDate.getHours())}시 ${integerStringFilter(sunriseTimeToDate.getMinutes())}분 ${integerStringFilter(sunriseTimeToDate.getSeconds())}초 / ${integerStringFilter(sunsetTimeToDate.getHours())}시 ${integerStringFilter(sunsetTimeToDate.getMinutes())}분 ${integerStringFilter(sunsetTimeToDate.getSeconds())}초\n
    - *대기질 상태* : ${data.aqi}\n
    - *일산화탄소 농도* : ${data.co} μg/m3\n
    - *미세먼지 / 초미세먼지 농도* : ${data.pm10} μg/m3 / ${data.pm2_5} μg/m3`
        // Return city name and payload
        return [cityName,{
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type" : "mrkdwn",
                        "text" : textbox
                    }
                }
            ]
        }]
    }catch(err){
        return [cityName,{
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type" : "mrkdwn",
                        "text" : common.fail_to_make_data
                    }
                }
            ]
        }] 
    }
}

const preprocessTextBox = async() => {
    try{
        const regionDatas = await getAllSupportedRegion()
        const regionMapper = new Map(await Promise.all(regionDatas.map(x => {
            const [ cityName, returnValue ] = x
            return textBox(cityName.toLowerCase(),returnValue)
        })))
        await Promise.all(Object.entries(config.weather_hooks_endpoints).map(x => {
            const [ endpoint, region ] = x
            return axios.post(endpoint,regionMapper.get(region.toLowerCase()))
        }))
    }catch(err){
        console.error(err)
    }
}

const scheduler = async () => {
    try{
        const scheduleObject = schedule.scheduleJob(config.scheduler_expression, async () => {
            await preprocessTextBox()
        })
    }catch(err){
        console.error(err)
    }
}

scheduler()