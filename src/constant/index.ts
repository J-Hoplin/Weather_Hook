import apiEndpoints from "./apiEndpoints";
import regions from "./region";

// Key lists of enum 'regions
type regionKeys = keyof typeof regions

export {
    apiEndpoints,
    regions,
    regionKeys
}