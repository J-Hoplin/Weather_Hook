interface WeatherResult {
    locale_name: string
    weather: string
    weather_icon: string
    description: string
    temperature: number,
    temperature_humanfeel: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    windspeed: number
    cloudpercentage: number
    sunrise: number
    sunset: number
    measuredTime: number
    rain_per_hour?: number
    snow_per_hour?: number
}

export default WeatherResult