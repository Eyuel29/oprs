require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/cors_options');
const { logger } = require('./middlewares/log_events');
const errorHandler = require('./middlewares/error_handler');
const cookieParser = require('cookie-parser');
const credentials = require('./middlewares/credentials');
const {verifyUserSession} = require('./middlewares/verify_user_session');
const verifyActive = require('./middlewares/verify_active');

const auth = require('./routes/auth');
const listing = require('./routes/listing');
const user = require('./routes/user');
const account = require('./routes/account');
const review = require('./routes/review');
const reservation = require('./routes/reservation');
const notification = require('./routes/notification');
const payment = require('./routes/payment');

const PORT = process.env.PORT || 4000;


app.use(logger);
app.use(credentials);
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) =>{
    res.status(200).send("GOD DID!")
});

app.use('/',root);
app.use('/auth', auth);
app.use('/listing', verifyUserSession, verifyActive, listing);
app.use('/user', verifyUserSession, verifyActive, user);
app.use('/review', verifyUserSession, verifyActive, review);
app.use('/reservation',  verifyUserSession, verifyActive, reservation);
app.use('/payment',  verifyUserSession, verifyActive, payment);
app.use('/account',  verifyUserSession, account);
app.use('/notification',  verifyUserSession, verifyActive, notification);
app.use(errorHandler);

app.listen(PORT, () =>{ 
    console.log("SERVER RUNNIG AT PORT : " + PORT); 
});
