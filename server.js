const express = require('express');
const connectDB = require('./config/db');

const app = express();
//Connecting to the database
connectDB()

//Initialize BodyParser middleware
app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => res.send('API Running'));

//Define Routes

app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/posts', require('./routes/api/posts'))
app.use('/api/users', require('./routes/api/users'))


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));