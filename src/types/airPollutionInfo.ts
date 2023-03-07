import latLon from "./latlong"
import RestField from "./restFields"

/**
 * Type of airpollution info request
 * 
 */
interface airPollutionInfo extends latLon, RestField {
    appid: string | undefined
}

const airPollutionInfo = (lat: number, lon: number): airPollutionInfo => {
    if (!process.env.OPENWEATHER_API_KEY) {
        throw new Error()
    }
    return {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY
    }
}


export default airPollutionInfo