const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// const expressLayouts = require('express-ejs-layouts');
const app = express();

// Connect to MongoDB (make sure MongoDB is running)
mongoose.connect('mongodb://127.0.0.1:27017/userdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userRouter = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Define your routes
app.use('/', userRouter);
app.use('/admin', adminRoutes);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// app.set('layout', 'layouts/layout'); // Ensure 'layouts' folder and 'layout.ejs' exist
// app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
