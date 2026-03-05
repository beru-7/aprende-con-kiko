//temas
const topics = {
    'vocabulary': { id: 'vocabulary', name: 'Vocabulario', icon: '📝', subtopics: [{ id: 'family', name: 'Familia (Family)' }, { id: 'food', name: 'Comida (Food)' }] },
    'structure': { id: 'structure', name: 'Estructura', icon: '🏗️', subtopics: [{ id: 'comparatives', name: 'Comparativos y Superlativos' }, { id: 'prepositions', name: 'Preposiciones (In/On/At)' }] },
    'grammar': { id: 'grammar', name: 'Gramática', icon: '📖', subtopics: [{ id: 'requests', name: 'Peticiones (Requests)' }, { id: 'perfect', name: 'Presente Perfecto' }, { id: 'for_since', name: 'For & Since' }] },
    'verbs': { id: 'verbs', name: 'Verbos', icon: '⚡', subtopics: [{ id: 'gerunds', name: 'Gerundio vs Infinitivo' }, { id: 'phrasal', name: 'Phrasal Verbs' }] },
    'logic': { id: 'logic', name: 'Lógica', icon: '🧠', subtopics: [{ id: 'zero_cond', name: 'Condicional Cero' }, { id: 'first_cond', name: 'Primer Condicional' }, { id: 'both', name: 'Both/Neither' }] },
    'self': { id: 'self', name: 'Pronombres', icon: '👤', subtopics: [{ id: 'reflexive', name: 'Reflexivos' }] }
};

//preguntas
const questionBank = [
    // --- VOCABULARY - FAMILY ---
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "El hermano de tu padre es tu...", q_en: "Your father's brother is your...", opts: ["Uncle", "Aunt"], ans: 0, hint_es: "Tío.", hint_en: "Uncle." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "La hermana de tu madre es tu...", q_en: "Your mother's sister is your...", opts: ["Aunt", "Uncle"], ans: 0, hint_es: "Tía.", hint_en: "Aunt." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "El hijo de tu hijo es tu...", q_en: "Your son's son is your...", opts: ["Grandson", "Grandfather"], ans: 0, hint_es: "Nieto.", hint_en: "Grandson." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "La hija de tu hermana es tu...", q_en: "Your sister's daughter is your...", opts: ["Niece", "Nephew"], ans: 0, hint_es: "Sobrina.", hint_en: "Niece." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "El hijo de tu hermana es tu...", q_en: "Your sister's son is your...", opts: ["Nephew", "Niece"], ans: 0, hint_es: "Sobrino.", hint_en: "Nephew." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "La madre de tu esposa es tu...", q_en: "Your wife's mother is your...", opts: ["Mother-in-law", "Grandmother"], ans: 0, hint_es: "Suegra.", hint_en: "Mother-in-law." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "El padre de tu padre es tu...", q_en: "Your dad's dad is your...", opts: ["Grandfather", "Uncle"], ans: 0, hint_es: "Abuelo.", hint_en: "Grandfather." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "'Siblings' significa...", q_en: "'Siblings' means...", opts: ["Brothers and Sisters", "Parents"], ans: 0, hint_es: "Hermanos y hermanas.", hint_en: "Brothers & Sisters." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "'Spouse' significa...", q_en: "'Spouse' means...", opts: ["Husband or Wife", "Cousin"], ans: 0, hint_es: "Esposo/a.", hint_en: "Husband/Wife." },
    { topicId: 'vocabulary', subtopicId: 'family', q_es: "Hija se dice...", q_en: "Daughter means...", opts: ["Daughter", "Sister"], ans: 0, hint_es: "Niña de los padres.", hint_en: "Female child." },
    
    // --- VOCABULARY - FOOD ---
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "Comida de la mañana:", q_en: "Morning meal:", opts: ["Breakfast", "Dinner"], ans: 0, hint_es: "Desayuno.", hint_en: "Breakfast." },
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "Comida de la noche:", q_en: "Evening meal:", opts: ["Dinner", "Lunch"], ans: 0, hint_es: "Cena.", hint_en: "Dinner." },
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "Apple es una...", q_en: "Apple is a...", opts: ["Fruit", "Vegetable"], ans: 0, hint_es: "Fruta.", hint_en: "Fruit." },
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "Carrot es una...", q_en: "Carrot is a...", opts: ["Vegetable", "Meat"], ans: 0, hint_es: "Verdura.", hint_en: "Vegetable." },
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "Bread está hecho de...", q_en: "Bread is made of...", opts: ["Wheat/Flour", "Meat"], ans: 0, hint_es: "Harina.", hint_en: "Flour." },
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "La leche viene de...", q_en: "Milk comes from...", opts: ["Cows", "Trees"], ans: 0, hint_es: "Vaca.", hint_en: "Cow." },
    { topicId: 'vocabulary', subtopicId: 'food', q_es: "Tomas café en una...", q_en: "You drink coffee from a...", opts: ["Cup/Mug", "Plate"], ans: 0, hint_es: "Taza.", hint_en: "Cup." },
    
    // --- STRUCTURE - COMPARATIVES ---
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "An elephant is ____ than a dog.", q_en: "An elephant is ____ than a dog.", opts: ["bigger", "biger"], ans: 0, hint_es: "Doble G.", hint_en: "Double G." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "A Ferrari is ____ than a Fiat.", q_en: "A Ferrari is ____ than a Fiat.", opts: ["more expensive", "expensiver"], ans: 0, hint_es: "Adjetivo largo.", hint_en: "Long adjective." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "He is ____ than me.", q_en: "He is ____ than me.", opts: ["taller", "more tall"], ans: 0, hint_es: "Adjetivo corto.", hint_en: "Short adjective." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "She is the ____ student.", q_en: "She is the ____ student.", opts: ["best", "goodest"], ans: 0, hint_es: "Irregular (Good).", hint_en: "Irregular (Good)." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "This is the ____ movie ever.", q_en: "This is the ____ movie ever.", opts: ["worst", "baddest"], ans: 0, hint_es: "Irregular (Bad).", hint_en: "Irregular (Bad)." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "Summer is ____ than winter.", q_en: "Summer is ____ than winter.", opts: ["hotter", "hoter"], ans: 0, hint_es: "Doble T.", hint_en: "Double T." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "It is the ____ dangerous animal.", q_en: "It is the ____ dangerous animal.", opts: ["most", "more"], ans: 0, hint_es: "Superlativo largo.", hint_en: "Long superlative." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "I am ____ today than yesterday.", q_en: "I am ____ today than yesterday.", opts: ["happier", "happyer"], ans: 0, hint_es: "Y cambia a I.", hint_en: "Y changes to I." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "This test was ____ than the last one.", q_en: "This test was ____ than the last one.", opts: ["easier", "more easy"], ans: 0, hint_es: "Easy -> Easier.", hint_en: "Easy -> Easier." },
    { topicId: 'structure', subtopicId: 'comparatives', q_es: "She is as ____ as her mother.", q_en: "She is as ____ as her mother.", opts: ["tall", "taller"], ans: 0, hint_es: "As...As usa adjetivo base.", hint_en: "As...As uses base adjective." },
    
    // --- STRUCTURE - PREPOSITIONS ---
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "The cat is ____ the box (dentro).", q_en: "The cat is ____ the box.", opts: ["in", "on"], ans: 0, hint_es: "Adentro.", hint_en: "Inside." },
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "The book is ____ the table (sobre).", q_en: "The book is ____ the table.", opts: ["on", "in"], ans: 0, hint_es: "Encima.", hint_en: "On top." },
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "See you ____ 5 PM.", q_en: "See you ____ 5 PM.", opts: ["at", "on"], ans: 0, hint_es: "Hora exacta.", hint_en: "Exact time." },
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "See you ____ Monday.", q_en: "See you ____ Monday.", opts: ["on", "in"], ans: 0, hint_es: "Días de la semana.", hint_en: "Days of week." },
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "Born ____ 1995.", q_en: "Born ____ 1995.", opts: ["in", "on"], ans: 0, hint_es: "Años = In.", hint_en: "Years = In." },
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "She is ____ the bus stop.", q_en: "She is ____ the bus stop.", opts: ["at", "on"], ans: 0, hint_es: "Lugar específico.", hint_en: "Specific place." },
    { topicId: 'structure', subtopicId: 'prepositions', q_es: "I live ____ Spain.", q_en: "I live ____ Spain.", opts: ["in", "at"], ans: 0, hint_es: "Países = In.", hint_en: "Countries = In." },
    
    // --- GRAMMAR - REQUESTS ---
    { topicId: 'grammar', subtopicId: 'requests', q_es: "Pedir permiso a un amigo:", q_en: "Ask a friend for permission:", opts: ["Can I use this?", "May I use this?"], ans: 0, hint_es: "Can = Informal.", hint_en: "Can = Informal." },
    { topicId: 'grammar', subtopicId: 'requests', q_es: "Pedir permiso al jefe:", q_en: "Ask boss for permission:", opts: ["May I leave?", "Can I leave?"], ans: 0, hint_es: "May = Formal.", hint_en: "May = Formal." },
    { topicId: 'grammar', subtopicId: 'requests', q_es: "____ you help me? (Educado)", q_en: "____ you help me? (Polite)", opts: ["Could", "Can"], ans: 0, hint_es: "Could es suave.", hint_en: "Could is soft." },
    { topicId: 'grammar', subtopicId: 'requests', q_es: "Would you mind ____?", q_en: "Would you mind ____?", opts: ["helping", "to help"], ans: 0, hint_es: "Would you mind + ING.", hint_en: "Would you mind + ING." },
    
    // --- GRAMMAR - PRESENT PERFECT ---
    { topicId: 'grammar', subtopicId: 'perfect', q_es: "I have ____ (finish).", q_en: "I have ____ (finish).", opts: ["finished", "finish"], ans: 0, hint_es: "Participio (-ed).", hint_en: "Participle (-ed)." },
    { topicId: 'grammar', subtopicId: 'perfect', q_es: "She ____ (eat).", q_en: "She ____ (eat).", opts: ["has eaten", "have eaten"], ans: 0, hint_es: "She usa Has.", hint_en: "She uses Has." },
    { topicId: 'grammar', subtopicId: 'perfect', q_es: "Have you ____ been to Italy?", q_en: "Have you ____ been to Italy?", opts: ["ever", "never"], ans: 0, hint_es: "Pregunta experiencia = Ever.", hint_en: "Experience Q = Ever." },
    
    // --- GRAMMAR - FOR / SINCE ---
    { topicId: 'grammar', subtopicId: 'for_since', q_es: "____ 2010.", q_en: "____ 2010.", opts: ["Since", "For"], ans: 0, hint_es: "Fecha exacta.", hint_en: "Exact date." },
    { topicId: 'grammar', subtopicId: 'for_since', q_es: "____ two years.", q_en: "____ two years.", opts: ["For", "Since"], ans: 0, hint_es: "Duración.", hint_en: "Duration." },
    
    // --- VERBS - GERUNDS ---
    { topicId: 'verbs', subtopicId: 'gerunds', q_es: "I enjoy ____ (read).", q_en: "I enjoy ____ (read).", opts: ["reading", "to read"], ans: 0, hint_es: "Enjoy + ING.", hint_en: "Enjoy + ING." },
    { topicId: 'verbs', subtopicId: 'gerunds', q_es: "I want ____ (go).", q_en: "I want ____ (go).", opts: ["to go", "going"], ans: 0, hint_es: "Want + TO.", hint_en: "Want + TO." },
    
    // --- VERBS - PHRASAL VERBS ---
    { topicId: 'verbs', subtopicId: 'phrasal', q_es: "Wake up:", q_en: "Wake up:", opts: ["Despertar", "Dormir"], ans: 0, hint_es: "Ojos abiertos.", hint_en: "Open eyes." },
    { topicId: 'verbs', subtopicId: 'phrasal', q_es: "Get up:", q_en: "Get up:", opts: ["Levantarse", "Sentarse"], ans: 0, hint_es: "Salir de la cama.", hint_en: "Get out of bed." },
    
    // --- LOGIC - CONDITIONALS ---
    { topicId: 'logic', subtopicId: 'zero_cond', q_es: "If you heat ice, it ____.", q_en: "If you heat ice, it ____.", opts: ["melts", "will melt"], ans: 0, hint_es: "Hecho científico.", hint_en: "Scientific fact." },
    { topicId: 'logic', subtopicId: 'first_cond', q_es: "If it rains, I ____ stay.", q_en: "If it rains, I ____ stay.", opts: ["will", "am"], ans: 0, hint_es: "Futuro posible.", hint_en: "Possible future." },
    
    // --- SELF - REFLEXIVE ---
    { topicId: 'self', subtopicId: 'reflexive', q_es: "I hurt ____.", q_en: "I hurt ____.", opts: ["myself", "meself"], ans: 0, hint_es: "I -> Myself.", hint_en: "I -> Myself." },
    { topicId: 'self', subtopicId: 'reflexive', q_es: "They blame ____.", q_en: "They blame ____.", opts: ["themselves", "theirselves"], ans: 0, hint_es: "Themselves (con V).", hint_en: "Themselves (with V)." }
];