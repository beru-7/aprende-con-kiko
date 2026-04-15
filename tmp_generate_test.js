const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const quizModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
const prompt = `Genera 5 preguntas de opción múltiple para aprender inglés.
Tema: "Vocabulario". Dificultad: "easy".

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
(async () => {
  try {
    const result = await quizModel.generateContent(prompt);
    const text = result.response.text();
    console.log('RESULT_TEXT');
    console.log(text);
    console.log('END_OF_RESULT');
  } catch (e) {
    console.error('ERROR', e);
  }
})();
