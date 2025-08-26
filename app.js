require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const ejsLayouts = require('express-ejs-layouts');
const corsOptions = require('./config/cors_options');
const { logger } = require('./middlewares/log_events');
const errorHandler = require('./middlewares/error_handler');
const cookieParser = require('cookie-parser');
const credentials = require('./middlewares/credentials');
const { verifySession } = require('./middlewares/verify_session');
const verifyActive = require('./middlewares/verify_status');
const requestCache = require('./config/log_cache_config');
const statusMonitor = require('express-status-monitor');
const auth = require('./routes/auth');
const listing = require('./routes/listing');
const user = require('./routes/user');
const admin = require('./routes/admin');
const account = require('./routes/account');
const review = require('./routes/review');
const reservation = require('./routes/reservation');
const notification = require('./routes/notification');
const payment = require('./routes/payment');
const PORT = process.env.PORT || 4000;

app.use(express.static('public'));
app.use(ejsLayouts);
app.use(statusMonitor());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', './layouts/index');

app.use(logger);
const morganMw = morgan('combined', {
  stream: {
    write: (message) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        log: message.trim(),
      };
      const key = `log_${Date.now()}`;
      requestCache.set(key, logEntry);
    },
  },
});

app.use(morganMw);
app.use(cors());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', auth);
app.use('/api/admin', verifySession, admin);
app.use('/api/account', verifySession, account);
app.use('/api/user', verifySession, verifyActive, user);
app.use('/api/listing', verifySession, verifyActive, listing);
app.use('/api/reservation', verifySession, verifyActive, reservation);
app.use('/api/notification', verifySession, verifyActive, notification);
app.use('/api/payment', verifySession, verifyActive, payment);
app.use('/api/review', verifySession, verifyActive, review);

app.use(errorHandler);

app.listen(PORT, () => console.log('SERVER RUNNIG AT PORT : ' + PORT));
