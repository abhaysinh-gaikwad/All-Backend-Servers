// index.js or app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connection } = require('./config/db');
const { userRouter } = require('./routes/user.route');
const { employeeRouter } = require('./routes/employee.route');
const { swaggerUi, swaggerSpecs } = require('./swaggerConfig');

const app = express();

app.use(express.json());
app.use(cors());

// API routes
app.use('/users', userRouter);
app.use('/employee', employeeRouter);

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(process.env.PORT || 3000, async () => {
    try {
        await connection;
        console.log(`Connected to DB`);
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    } catch (err) {
        console.error(err);
    }
});
