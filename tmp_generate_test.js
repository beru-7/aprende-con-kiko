const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const quizModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
const prompt = `Genera 5 preguntas de opci�n m�ltiple para aprender ingl�s.
Tema: "Vocabulario". Dificultad: "easy".

Debes responder ESTRICTAMENTE con este formato JSON Array:
[
  {
    "q_en": "Question in English",
    "q_es": "Traducci�n de la pregunta al espa�ol",
    "opts": ["Correct Option", "Wrong Option"],
    "ans": 0,
    "hint_en": "Short hint in English",
    "hint_es": "Pista corta en Espa�ol"
  }
]
Aseg�rate de que la opci�n correcta sea SIEMPRE la primera (�ndice 0).
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
