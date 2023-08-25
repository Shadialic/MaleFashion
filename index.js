const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/userdb");
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

app.listen(3000, () => {
    console.log("server started");
})






