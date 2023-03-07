import axios from 'axios'
import { Today, airPollutionInfo, airPollutionResult, SpecifiedRegion, GeoQueryParam, weatherQueryParam, WeatherResult } from '../types'
import { apiEndpoints, regions, regionKeys } from "../constant"
import { AbnormalResponse } from "../error"
import ErrorHandler from '../decorator/errorHandler'
import logger from '../log/logger'

class Weather {
    constructor() {

    }

    async getAQIValue(aqi: number): Promise<string> {
        switch (aqi) {
            case 1:
                return "매우좋음"
            case 2:
                return "좋음"
            case 3:
                return "보통"
            case 4:
                return "나쁨"
            case 5:
                return "매우나쁨"
            default:
                return "Unknown AQI Value"
        }
    }

    @ErrorHandler
    public async getLonLatLocaleInfo(cityname: regionKeys): Promise<SpecifiedRegion> {
        cityname = cityname.toLowerCase() as regions
        const param: GeoQueryParam = {
            q: cityname,
            limit: 5,
            appid: process.env.OPENWEATHER_API_KEY
        }
        const response = await axios.get(`${apiEndpoints.GEO_CODING_INFO}?${new URLSearchParams(param)}`)
        const [{ local_names: { ko }, lat, lon }] = response.data;
        const result: SpecifiedRegion = {
            locale_name: `${ko}시`,
            lat,
            lon
        }
        return result
    }

    @ErrorHandler
    public async getAirPollutionInformation(header: airPollutionInfo): Promise<airPollutionResult> {
        const response = await axios.get(`${apiEndpoints.AIR_POLLUTION_INFO}?${new URLSearchParams(header)}`)
        // Optional Chaining : If data get undefined, return error
        const datas = response?.data?.list[0]
        // If refine is undefined
        if (!datas) {
            logger.error("Fail to get air pollution information")
            throw new AbnormalResponse("Airpollution")
        }
        const {
            main: { aqi },
            components: {
                co,
                pm2_5,
                pm10
            },
            dt
        } = datas
        const filteredAQI = await this.getAQIValue(aqi)
        const result: airPollutionResult = {
            co,
            pm2_5,
            pm10,
            aqi: filteredAQI,
            measuredTime_airpollution: dt
        }
        return result
    }

    @ErrorHandler
    public async getWeatherInformation(locationInfo: SpecifiedRegion): Promise<WeatherResult> {
        const {
            lat,
            lon,
            locale_name
        } = locationInfo
        const param: weatherQueryParam = {
            lat,
            lon,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
        }
        const response = await axios.get(`${apiEndpoints.WEATHER_INFO}?${new URLSearchParams(param)}`)

        const datas = response?.data
        if (!datas) {
            logger.error("Fail to get weather information")
            throw new AbnormalResponse("Weather")
        }
        const {
            weather: [
                {
                    main: weather,
                    description: weatherdescription,
                    icon: weather_icon
                }
            ],
            main: {
                temp: temperature,
                feels_like: temperature_humanfeel,
                temp_min,
                temp_max,
                pressure,
                humidity
            },
            wind: {
                speed: windspeed
            },
            clouds: {
                all: cloudpercentage
            },
            dt: measuredTime,
            sys: {
                sunrise,
                sunset
            }
        } = datas

        const airStatus: airPollutionResult = await this.getAirPollutionInformation(airPollutionInfo(lat, lon))
        const result: WeatherResult = {
            locale_name: locale_name,
            weather: weather,
            weather_icon: `http://openweathermap.org/img/wn/${weather_icon.includes('n') ? weather_icon.replace('n', 'd') : weather_icon}@2x.png`,
            description: weatherdescription,
            temperature: temperature,
            temperature_humanfeel: temperature_humanfeel,
            temp_min: temp_min,
            temp_max: temp_max,
            pressure: pressure,
            humidity: humidity,
            windspeed: windspeed,
            cloudpercentage: cloudpercentage,
            sunrise: sunrise,
            sunset: sunset,
            measuredTime: measuredTime
        }

        // If it rain
        if (weather === "Rain") {
            const {
                rain: {
                    '1h': rainPerHour
                }
            } = datas
            result.rain_per_hour = rainPerHour
        }

        // If it Snow
        if (weather === "Snow") {
            const {
                snow: {
                    '1h': snowPerHour
                }
            } = datas
            result.snow_per_hour = snowPerHour
        }
        return result
    }

    @ErrorHandler
    public async getWeatherNAirInformation(regionOrAxis: SpecifiedRegion | regionKeys): Promise<Today> {
        /**
         * SpecifiedRegion -> Object
         */
        let locationInfo: SpecifiedRegion
        logger.debug(regionOrAxis)
        if (typeof regionOrAxis === 'string') {
            locationInfo = await this.getLonLatLocaleInfo(regionOrAxis)
        }
        /**
         * normal region -> string
         */
        else {
            locationInfo = regionOrAxis
        }
        logger.debug(locationInfo)
        const weather: WeatherResult = await this.getWeatherInformation(locationInfo);
        const airpollution: airPollutionResult = await this.getAirPollutionInformation(airPollutionInfo(locationInfo.lat, locationInfo.lon))
        const result: Today = {
            ...weather,
            ...airpollution
        }
        return result
    }

}

export default Weather