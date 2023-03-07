import logger from '../log/logger'
import Weather from '../app'
import { Today } from '../types'
import { region, specified } from "../../app-config.json"
import { regionKeys, regions } from '../constant'
import { SpecifiedRegion } from '../types'
import axios, { Axios, AxiosResponse } from 'axios'

// Weather Instance
const weather = new Weather()

const addZeroUnderTen = (number: number): string | undefined | number => {
    try {
        return number < 10 ? "0" + number : number
    } catch (err) {
        return undefined
    }
}

const buildEmbedJSONByRegion = async (data: Today): Promise<object> => {
    try {
        const measureTimeToDate = new Date(data.measuredTime * 1000)
        const measuredTimeAirPollution = new Date(data.measuredTime_airpollution * 1000)
        const sunriseTimeToDate = new Date(data.sunrise * 1000)
        const sunsetTimeToDate = new Date(data.sunset * 1000)
        const JSONform: { [key: string]: any } = {
            "embeds": [
                {
                    "title": `${data.locale_name} 현재 날씨정보`,
                    "description": `측정시간 : ${addZeroUnderTen(measureTimeToDate.getFullYear())}년 ${addZeroUnderTen(measureTimeToDate.getMonth() + 1)}월 ${addZeroUnderTen(measureTimeToDate.getDate())}일 ${addZeroUnderTen(measureTimeToDate.getHours())} : ${addZeroUnderTen(measureTimeToDate.getMinutes())} : ${addZeroUnderTen(measureTimeToDate.getSeconds())}`,
                    "color": 16776960,
                    "thumbnail": {
                        "url": data.weather_icon
                    },
                    "fields": [
                        {
                            "name": "데이터 출처",
                            "value": "Open Weather Map : https://openweathermap.org/"
                        },
                        {
                            "name": "날씨",
                            "value": `${data.weather}(${data.description})`,
                            "inline": true
                        },
                        {
                            "name": "현재 온도",
                            "value": `${data.temperature}℃`,
                            "inline": true
                        },
                        {
                            "name": "체감 온도",
                            "value": `${data.temperature_humanfeel}℃`,
                            "inline": true
                        },
                        {
                            "name": "습도",
                            "value": `${data.humidity} %`,
                            inline: true
                        },
                        {
                            "name": "기압",
                            "value": `${data.pressure} hPa`,
                            inline: true
                        },
                        {
                            "name": "순간 최고/최저기온",
                            "value": `${data.temp_max}℃ / ${data.temp_min}℃`,
                            "inline": true
                        },
                        {
                            "name": "풍속",
                            "value": `${data.windspeed} meter/sec`,
                            inline: true
                        },
                        {
                            "name": "구름량",
                            "value": `${data.cloudpercentage} %`,
                            "inline": true
                        },
                        {
                            "name": "일출 / 일몰 시간",
                            "value": `${addZeroUnderTen(sunriseTimeToDate.getHours())} : ${addZeroUnderTen(sunriseTimeToDate.getMinutes())} / ${addZeroUnderTen(sunsetTimeToDate.getHours())} : ${addZeroUnderTen(sunsetTimeToDate.getMinutes())}`,
                            "inline": true
                        }
                    ],
                    "footer": {
                        "text": "Developed by Hoplin",
                        "icon_url": "https://avatars.githubusercontent.com/u/45956041?v=4"
                    }
                },
                {
                    "title": `${data.locale_name} 현재 대기정보`,
                    "description": `측정시간 : ${addZeroUnderTen(measuredTimeAirPollution.getFullYear())}년 ${addZeroUnderTen(measuredTimeAirPollution.getMonth() + 1)}월 ${addZeroUnderTen(measuredTimeAirPollution.getDate())}일 ${addZeroUnderTen(measuredTimeAirPollution.getHours())} : ${addZeroUnderTen(measuredTimeAirPollution.getMinutes())} : ${addZeroUnderTen(measuredTimeAirPollution.getSeconds())}`,
                    "color": 16776960,
                    "fields": [
                        {
                            "name": "대기질 상태",
                            "value": data.aqi,
                            "inline": true
                        },
                        {
                            "name": "일산화탄소 농도",
                            "value": `${data.co} μg/m3`,
                            "inline": true
                        },
                        {
                            "name": "미세먼지 / 초미세먼지 농도",
                            "value": `${data.pm10} μg/m3 / ${data.pm2_5} μg/m3`,
                            "inline": true
                        }
                    ],
                    "footer": {
                        "text": "Developed by Hoplin",
                        "icon_url": "https://avatars.githubusercontent.com/u/45956041?v=4"
                    }
                }
            ]
        }
        // If rain -> Add rain per hr field
        if ('rain_per_hour' in data) {
            JSONform.embeds[0].fields.push(
                {
                    "name": "시간당 강수량",
                    "value": `${data.rain_per_hour} mm/hr`,
                }
            )
        }

        if ('snow_per_hour' in data) {
            JSONform.embeds[0].fields.push(
                {
                    "name": "시간당 적설량",
                    "value": `${data.data.snow_per_hour} mm/hr`,
                }
            )
        }
        return JSONform
    } catch (err) {
        console.log(err)
        return {
            "embeds": [
                {
                    "title": "Something went wrong!",
                    "description": "Error Message ",
                    "color": 15158332,
                    "fields": [
                        {
                            "name": "아래와 같은 이유로 오류가 발생할 수 있습니다.",
                            "value": "1. API키가 만료되었거나 손상됨\n2. 잘못된 Discord Web Hook 링크\n3. 지원하지 않는 지역\n4. 잘못된 좌표값 설정"
                        }
                    ],
                    "footer": {
                        "text": "Developed by Hoplin",
                        "icon_url": "https://avatars.githubusercontent.com/u/45956041?v=4"
                    }
                }
            ]
        }
    }

}

const loadRegion = async () => {
    return region.map(async x => {
        try {
            const {
                hook: apiEndpoint,
                region
            } = x
            const data = await weather.getWeatherNAirInformation(region as regionKeys)
            logger.info(`Process Complete : ${apiEndpoint}`)
            return axios.post(apiEndpoint, await buildEmbedJSONByRegion(data))
        } catch (err) {
            logger.error(err)
            return false
        }
    })
}

const loadSpecified = async () => {
    return specified.map(async x => {
        try {
            // {api endpoint, [lat,lon,locale_name]}
            const {
                hook: apiEndpoint,
                location: specified
            } = x;
            const data = await weather.getWeatherNAirInformation(SpecifiedRegion(specified))
            logger.info(`Process Complete : ${apiEndpoint}`)
            return axios.post(apiEndpoint, await buildEmbedJSONByRegion(data))
        } catch (err) {
            logger.error(err)
            return false
        }
    })
}

const task = async (): Promise<void> => {
    try {
        const region = await loadRegion();
        const specified = await loadSpecified();
        await Promise.all([...region, ...specified])
    } catch (err) {
        console.error(err)
        logger.error(err)
    }
}

export default task