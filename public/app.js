
let userProgress = JSON.parse(localStorage.getItem('emq17_progress')) || { grammar:{}, verbs:{}, logic:{}, self:{}, vocabulary:{}, structure:{}, global:{} };
let earnedTrophies = JSON.parse(localStorage.getItem('emq17_trophies')) || [];
let currentUser = null;
let currentUserAvatar = null; // Para guardar la foto actual

// Estado
let currentTopicId, currentSubtopicId, currentLevel, currentQuestions, qIndex, score;
let isRegisterMode = false;

// Variables para el Recorte de Imagen
let cropper; // Instancia de Cropper.js
const cropperModal = document.getElementById('cropper-modal');
const imageToCrop = document.getElementById('image-to-crop');
const avatarInput = document.getElementById('avatar-input');

// Modo Oscuro Inicial
let darkMode = localStorage.getItem('emq_theme') === 'dark';

//CONFIGURACIÓN DE AUDIO
let audioCtx = null;
let musicEnabled = true;
let sfxEnabled = true;

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    updateAudioIcons();
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    updateAudioIcons();
}

function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    updateAudioIcons();
    if(sfxEnabled) playSound('click');
}

function updateAudioIcons() {
    const iconM = document.getElementById('icon-music');
    const iconS = document.getElementById('icon-sfx');
    if(iconM) iconM.innerText = musicEnabled ? 'music_note' : 'music_off';
    if(iconS) iconS.innerText = sfxEnabled ? 'volume_up' : 'volume_off';
}

function playSound(type) {
    if (!sfxEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if(type === 'correct') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
    } else if(type === 'incorrect') {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
    } else {
        osc.frequency.setValueAtTime(440, now);
    }
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
}


const buddyContainer = document.getElementById('buddy');
const buddyEmoji = document.getElementById('buddy-emoji');
const buddyBubble = document.getElementById('buddy-bubble');
let buddyTimeout;

function updateBuddyPosition(screenId) {
    buddyContainer.className = 'md3-fab-buddy'; 
    if (screenId === 'screen-welcome') {
        buddyContainer.style.cssText = "top: 15%; left: 10%; transform: scale(1.2);";
    } else if (screenId === 'screen-login') {
        buddyContainer.style.cssText = "top: 20px; left: 20px; transform: scale(0.8);";
    } else if (screenId === 'screen-quiz') {
        buddyContainer.style.cssText = "top: 80px; right: 24px; transform: scale(0.9);";
    } else if (screenId === 'screen-result') {
        buddyContainer.style.cssText = "top: 10%; left: 50%; transform: translateX(-50%) scale(1.3);";
    } else if (screenId === 'screen-profile') {
        buddyContainer.style.cssText = "bottom: 20px; left: 20px; transform: scale(0.9);";
    } else {
        buddyContainer.style.cssText = "bottom: 24px; right: 24px; transform: scale(1);";
    }
}

function setBuddyMood(mood, text = "") {
    if(!buddyEmoji) return;
    buddyEmoji.className = 'md3-buddy-container';
    if (mood === 'happy') buddyEmoji.classList.add('anim-bounce');
    else if (mood === 'thinking') buddyEmoji.classList.add('anim-shake');
    
    if (text && buddyBubble) { 
        buddyBubble.innerText = text; 
        buddyBubble.classList.add('visible'); 
        clearTimeout(buddyTimeout); 
        buddyTimeout = setTimeout(() => { buddyBubble.classList.remove('visible'); }, 3000); 
    }
}

function pokeBuddy() { 
    playSound('click'); 
    setBuddyMood('happy', "¡Vamos!"); 
}


function toggleTheme() {
    darkMode = !darkMode;
    applyTheme();
}

function applyTheme() {
    const chk = document.getElementById('checkbox-theme');
    if (darkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('emq_theme', 'dark');
        if(chk) chk.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('emq_theme', 'light');
        if(chk) chk.checked = false;
    }
}

//pantallas
function showScreen(id) {
    document.querySelectorAll('.md3-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    if (id === 'screen-call') {
        document.body.classList.add('call-mode');
    } else {
        document.body.classList.remove('call-mode');
        if(isListening) toggleMic(); 
        if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    }

    // Lógica específica para la pantalla de Perfil
    if (id === 'screen-profile') {
        document.getElementById('profile-username-display').innerText = currentUser || 'Usuario';
        // Mostrar la foto actual
        const img = document.getElementById('profile-img-display');
        img.src = currentUserAvatar || 'https://via.placeholder.com/150?text=🦊';
    }
    
    updateBuddyPosition(id);
}

function goToHome() {
    playSound('click');
    if (currentUser) {
        showScreen('screen-welcome');
        setBuddyMood('happy', "¡Hola de nuevo!");
    } else {
        showScreen('screen-login');
    }
}

//usuarios
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    document.getElementById('auth-title').innerText = isRegisterMode ? "Crear Cuenta" : "Iniciar Sesión";
    document.getElementById('auth-btn-text').innerText = isRegisterMode ? "REGISTRARSE" : "INGRESAR";
    document.getElementById('auth-switch-text').innerText = isRegisterMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?";
    document.getElementById('auth-error').innerText = "";
}

async function handleAuth() {
    const userIn = document.getElementById('auth-user').value;
    const passIn = document.getElementById('auth-pass').value;
    const errorMsg = document.getElementById('auth-error');
    
    if (!userIn || !passIn) return errorMsg.innerText = "Completa los campos";
    
    errorMsg.innerText = "Conectando...";
    const endpoint = isRegisterMode ? '/api/register' : '/api/login';

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userIn, password: passIn })
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user.username;
            currentUserAvatar = data.user.avatar; // Guardar el avatar que viene de la DB
            localStorage.setItem('emq17_username', currentUser);
            
            if (!isRegisterMode) { 
                if(data.user.progress && Object.keys(data.user.progress).length > 0) userProgress = data.user.progress;
                if(data.user.trophies && data.user.trophies.length > 0) earnedTrophies = data.user.trophies;
            } else {
                userProgress = {}; earnedTrophies = [];
            }
            
            showScreen('screen-welcome');
            setBuddyMood('happy', `¡Hola ${currentUser}! 👋`); 
        } else {
            errorMsg.innerText = data.error;
            playSound('incorrect');
        }
    } catch (e) {
        errorMsg.innerText = "Error de conexión";
        console.error(e);
    }
}

async function loadData() {
    if(!currentUser) return;
    
}

async function saveData() {
    localStorage.setItem('emq17_progress', JSON.stringify(userProgress));
    localStorage.setItem('emq17_trophies', JSON.stringify(earnedTrophies));

    if(currentUser) {
        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser, progress: userProgress, trophies: earnedTrophies })
            });
            console.log("☁️ Guardado en Neon");
        } catch(e) { console.log("Offline"); }
    }
}

function logout() {
    if(confirm("¿Cerrar sesión?")) {
        currentUser = null;
        currentUserAvatar = null;
        localStorage.removeItem('emq17_username');
        userProgress = {}; 
        earnedTrophies = [];
        location.reload(); 
    }
}



//activa cuando el usuario selecciona un archivo
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Poner la imagen seleccionada en el elemento dentro del modal
        imageToCrop.src = e.target.result;
        
        // Mostrar el modal
        cropperModal.style.display = 'flex';

        // Destruir instancia previa si existe para evitar conflictos
        if (cropper) {
            cropper.destroy();
        }

        // Inicializar Cropper.js
        cropper = new Cropper(imageToCrop, {
            aspectRatio: 1, // Fuerza un recorte cuadrado/circular
            viewMode: 1,    // Restringe el cuadro de recorte dentro de la imagen
            dragMode: 'move',
            autoCropArea: 0.8,
            restore: false,
            guides: false,
            center: false,
            highlight: false,
            cropBoxMovable: false, // El usuario mueve la imagen, no el cuadro
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false,
        });
    };
    reader.readAsDataURL(file);
    // Resetear el input para que se pueda seleccionar la misma imagen otra vez si se cancela
    avatarInput.value = '';
}

// 2. Se activa al dar clic en "Cancelar" en el modal
function closeCropperModal() {
    cropperModal.style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

// 3. Se activa al dar clic en "Guardar" en el modal
async function saveCroppedImage() {
    if (!cropper) return;

    
    // Se redimensiona a 300x300 para no guardar imágenes gigantes
    const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    // Convertir el canvas a una cadena Base64 (imagen codificada)
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);

    // Actualizar la imagen en la pantalla de perfil
    document.getElementById('profile-img-display').src = base64Image;
    currentUserAvatar = base64Image; 
    
    closeCropperModal();
    setBuddyMood('thinking', "Guardando tu nueva foto...");

    // Enviar la imagen
    try {
        const response = await fetch('/api/update-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, avatar: base64Image })
        });

        if (response.ok) {
            setBuddyMood('happy', "¡Foto actualizada con éxito!");
            playSound('correct');
        } else {
            throw new Error('Error en el servidor');
        }
    } catch (err) {
        console.error("Error al subir avatar:", err);
        setBuddyMood('thinking', "Hubo un problema al guardar la foto.");
        playSound('incorrect');
        
    }
}


//preguntas
function showTopics() {
    playSound('click');
    const c = document.getElementById('topic-container'); 
    c.innerHTML = '';
    
    const globalDiv = document.createElement('div'); 
    globalDiv.className = 'md3-card-topic';
    globalDiv.innerHTML = `<div style="font-size:3rem; margin-bottom:12px;">🌍</div><span class="md3-label-large">Mix Global</span>`;
    globalDiv.onclick = () => selectTopic('global');
    c.appendChild(globalDiv);

    if(typeof topics !== 'undefined') {
        Object.values(topics).forEach(t => {
            const div = document.createElement('div'); 
            div.className = 'md3-card-topic';
            div.innerHTML = `<div style="font-size:3rem; margin-bottom:12px;">${t.icon}</div><span class="md3-label-large">${t.name}</span>`;
            div.onclick = () => selectTopic(t.id);
            c.appendChild(div);
        });
    }
    showScreen('screen-topics');
}

function selectTopic(id) {
    currentTopicId = id;
    if (id === 'global') { 
        currentSubtopicId = 'all'; 
        updateLevelsUI(); 
        showScreen('screen-levels'); 
    } else { 
        showFocus(); 
    }
}

function showFocus() {
    const t = topics[currentTopicId];
    document.getElementById('focus-title').innerText = t.name;
    const c = document.getElementById('subtopic-container'); 
    c.innerHTML = '';
    
    const all = document.createElement('div'); 
    all.className = 'md3-option-card';
    all.innerHTML = `<span>✨ Todo</span>`;
    all.onclick = () => { currentSubtopicId = 'all'; updateLevelsUI(); showScreen('screen-levels'); };
    c.appendChild(all);
    
    t.subtopics.forEach(sub => {
        const b = document.createElement('div'); 
        b.className = 'md3-option-card';
        b.innerHTML = `<span>${sub.name}</span>`;
        b.onclick = () => { currentSubtopicId = sub.id; updateLevelsUI(); showScreen('screen-levels'); };
        c.appendChild(b);
    });
    showScreen('screen-focus');
}

function updateLevelsUI() {
    const p = userProgress[currentTopicId] || {};
    const c = document.getElementById('level-container'); 
    c.innerHTML = '';
    
    const levels = [
        { id: 'easy', name: 'Principiante (5)', unlocked: true },
        { id: 'medium', name: 'Intermedio (10)', unlocked: p.medium },
        { id: 'hard', name: 'Difícil (20)', unlocked: p.hard }
    ];
    
    levels.forEach(lvl => {
        const btn = document.createElement('button');
        btn.className = `md3-btn-level ${lvl.unlocked ? '' : 'locked'}`;
        if(lvl.unlocked) {
            if(lvl.id === 'easy') btn.style.backgroundColor = 'var(--md-sys-color-primary-container)';
            if(lvl.id === 'medium') btn.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
            if(lvl.id === 'hard') btn.style.backgroundColor = 'var(--md-sys-color-tertiary-container)';
        }
        const icon = lvl.unlocked ? 'check_circle' : 'lock';
        btn.innerHTML = `<span class="md3-label-large">${lvl.name}</span><span class="material-symbols-rounded">${icon}</span>`;
        if (lvl.unlocked) btn.onclick = () => prepareQuiz(lvl.id);
        c.appendChild(btn);
    });
}

function backToFocus() { 
    if(currentTopicId==='global') showTopics(); 
    else showScreen('screen-focus'); 
}


async function prepareQuiz(lvl) {
    currentLevel = lvl;
    let topicName = currentTopicId;
    let subtopicName = "";

    if (typeof topics !== 'undefined' && topics[currentTopicId]) {
        topicName = topics[currentTopicId].name;
        if (currentSubtopicId && currentSubtopicId !== 'all') {
            const sub = topics[currentTopicId].subtopics.find(s => s.id === currentSubtopicId);
            if (sub) subtopicName = sub.name;
        }
    }

    const contextForAI = subtopicName ? `${topicName} (${subtopicName})` : topicName;
    document.getElementById('question-text').innerText = "🦊 Kiko está preparando tu reto...";
    showScreen('screen-quiz');
    
    try {
        const response = await fetch('/api/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: contextForAI, difficulty: lvl })
        });
        const questionsAI = await response.json();
        startQuizWithData(questionsAI && questionsAI.length > 0 ? questionsAI : getLocalQuestions(lvl));
    } catch (e) {
        startQuizWithData(getLocalQuestions(lvl));
    }
}

function getLocalQuestions(lvl) {
    if(typeof questionBank === 'undefined') return [];
    let qs = currentTopicId === 'global' ? questionBank : questionBank.filter(q => q.topicId === currentTopicId);
    if(currentSubtopicId !== 'all' && currentTopicId !== 'global') qs = qs.filter(q => q.subtopicId === currentSubtopicId);
    let qCount = lvl === 'easy' ? 5 : (lvl === 'medium' ? 10 : 20);
    return [...qs].sort(() => Math.random() - 0.5).slice(0, qCount);
}

function startQuizWithData(data) {
    currentQuestions = data;
    qIndex = 0; 
    score = 0;
    if(currentQuestions.length === 0) {
        alert("No hay preguntas disponibles.");
        goToHome();
        return;
    }
    loadQuestion();
}

function loadQuestion() {
    const q = currentQuestions[qIndex];
    const isEnglish = document.getElementById('lang-toggle')?.checked;
    const showHints = document.getElementById('hint-toggle')?.checked;

    document.getElementById('question-text').innerText = isEnglish ? (q.q_en || q.q_es) : q.q_es;
    const hintBox = document.getElementById('hint-box');
    document.getElementById('hint-text').innerText = isEnglish ? (q.hint_en || q.hint_es) : q.hint_es;
    hintBox.style.display = showHints ? "flex" : "none";

    document.getElementById('quiz-badge').innerText = currentTopicId.toUpperCase();
    document.getElementById('progress-bar').style.width = ((qIndex / currentQuestions.length) * 100) + "%";
    
    const area = document.getElementById('options-area'); 
    area.innerHTML = '';
    let ops = q.opts.map((txt, idx) => ({ txt, isCorrect: idx === q.ans })).sort(() => Math.random() - 0.5);

    ops.forEach(optObj => {
        const btn = document.createElement('button'); 
        btn.className = 'md3-option-card';
        btn.innerText = optObj.txt;
        btn.onclick = () => checkAnswer(btn, optObj.isCorrect, ops);
        area.appendChild(btn);
    });
}

function checkAnswer(btn, isCorrect, allOps) {
    const btns = document.querySelectorAll('.md3-option-card');
    btns.forEach(b => b.disabled = true);

    if(isCorrect) {
        btn.style.backgroundColor = "var(--md-sys-color-primary-container)";
        score++; 
        playSound('correct'); 
        setBuddyMood('happy', "¡Excelente!");
    } else {
        btn.style.backgroundColor = "rgba(186, 26, 26, 0.2)";
        playSound('incorrect'); 
        setBuddyMood('thinking', "¡Casi!");
        btns.forEach(b => {
             if(b.innerText === allOps.find(o => o.isCorrect).txt) b.style.border = "2px solid var(--md-sys-color-primary)";
        });
    }

    setTimeout(() => {
        qIndex++;
        if(qIndex < currentQuestions.length) loadQuestion(); 
        else finishQuiz();
    }, 1500);
}

function finishQuiz() {
    showScreen('screen-result');
    const pct = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('result-score').innerText = `${pct}%`;
    document.getElementById('result-msg').innerText = pct >= 70 ? "¡Misión cumplida!" : "¡Sigue intentando!";
    
    if(!userProgress[currentTopicId]) userProgress[currentTopicId] = {};
    if(currentLevel === 'easy' && pct >= 90) userProgress[currentTopicId].medium = true;
    if(currentLevel === 'medium' && pct >= 95) userProgress[currentTopicId].hard = true;
    
    
    saveData();
}

function retryLevel() { prepareQuiz(currentLevel); }
function quitQuiz() { showTopics(); }

//llamada
let recognitionCall;
let isListening = false;
const synthCall = window.speechSynthesis;

function initCallMode() {
    showScreen('screen-call');
    document.getElementById('call-status').innerText = "Toca el micro para hablar con Kiko";
    
    if (!recognitionCall && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionCall = new Speech();
        recognitionCall.lang = 'en-US'; 
        
        recognitionCall.onstart = () => {
            isListening = true;
            document.getElementById('call-status').innerText = "Kiko te escucha...";
            document.getElementById('mic-btn')?.classList.add('md3-pulse-active');
        };

        recognitionCall.onend = () => {
            isListening = false;
            document.getElementById('mic-btn')?.classList.remove('md3-pulse-active');
        };

        recognitionCall.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-text').innerText = `Tú: "${transcript}"`;
            await sendToGemini(transcript);
        };
    }
}

function toggleMic() {
    if (!recognitionCall) return;
    isListening ? recognitionCall.stop() : recognitionCall.start();
}

function endCall() {
    if (synthCall && synthCall.speaking) synthCall.cancel(); 
    if (recognitionCall && isListening) recognitionCall.stop();
    goToHome();
}

async function sendToGemini(text) {
    try {
        const response = await fetch('/api/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        if (data.reply) {
            document.getElementById('chat-text').innerText = `Kiko: "${data.reply}"`;
            speakResponse(data.reply);
        }
    } catch (e) { document.getElementById('chat-text').innerText = "Error de conexión."; }
}

function speakResponse(text) {
    if (synthCall.speaking) synthCall.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synthCall.speak(utterance);
}

//INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    console.log("🎮 Aprende con Kiko: Cargando...");

    const savedUser = localStorage.getItem('emq17_username');
    
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.classList.add('splash-hidden');

        if (savedUser) {
            currentUser = savedUser;
            loadData(); 
            showScreen('screen-welcome'); 
            setBuddyMood('happy', `¡Hola de nuevo, ${currentUser}! 👋`);
        } else {
            showScreen('screen-login');
            setBuddyMood('happy', "¡Bienvenido! Inicia sesión.");
        }
    }, 2500);
});