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
        const measuredTimeAirPollution = new Date(data.measuredTime_airpollution * 1000)
        const sunriseTimeToDate = new Date(data.sunrise * 1000)
        const sunsetTimeToDate = new Date(data.sunset * 1000)
        // Build Text
        const integerStringFilter = (number) => {
            return number < 10 ?  "0" + number : number.toString()
        }
        const attachBox = {
            "attachments" : [
                {
                    "title" : `${data.locale_name}시 현재 날씨정보`,
                    "color" : "#FFFF00",
                    "text" : `측정시간 : ${integerStringFilter(measureTimeToDate.getFullYear())}년 ${integerStringFilter(measureTimeToDate.getMonth() + 1)}월 ${integerStringFilter(measureTimeToDate.getDate())}일 ${integerStringFilter(measureTimeToDate.getHours())} : ${integerStringFilter(measureTimeToDate.getMinutes())} : ${integerStringFilter(measureTimeToDate.getSeconds())}\n데이터 출처 : https://openweathermap.org/`,
                    "fields" : [
                        {
                            "title" : "날씨",
                            "value"  :`${data.weather}(${data.description})`,
                            "short" : true
                        },
                        {
                            "title" : "현재 온도",
                            "value"  :`${data.temperature}℃`,
                            "short" : true
                        },
                        {
                            "title" : "체감 온도",
                            "value"  :`${data.temperature_humanfeel}℃`,
                            "short" : true
                        },
                        {
                            "title" : "습도",
                            "value"  :`${data.humidity} %`,
                            "short" : true
                        },
                        {
                            "title" : "기압",
                            "value"  :`${data.pressure} hPa`,
                            "short" : true
                        },
                        {
                            "title" : "순간 최고/최저기온",
                            "value"  :`${data.temp_max}℃ / ${data.temp_min}℃`,
                            "short" : true
                        },
                        {
                            "title" : "풍속",
                            "value"  :`${data.windspeed} meter/sec`,
                            "short" : true
                        },
                        {
                            "title" : "구름량",
                            "value"  :`${data.cloudpercentage} %`,
                            "short" : true
                        },
                        {
                            "title" : "일출 / 일몰 시간",
                            "value"  :`${integerStringFilter(sunriseTimeToDate.getHours())} : ${integerStringFilter(sunriseTimeToDate.getMinutes())} / ${integerStringFilter(sunsetTimeToDate.getHours())} : ${integerStringFilter(sunsetTimeToDate.getMinutes())}`,
                            "short" : true
                        }
                    ],
                    "thumb_url" : data.weather_icon,
                    "footer" : "Developed by Hoplin",
                    "footer_icon" : "https://avatars.githubusercontent.com/u/45956041?v=4"
                },
                {
                    "title" : `${data.locale_name}시 현재 대기정보`,
                    "color" : "#FFFF00",
                    "text" : `측정시간 : ${measuredTimeAirPollution.getFullYear()}년 ${integerStringFilter(measuredTimeAirPollution.getMonth() + 1)}월 ${integerStringFilter(measuredTimeAirPollution.getDate())}일 ${integerStringFilter(measuredTimeAirPollution.getHours())} : ${integerStringFilter(measuredTimeAirPollution.getMinutes())} : ${integerStringFilter(measuredTimeAirPollution.getSeconds())}\n데이터 출처 : https://openweathermap.org/`,
                    "fields" : [
                        {
                            "title" : "대기질 상태",
                            "value"  : data.aqi,
                            "short" : true
                        },
                        {
                            "title" : "일산화탄소 농도",
                            "value"  :`${data.co} μg/m3`,
                            "short" : true
                        },
                        {
                            "title" : "미세먼지 / 초미세먼지 농도",
                            "value"  :`${data.pm10} μg/m3 / ${data.pm2_5} μg/m3`,
                            "short" : true
                        }
                    ],
                    "footer" : "Developed by Hoplin",
                    "footer_icon" : "https://avatars.githubusercontent.com/u/45956041?v=4"
                }
            ]
        }
        // If rain -> Add rain per hr field
        data.rain_per_hour
        ?(() => {
            attachBox.attachments[0].fields.push(
                {
                    "title" : "시간당 강수량",
                    "value" : `${data.rain_per_hour} mm/hr`,
                    "short" : true
                }
            )
        })()
        : true
        // If snow -> Add snow per hr field
        data.snow_per_hour
        ?(() => {
            attachBox.attachments[0].fields.push(
                {
                    "title" : "시간당 적설량",
                    "value" : `${data.data.snow_per_hour} mm/hr`,
                    "short" : true
                }
            )
        })()
        : true
        // Return city name and payload
        return [cityName, attachBox]
    }catch(err){
        console.error(err)
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