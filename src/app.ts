import express from 'express';
import productsRouter from './routes/productsRouter';
import usersRouter from './routes/usersRouter';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('./api', productsRouter);
app.use('./api', usersRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})