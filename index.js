/*
npm i slugify
npm i http-status-codes
npm i qrcode
npm i morgan
npm i chalk
npm i crypto-js
npm i nanoid
 */
import chalk from 'chalk';
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })
import express from 'express'
import initApp from './src/index.router.js'

const app = express()
// setup port and the baseUrl
const port = process.env.PORT || 5000
app.get('/', (req, res, next) => {
    res.json({message:"welcome"})
})
initApp(app ,express)
app.listen(port, () => console.log(chalk.bold.blueBright(`Example app listening on port ${port}!`)))


