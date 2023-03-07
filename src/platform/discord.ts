import { config } from 'dotenv'
import path = require('path')

// Load .env file
config({
    path: path.join(__dirname, '../../.env')
})


console.log(process.env.OPENWEATHER_API_KEY)