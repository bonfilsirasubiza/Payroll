 
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const corsOptions = {
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/allowances', require('./routes/allowanceRoutes'));
app.use('/api/deductions', require('./routes/deductionRoutes'));
app.use('/api/payrolls', require('./routes/payrollRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));