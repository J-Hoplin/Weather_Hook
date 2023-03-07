class AbnormalResponse extends Error {
    constructor(processName: string) {
        super(`Error occured while processing ${processName}`)
    }
}

export default AbnormalResponse