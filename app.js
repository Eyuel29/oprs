require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middlewares/logEvents');
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const credentials = require('./middlewares/auth/credentials');
const {verifyUserSession} = require('./middlewares/auth/verifyUserSession');
const PORT = process.env.PORT || 4000;

const auth = require('./routes/auth');
const listing = require('./routes/listing');
const user = require('./routes/user');
const account = require('./routes/account');
const root = require('./routes/root');

const reservation = require('./routes/reservation');
const notification = require('./routes/notification');
const payment = require('./routes/payment');

app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) =>{
    res.status(200).send("WAM")
});

app.use('/',root);
app.use('/auth', auth);
app.use('/listing', listing);
app.use('/user', verifyUserSession,user);
app.use('/review', verifyUserSession,);
app.use('/reservation', verifyUserSession,reservation);
app.use('/payment', verifyUserSession,payment);
app.use('/account', verifyUserSession,account);

app.use(errorHandler);

app.listen(PORT, () =>{ 
    console.log("SERVER RUNNIG AT PORT : " + PORT); 
});