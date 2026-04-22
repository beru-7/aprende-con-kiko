
let userProgress = JSON.parse(localStorage.getItem('emq17_progress')) || { grammar:{}, verbs:{}, logic:{}, self:{}, vocabulary:{}, structure:{}, global:{} };
let earnedTrophies = JSON.parse(localStorage.getItem('emq17_trophies')) || [];
let currentUser = null;
let currentUserAvatar = null; // URL o Base64 del avatar del usuario

/*
  Variables clave:
  - userProgress: progreso por tema guardado localmente o desde servidor.
  - earnedTrophies: lista de trofeos desbloqueados por el usuario.
  - currentUser: nombre de usuario que ha iniciado sesión.
  - currentUserAvatar: imagen de perfil del usuario para mostrar en welcome/perfil.
  - currentTopicId / currentSubtopicId: tema y subtema seleccionados.
  - currentLevel: nivel de dificultad seleccionado (easy/medium/hard).
  - currentQuestions: preguntas cargadas para el quiz actual.
  - qIndex: índice de la pregunta actual dentro del quiz.
  - score: contador de respuestas correctas.
*/

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
    buddyContainer.className = 'md3-fab-buddy pos-welcome';
    buddyContainer.style.cssText = "top: 15%; left: 10%; transform: scale(1.2);";
}

function setBuddyMood(mood, text = "") {
    if(!buddyEmoji) return;
    buddyEmoji.className = 'md3-buddy-container';
    buddyEmoji.classList.remove('anim-bounce', 'anim-shake');

    if (mood === 'happy') buddyEmoji.classList.add('anim-bounce');
    else if (mood === 'thinking') buddyEmoji.classList.add('anim-shake');
    else if (mood === 'celebrate') {
        buddyEmoji.classList.add('anim-bounce');
        text = text || "¡Increíble logro!";
    }

    if (text && buddyBubble) {
        buddyBubble.innerText = text;
        buddyBubble.classList.add('visible');
        clearTimeout(buddyTimeout);
        buddyTimeout = setTimeout(() => { buddyBubble.classList.remove('visible'); }, 4000);
    }
}

const buddySupportMessages = [
    "¡Tú puedes con esto!",
    "Sigue así, vamos paso a paso.",
    "Estoy muy orgulloso de ti.",
    "Cada error es un paso hacia adelante.",
    "¡Eres un campeón del inglés!",
    "¡Vamos por ese próximo nivel!",
    "¡No te rindas, lo estás haciendo genial!",
    "¡Cada pregunta te hace más fuerte!",
    "¡Estoy aquí para ayudarte siempre!",
    "¡Tu esfuerzo es lo que más importa!",
    "¡Recuerda que la práctica hace al maestro!",
    "Juega minecraft, aprende inglés. ¡Es la fórmula secreta! 😉"   
];

function pokeBuddy() {
    playSound('click');
    const message = buddySupportMessages[Math.floor(Math.random() * buddySupportMessages.length)];
    setBuddyMood('happy', message);
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
    renderUserAvatar();
    
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

function renderUserAvatar() {
    const welcomeImg = document.getElementById('welcome-avatar');
    const profileImg = document.getElementById('profile-img-display');
    const src = currentUserAvatar || 'https://via.placeholder.com/150?text=🦊';
    if (welcomeImg) welcomeImg.src = src;
    if (profileImg) profileImg.src = src;
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
            currentUserAvatar = data.user.avatar || localStorage.getItem('emq17_avatar') || null;
            localStorage.setItem('emq17_username', currentUser);
            localStorage.setItem('emq17_avatar', currentUserAvatar || '');
            
            if (!isRegisterMode) { 
                userProgress = data.user.progress || {};
                earnedTrophies = data.user.trophies || [];
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

async function fetchUserData(username) {
    try {
        const response = await fetch(`/api/user/${encodeURIComponent(username)}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.user : null;
    } catch (e) {
        console.warn('No se pudo cargar datos del servidor:', e);
        return null;
    }
}

async function loadData() {
    if (!currentUser) return;

    const serverData = await fetchUserData(currentUser);
    if (serverData) {
        userProgress = serverData.progress || userProgress;
        earnedTrophies = serverData.trophies || earnedTrophies;
        currentUserAvatar = serverData.avatar || currentUserAvatar;
        localStorage.setItem('emq17_avatar', currentUserAvatar || '');
    } else {
        userProgress = JSON.parse(localStorage.getItem('emq17_progress')) || userProgress;
        earnedTrophies = JSON.parse(localStorage.getItem('emq17_trophies')) || earnedTrophies;
        currentUserAvatar = localStorage.getItem('emq17_avatar') || currentUserAvatar;
    }

    renderTrophies();
}

async function saveData() {
    localStorage.setItem('emq17_progress', JSON.stringify(userProgress));
    localStorage.setItem('emq17_trophies', JSON.stringify(earnedTrophies));
    localStorage.setItem('emq17_avatar', currentUserAvatar || '');

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
        localStorage.removeItem('emq17_avatar');
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

    localStorage.setItem('emq17_avatar', base64Image);

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
            playSound( 'incorrect');
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

    if (currentTopicId === 'global') {
        topicName = "Mix de temas de inglés (Gramática, Vocabulario, Verbos, Lógica). Mínimo 2 preguntas de cada uno.";
    } else if (typeof topics !== 'undefined' && topics[currentTopicId]) {
        topicName = topics[currentTopicId].name;
        if (currentSubtopicId && currentSubtopicId !== 'all') {
            const sub = topics[currentTopicId].subtopics.find(s => s.id === currentSubtopicId);
            if (sub) subtopicName = sub.name;
        }
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
        
        
        if (questionsAI && questionsAI.length > 0) {
            startQuizWithData(questionsAI);
        } else {
            
            alert("Kiko no pudo pensar en preguntas ahorita. ¡Intenta de nuevo!");
            showScreen('screen-topics'); 
        }
    } catch (e) {
        // Si hay un error de conexión o el servidor falla
        console.error("Error al obtener quiz:", e);
        alert("¡Oh no! ¡Parece que Kiko no se puede concentrar!. Intenta otra vez.");
        showScreen('screen-topics'); 
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
    const progressPercent = Math.round((qIndex / currentQuestions.length) * 100);
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;
    const progressText = document.getElementById('quiz-progress-text');
    if (progressText) progressText.innerText = `Pregunta ${qIndex + 1} de ${currentQuestions.length} (${progressPercent}%)`;
    
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
        btn.style.backgroundColor = "#b8f5c9"; // verde claro indicando ok
        btn.style.color = "#005a25";
        score++;
        playSound('correct');
        setBuddyMood('celebrate', "¡Excelente!");
        buddyEmoji.classList.add('anim-celebrate');
        setTimeout(() => buddyEmoji.classList.remove('anim-celebrate'), 600);
    } else {
        btn.style.backgroundColor = "rgba(223, 20, 20, 0.54)";
        playSound('incorrect');
        setBuddyMood('thinking', "¡Casi!");

        // Destacar la respuesta correcta con un borde
        btns.forEach(b => {
            if(b.innerText === allOps.find(o => o.isCorrect).txt) {
                b.style.border = "2px solid var(--md-sys-color-primary)";
            }
        });

        // Vibrar emojis en las tarjetas
        const emojiNodes = document.querySelectorAll('.emoji-icon');
        emojiNodes.forEach(e => e.classList.add('anim-vibrate'));
        setTimeout(() => {
            emojiNodes.forEach(e => e.classList.remove('anim-vibrate'));
        }, 600);
    }

    setTimeout(() => {
        qIndex++;
        if(qIndex < currentQuestions.length) loadQuestion(); 
        else finishQuiz();
    }, 1500);
}

function renderTrophies() {
    const container = document.getElementById('trophy-container');
    const count = document.getElementById('trophy-count');
    if (!container || !count) return;

    container.innerHTML = '';
    earnedTrophies.forEach(trophy => {
        const card = document.createElement('div');
        card.className = 'md3-card-topic';
        card.style.textAlign = 'center';
        card.innerHTML = `
            <div style="font-size:10.2rem; margin-bottom:6px;">${trophy.emoji}</div>
            <strong>${trophy.title}</strong>
            <p style="margin-top:6px; font-size:0.85rem; color:var(--md-sys-color-on-surface-variant);">${trophy.description || ''}</p>
        `;
        container.appendChild(card);
    });
    count.innerText = earnedTrophies.length;
}

function addTrophy(id, emoji, title, description) {
    if (earnedTrophies.some(t => t.id === id)) return false;
    earnedTrophies.push({ id, emoji, title, description });
    showUnlockNotification(`${emoji} ${title}`);
    renderTrophies();
    saveData(); // Guardar progresos y trofeos inmediatamente
    return true;
}

function showUnlockNotification(text) {
    const unlockEl = document.getElementById('unlock-notification');
    if (!unlockEl) return;
    unlockEl.textContent = text;
    unlockEl.style.display = 'flex';
    setTimeout(() => { unlockEl.style.display = 'none'; }, 2500);
}

function checkAndAwardTrophies(pct) {
    if (!userProgress[currentTopicId]) userProgress[currentTopicId] = {};

    const topicName = (typeof topics !== 'undefined' && topics[currentTopicId]) ? topics[currentTopicId].name : currentTopicId;

    // Marca progreso de niveles completos y desbloqueos intermedios
    if (currentLevel === 'easy') {
        if (pct >= 90) userProgress[currentTopicId].medium = true;
        if (pct >= 100) userProgress[currentTopicId].easy = true;
    }
    if (currentLevel === 'medium') {
        if (pct >= 95) userProgress[currentTopicId].hard = true;
        if (pct >= 100) userProgress[currentTopicId].medium = true;
    }
    if (currentLevel === 'hard' && pct >= 100) {
        userProgress[currentTopicId].hard = true;
    }

    // Trofeos por nivel
    if (currentLevel === 'easy' && pct >= 90) {
        addTrophy(`trophy_${currentTopicId}_easy`, '🥉', `Aprendiz de ${topicName}`, 'Lograste completar el nivel principiante con 90% o más. ¡Vamos por más!');
    }
    if (currentLevel === 'medium' && pct >= 95) {
        addTrophy(`trophy_${currentTopicId}_medium`, '🥈', `Intermedio de ${topicName}`, 'Lograste completar el nivel intermedio con 95% o más.');
    }
    if (currentLevel === 'hard' && pct >= 100) {
        addTrophy(`trophy_${currentTopicId}_hard`, '🥇', `Avanzado de ${topicName}`, 'Completaste el ivel difícil con 100%.');
    }

    const progress = userProgress[currentTopicId];
    if (progress.easy && progress.medium && progress.hard) {
        if (addTrophy(`trophy_${currentTopicId}`, '🏆', `Maestro ${topicName}`, 'Completaste 100% en fácil, medio y difícil.')) {
            setBuddyMood('celebrate', `¡Increíble! Has ganado el trofeo de ${topicName}.`);
            playSound('correct');
        }
    }

    if (pct >= 100) {
        setBuddyMood('celebrate', "¡100% conseguidos! Eres una leyenda 💪");
        playSound('correct');
    }

    renderTrophies();
    saveData();
}

function finishQuiz() {
    showScreen('screen-result');
    const pct = Math.round((score / currentQuestions.length) * 100);
    document.getElementById('result-score').innerText = `${pct}%`;
    document.getElementById('result-msg').innerText = pct >= 70 ? "¡Misión cumplida!" : "¡Sigue intentando!";

    if(!userProgress[currentTopicId]) userProgress[currentTopicId] = {};
    if(currentLevel === 'easy' && pct >= 90) userProgress[currentTopicId].medium = true;
    if(currentLevel === 'medium' && pct >= 95) userProgress[currentTopicId].hard = true;

    checkAndAwardTrophies(pct);

    // saveData y renderTrophies se ejecutan dentro de checkAndAwardTrophies
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
document.addEventListener('DOMContentLoaded', async () => {
    document.body.classList.add('splash-visible');
    applyTheme();
    console.log("🎮 Aprende con Kiko: Cargando...");

    const savedUser = localStorage.getItem('emq17_username');
    const savedAvatar = localStorage.getItem('emq17_avatar');
    if (savedAvatar) currentUserAvatar = savedAvatar;
    
    setTimeout(async () => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('splash-hidden');
        document.body.classList.remove('splash-visible');

        if (savedUser) {
            currentUser = savedUser;
            await loadData(); 
            renderTrophies();
            showScreen('screen-welcome'); 
            setBuddyMood('happy', `¡Hola de nuevo, ${currentUser}! 👋`);
        } else {
            showScreen('screen-login');
            setBuddyMood('happy', "¡Bienvenido! Inicia sesión.");
        }

    }, darkMode ? 2500 : 800);
});