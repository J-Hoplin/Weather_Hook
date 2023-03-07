import APIKey from "./apiKey"
import RestField from "./restFields"

interface GeoQueryParam extends APIKey, RestField {
    q: string,
    limit: number
}

export default GeoQueryParam