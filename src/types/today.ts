import WeatherResult from "./weatherResult"
import airPollutionResult from "./airPollutionResult"
import RestField from "./restFields"

interface Today extends WeatherResult, airPollutionResult, RestField { }

export default Today