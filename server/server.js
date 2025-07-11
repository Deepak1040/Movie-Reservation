const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
require('dotenv').config()
const auth = require('./routes/auth')
const cinema = require('./routes/cinema')
const theater = require('./routes/theater')
const movie = require('./routes/movie')
const showtime = require('./routes/showtime')
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");

require('./utils/emailScheduler');


mongoose.set('strictQuery', false)
mongoose
    .connect(process.env.DATABASE, { autoIndex: true })
    .then(() => {
        console.log('mongoose connected!')
    })
    .catch((err) => console.log(err))

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: true, credentials: true }))
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())

app.use('/auth', auth)
app.use('/cinema', cinema)
app.use('/theater', theater)
app.use('/movie', movie)
app.use('/showtime', showtime)
app.use(express.json());

const { swaggerUi, swaggerSpec } = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(bodyParser.json());

const ticketDir = path.join(__dirname, 'tickets');
if (!fs.existsSync(ticketDir)) {
    fs.mkdirSync(ticketDir);
}
const payment = require('./routes/payment')
app.use('/payment', payment);

const port = process.env.PORT

app.listen(port, () => console.log(`start server in http://localhost:${port}`))