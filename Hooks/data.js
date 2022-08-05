const axios = require('axios')
const config = require('../config.json').hooks

/**
 * 
 * @param {*} aqi : Filter AQI Number Value based on https://openweathermap.org/api/air-pollution
 * @returns 
 */
const getAQIValue = async (aqi) => {
    switch(aqi){
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
            return "Unknow AQI Value"
    }
}

const getAirPollutionInfo = async (lat,lon) => {
    try{
        const reqParam = {
            lat: lat,
            lon: lon,
            appid: config.api_key,
        }
        const res = await axios.get(`${config.api_endpoint_air_pollution}?${new URLSearchParams(reqParam)}`)
        const {

            main: { aqi },
            components : {
                co,
                pm2_5,
                pm10
            },
            dt
        } = res.data.list[0]
        return {
            co : co,
            pm2_5 : pm2_5,
            pm10 : pm10,
            aqi : await getAQIValue(aqi),
            measuredTime_airpollution : dt
        }
    }catch(err){
        return false
    }
}

/**
 * 
 * @param {*} key : 
 * @param {*} customOption : Only for customized option
 * @returns 
 */
const getWeatherInfo = async (key="seoul",customOption=false) => {
    // Get longtitude, latitude, locale_name(as korean) infos
    try{    
        const { locale_name,lat,lon } = customOption
        ? (() => {
            const [locale_name,lat,lon] = customOption
            return {
                locale_name: locale_name,
                lat: lat,
                lon: lon
            }
        })()
        : await (async () => {
            const locationRes = await getLongLatInfo(key);
            return locationRes.code ? new Error() : locationRes.data
        })()
        const reqParam = {
            lat: lat,
            lon: lon,
            appid: config.api_key,
            units: 'metric'
        }// units : this option make temperature into celcius(Default : kalvin)
        // Make Request as get
        const res = await axios.get(`${config.api_endpoint}?${new URLSearchParams(reqParam)}`)
        // Destruct response
        const { 
            weather:[
            { 
                main:weather,
                description:weatherdescription,
                icon:weather_icon
            }
            ],
            main: {
                temp:temperature,
                feels_like:temperature_humanfeel,
                temp_min,
                temp_max,
                pressure,
                humidity
            },
            wind: {
                speed:windspeed
            },
            clouds: {
                all:cloudpercentage
            },
            dt:measuredTime,
            sys: {
                sunrise,
                sunset
            }
        } = res.data
        // Basic data capsule
        // measuredTime : Unix Time -> Need to multiply 1000 for converting to JS Date obj
        const airStatus = await getAirPollutionInfo(lat,lon);
        const returnValue = {
            code: 0,
            data: {
                locale_name: locale_name,
                weather: weather,
                weather_icon: `http://openweathermap.org/img/wn/${weather_icon.includes('n') ? weather_icon.replace('n','d') : weather_icon}@2x.png`,
                description: weatherdescription,
                temperature: temperature,
                temperature_humanfeel: temperature_humanfeel,
                temp_min: temp_min,
                temp_max: temp_max,
                pressure: pressure,
                humidity: humidity,
                windspeed: windspeed,
                cloudpercentage:cloudpercentage,
                sunrise: sunrise,
                sunset: sunset,
                measuredTime: measuredTime,
                pm2_5 : airStatus.pm2_5,
                pm10 : airStatus.pm10,
                co : airStatus.co,
                aqi : airStatus.aqi,
                measuredTime_airpollution: airStatus.measuredTime_airpollution
            }
        }

        // If weather rain
        weather === "Rain"
        ?(() => {
            const {
                rain: {
                    '1h':rainPerHour
                }
            } = res.data
            returnValue.data.rain_per_hour = rainPerHour
        })()
        :true
        // If weather snow
        weather === "Snow"
        ?(() => {
            const {
                snow: {
                    '1h':snowPerHour
                }
            } = res.data
            returnValue.data.snow_per_hour = snowPerHour
        })()
        :true
        return [key,returnValue]
    }catch(err){
        console.error(err.data)
        // If fail
        return [key,{
            code: 1
        }]
    }
}



const getLongLatInfo = async (cityName) => {
    // Make city name to lower case
    cityName = cityName.toLowerCase();
    // Geocoding latitude longtitude api parameter
    const geoParam = {
        q: cityName,
        limit: 5,
        appid: config.api_key
    }  
    try{
        // Request API
        const res = await axios.get(`${config.geo_coding_api_endpoint}?${new URLSearchParams(geoParam)}`)
        // Destruct response json
        const [{ local_names:{ ko }, lat, lon }] = res.data;
        // If success
        return {
            code: 0,
            data: {
                locale_name: ko + "시",
                lat: lat,
                lon: lon
            }
        }
    }catch(err){
        console.error(err.data)
        // If fail
        return {
            code: 1
        }
    }
}

const getAllSupportedRegion = async() => {
    const regionCalls = await Promise.all(config.supported_region.map(x => getWeatherInfo(x)))
    return regionCalls
}


module.exports = { getAllSupportedRegion, getWeatherInfo }