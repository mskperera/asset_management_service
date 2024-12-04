const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { readdirSync } = require('fs');

const morgan = require('morgan');
const cors = require('cors');



const app = express();
const PORT = process.env.PORT || 8000;


const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
console.log('allowedOrigins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // Allow the origin
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
};


app.use(morgan('dev'));
app.use(cors(corsOptions));


// Create upload directory if it doesn't exist
const uploadDir = path.resolve(process.env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json());

const routeArr = readdirSync('./routes');
routeArr.map((r) => {
  //import routes
   const route = require('./routes/' + r);
  //routes middlewares
   app.use('/api', route);
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
