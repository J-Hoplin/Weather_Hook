import { config } from 'dotenv'
import path = require('path')
import task from './platform/discord'
import logger from './log/logger'
import { scheduler as cron } from "../app-config.json"
import { scheduleJob } from "node-schedule"

// Load .env file
config({
    path: path.join(__dirname, '../../.env')
})

function scheduler() {
    logger.info("Checking prerequisites...")
    if (!process.env.OPENWEATHER_API_KEY) {
        logger.error("Openweather API Key not found!")
        process.exit(0);
    }
    if (!cron) {
        logger.error("Scheduler crontab expression not found!")
        process.exit(0);
    }
    logger.info(`Scheduler start! : ${cron}`)
    try {
        const schedule = scheduleJob(cron, async () => {
            logger.info("Task now running...")
            task()
            logger.info("Task end...")
        })
    } catch (err) {
        logger.error(err)
    }
}

scheduler()