import latLon from "./latlong"
import APIKey from "./apiKey"
import RestField from "./restFields"

//units : this option make temperature into celcius(Default : kalvin)
interface weatherQueryParam extends latLon, APIKey, RestField {
    units: 'metric'
}

export default weatherQueryParam