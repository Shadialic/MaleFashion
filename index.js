const express = require('express');
const path = require('path');
const env = require('dotenv')
env.config()
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
const expressLayouts = require("express-ejs-layouts")
const app = express();

const userRouter = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use("/", userRouter);
app.use('/admin', adminRoutes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout')
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')))

app.listen(process.env.PORT, () => {
    console.log("server started");
})






