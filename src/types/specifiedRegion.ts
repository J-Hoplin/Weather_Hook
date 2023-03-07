import latLon from "./latlong";

/**
 * Companion Type
 */

interface SpecifiedRegion extends latLon {
    locale_name: string
}

const SpecifiedRegion = (box: any[]): SpecifiedRegion => {
    const [lat, lon, locale_name] = box
    return {
        lat,
        lon,
        locale_name
    }
}

export default SpecifiedRegion