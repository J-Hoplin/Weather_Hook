const discord = require('discord.js')
const axios = require('axios')
const schedule = require('node-schedule')
const { getAllSupportedRegion } = require('../../Hooks/data')
const config = require('./config.json')

const addZeroUnderTen = (number) => {
    try{
        return number < 10 ? "0" + number : number
    }catch(err){
        return undefined
    }
}

const buildEmbedJSONByRegion = (dataBox) => {
    try{
        const { code, data } = dataBox
        const measureTimeToDate = new Date(data.measuredTime * 1000)
        const measuredTimeAirPollution = new Date(data.measuredTime_airpollution * 1000)
        const sunriseTimeToDate = new Date(data.sunrise * 1000)
        const sunsetTimeToDate = new Date(data.sunset * 1000)
        // Code checking
        code ? (() => {throw new Error()})() : true
        const JSONform = {
            "embeds" : [
                {
                    "title": `${data.locale_name}시 현재 날씨정보`,
                    "description" : `측정시간 : ${addZeroUnderTen(measureTimeToDate.getFullYear())}년 ${addZeroUnderTen(measureTimeToDate.getMonth() + 1)}월 ${addZeroUnderTen(measureTimeToDate.getDate())}일 ${addZeroUnderTen(measureTimeToDate.getHours())} : ${addZeroUnderTen(measureTimeToDate.getMinutes())} : ${addZeroUnderTen(measureTimeToDate.getSeconds())}`,
                    "color" : 16776960,
                    "thumbnail" : {
                        "url" : data.weather_icon
                    },
                    "fields":[
                        {
                            "name" : "데이터 출처",
                            "value" : "Open Weather Map : https://openweathermap.org/"
                        },
                        {
                            "name" : "날씨",
                            "value" : `${data.weather}(${data.description})`,
                            "inline": true
                        },
                        {
                            "name" : "현재 온도",
                            "value" : `${data.temperature}℃`,
                            "inline": true
                        },
                        {
                            "name" : "체감 온도",
                            "value" : `${data.temperature_humanfeel}℃`,
                            "inline" : true
                        },
                        {
                            "name" : "습도",
                            "value" : `${data.humidity} %`,
                            inline : true
                        },
                        {
                            "name" : "기압",
                            "value" : `${data.pressure} hPa`,
                            inline:true
                        },
                        {
                            "name" : "순간 최고/최저기온",
                            "value" : `${data.temp_max}℃ / ${data.temp_min}℃`,
                            "inline" : true
                        },
                        {
                            "name" : "풍속",
                            "value" : `${data.windspeed} meter/sec`,
                            inline: true
                        },
                        {
                            "name" : "구름량",
                            "value" : `${data.cloudpercentage} %`,
                            "inline" : true
                        },
                        {
                            "name" : "일출 / 일몰 시간",
                            "value" : `${addZeroUnderTen(sunriseTimeToDate.getHours())} : ${addZeroUnderTen(sunriseTimeToDate.getMinutes())} / ${addZeroUnderTen(sunsetTimeToDate.getHours())} : ${addZeroUnderTen(sunsetTimeToDate.getMinutes())}`,
                            "inline" : true
                        }
                    ],
                    "footer" : {
                        "text" : "Developed by Hoplin",
                        "icon_url" : "https://avatars.githubusercontent.com/u/45956041?v=4"
                    }
                },
                {
                    "title": `${data.locale_name}시 현재 대기정보`,
                    "description" : `측정시간 : ${addZeroUnderTen(measuredTimeAirPollution.getFullYear())}년 ${addZeroUnderTen(measuredTimeAirPollution.getMonth() + 1)}월 ${addZeroUnderTen(measuredTimeAirPollution.getDate())}일 ${addZeroUnderTen(measuredTimeAirPollution.getHours())} : ${addZeroUnderTen(measuredTimeAirPollution.getMinutes())} : ${addZeroUnderTen(measuredTimeAirPollution.getSeconds())}`,
                    "color" : 16776960,
                    "fields" : [
                        {
                            "name" : "대기질 상태",
                            "value" : data.aqi,
                            "inline" : true
                        },
                        {
                            "name" : "일산화탄소 농도",
                            "value" : `${data.co} μg/m3`,
                            "inline" : true
                        },
                        {
                            "name" : "미세먼지 / 초미세먼지 농도",
                            "value" : `${data.pm10} μg/m3 / ${data.pm2_5} μg/m3`,
                            "inline" : true
                        }
                    ],
                    "footer" : {
                        "text" : "Developed by Hoplin",
                        "icon_url" : "https://avatars.githubusercontent.com/u/45956041?v=4"
                    }
                }
            ]
        }
        // If rain -> Add rain per hr field
        data.rain_per_hour 
        ?(() => {
            JSONform.embeds[0].fields.push(
                {
                    "name" : "시간당 강수량",
                    "value" : `${data.rain_per_hour} mm/hr`,
                }
            )
        })() 
        : true
        // If snow -> Add snow per hr field
        data.data.snow_per_hour
        ? (() => {
            JSONform.embeds[0].fields.push(
                {
                    "name" : "시간당 적설량",
                    "value" : `${data.data.snow_per_hour} mm/hr`,
                }
            )
        })()
        : true
        return JSONform
    }catch(err){
        console.log(err)
        return {
            "embeds" : [
                {
                    "title" : "Something went wrong!",
                    "description" : "Error Message ",
                    "color" : 15158332,
                    "fields" : [
                        {
                            "name" : "아래와 같은 이유로 오류가 발생할 수 있습니다.",
                            "value" : "1. API키가 만료되었거나 손상됨\n2. 잘못된 Discord Web Hook 링크\n3. 지원하지 않는 지역"
                        }
                    ],
                    "footer" : {
                        "text" : "Developed by Hoplin",
                        "icon_url" : "https://avatars.githubusercontent.com/u/45956041?v=4"
                    }
                }
            ]
        }
    }
    
}

const scheduler = async() => {
    try{
        const scheduleObject = schedule.scheduleJob(config.scheduler_expression, async() => {
            const regionDatas = await getAllSupportedRegion()
            const now = new Date();
            const regionMapper = new Map(await Promise.all(regionDatas.map(x => {
                const [cityName, returnValue] = x
                return [ cityName, buildEmbedJSONByRegion(returnValue) ]
            })))
            await Promise.all(Object.entries(config.weather_hooks_endpoints).map(x => {
                const [ endpoint, region ] = x
                return axios.post(endpoint,regionMapper.get(region))
            }))
        })
    }catch(err){
        console.error(err)
    }
}

scheduler()