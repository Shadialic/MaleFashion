const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/userdb");
const bodyParser = require('body-parser');
const nocache = require('nocache')
const expressLayouts = require("express-ejs-layouts")
const app = express();

const userRouter = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const address_route = require('./routes/adressRoute')

app.use("/", userRouter)
app.use('/admin', adminRoutes)
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout')
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')))

app.listen(3000, () => {
    console.log("server started");
})






