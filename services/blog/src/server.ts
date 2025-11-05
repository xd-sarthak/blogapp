import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT;
console.log(port);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});