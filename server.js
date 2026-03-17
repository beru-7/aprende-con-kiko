require('dotenv').config({ path: __dirname + '/.env' });
console.log("LA URL ES:", process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pool } = require('pg');     
const bcrypt = require('bcrypt');   

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});


    // Actualiza la creación de la tabla para incluir 'avatar'
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                progress JSONB DEFAULT '{}',
                trophies JSONB DEFAULT '[]',
                avatar TEXT DEFAULT NULL -- NUEVA COLUMNA
            );
        `);
    } catch (err) { console.error("Error DB:", err); }
};

// Nueva ruta para actualizar la foto de perfil
app.post('/api/update-avatar', async (req, res) => {
    const { username, avatar } = req.body;
    try {
        await pool.query('UPDATE users SET avatar = $1 WHERE username = $2', [avatar, username]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
initDB();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Modelo para Quiz 
const quizModel = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

// Modelo para Chat 
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });




// REGISTRO
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, password, progress, trophies) 
             VALUES ($1, $2, '{}', '[]') RETURNING username`,
            [username, hashedPassword]
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (e) {
        if (e.code === '23505') return res.status(400).json({ error: "El usuario ya existe" });
        res.status(500).json({ error: e.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

        res.json({ 
            success: true, 
            user: { 
                username: user.username, 
                progress: user.progress || {}, 
                trophies: user.trophies || [] 
            } 
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GUARDAR PROGRESO
app.post('/api/save', async (req, res) => {
    const { username, progress, trophies } = req.body;
    try {
        await pool.query(
            `UPDATE users SET progress = $1, trophies = $2 WHERE username = $3`,
            [JSON.stringify(progress), JSON.stringify(trophies), username]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});




// CHAT CON KIKO
app.post('/api/chat', async (req, res) => {
    try {
        const result = await chatModel.generateContent(`
            Act as Kiko, a friendly fox teaching English. 
            User said: "${req.body.message}". 
            Reply in English, very short and conversational (max 15 words).
        `);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error("Error Chat:", error);
        res.status(500).json({ reply: "My ears are ringing. Say again?" });
    }
});

// GENERADOR DE PREGUNTAS
app.post('/api/generate-quiz', async (req, res) => {
    try {
        const { topic, difficulty } = req.body;
        console.log(`🧠 Generando quiz de: ${topic} (${difficulty})...`);

        const prompt = `
            Genera 5 preguntas de opción múltiple para aprender inglés.
            Tema: "${topic}". Dificultad: "${difficulty}".
            
            Debes responder ESTRICTAMENTE con este formato JSON Array:
            [
              {
                "q_en": "Question in English",
                "q_es": "Traducción de la pregunta al español",
                "opts": ["Correct Option", "Wrong Option"],
                "ans": 0,
                "hint_en": "Short hint in English",
                "hint_es": "Pista corta en Español"
              }
            ]
            Asegúrate de que la opción correcta sea SIEMPRE la primera (índice 0).
        `;

        const result = await quizModel.generateContent(prompt);
        const text = result.response.text();
        const questions = JSON.parse(text);
        res.json(questions);

    } catch (error) {
        console.error("Error Quiz:", error);
        res.json([]); 
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Kiko Full-Power listo en http://localhost:${PORT}`));
