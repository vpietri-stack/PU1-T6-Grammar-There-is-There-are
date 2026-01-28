// ==========================================
// TEACHING GAME (HTML/CSS based)
// ==========================================

// Game State
let currentRound = 0;
let gameActive = true;
let totalStarScore = 0;
let hasCheckedThisRound = false;
let currentRoundExplanation = "";
const MAX_ROUNDS = 5;

// --- Data & Helpers ---
const objects = [
    'bear', 'lorry', 'snake', 'bus', 'car', 'bus stop', 'flower', 'park', 'tiger', 'crocodile',
    'motorbike', 'shop', 'zebra', 'lizard', 'giraffe', 'elephant', 'hippo', 'polar bear', 'zoo', 'train',
    'tree', 'garden'
];

function getPlural(word) {
    if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
    if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) return word + 'es';
    return word + 's';
}

function getArticle(word) {
    return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ==========================================
// INITIALIZATION
// ==========================================
function initGame() {
    currentRound = 1;
    totalStarScore = 0;
    updateScoreUI();
    loadRound();
}

function updateScoreUI() {
    document.getElementById('star-score').innerText = totalStarScore;
    document.getElementById('round-counter').innerText = currentRound;
}

function nextRound() {
    if (currentRound >= MAX_ROUNDS) {
        if (typeof launchPhaserArcade === 'function') {
            launchPhaserArcade();
        } else {
            console.error("launchPhaserArcade function not found!");
            alert("Great job! You finished the grammar rounds.");
        }
        return;
    }

    document.getElementById('feedback-area').classList.remove('flex');
    document.getElementById('feedback-area').classList.add('hidden');

    const dock = document.getElementById('options-dock');
    dock.classList.remove('hidden');
    dock.style.opacity = '1';

    currentRound++;
    updateScoreUI();
    loadRound();
}

function createDraggable(text, id) {
    const div = document.createElement('div');
    div.className = "draggable-item px-5 py-2 rounded-xl font-bold text-lg select-none touch-none";
    div.textContent = text;
    div.dataset.value = text;
    div.id = `drag-${id}`;
    div.addEventListener('pointerdown', handlePointerDown);
    return div;
}

// ==========================================
// CORE TEACHING GAME LOGIC
// ==========================================
function loadRound() {
    const sentencesArea = document.getElementById('sentences-area');
    const optionsDock = document.getElementById('options-dock');

    optionsDock.classList.remove('hidden');
    optionsDock.style.opacity = '1';

    sentencesArea.innerHTML = '';
    optionsDock.innerHTML = '';
    gameActive = true;
    hasCheckedThisRound = false;
    currentRoundExplanation = "";

    document.getElementById('check-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');

    // --- Generate Dynamic Prompt (Ported from PU1 T6) ---
    // 1. Pick 2 random distinct objects
    let availObjs = [...objects];
    shuffle(availObjs);
    const obj1 = availObjs[0];
    const obj2 = availObjs[1];

    // 2. Determine Pattern for Top Sentence
    const pattern = Math.floor(Math.random() * 4);

    let topSentenceHTML = "";
    let obj1State = {}; // { exists: bool, plural: bool }
    let obj2State = {};

    const dz1 = `<span id="zone-0" class="drop-zone" data-expected=""></span>`;
    const dz2 = `<span id="zone-1" class="drop-zone" data-expected=""></span>`;

    // Data for generation
    let answers = []; // Correct answers for the 4 zones
    let explanationParts = [];

    if (pattern === 0) {
        // There's a [obj1], but there aren't any [obj2]s.
        const art1 = getArticle(obj1);
        topSentenceHTML = `${dz1} ${art1} <span class="font-bold text-indigo-700">${obj1}</span>, but ${dz2} any <span class="font-bold text-indigo-700">${getPlural(obj2)}</span>.`;
        answers[0] = "There's";
        answers[1] = "there aren't";
        obj1State = { exists: true, plural: false, name: obj1 };
        obj2State = { exists: false, plural: true, name: obj2 };
        explanationParts.push(`1. <b>${obj1}</b> 是单数，所以用 <b>There's</b>。`);
        explanationParts.push(`2. <b>${getPlural(obj2)}</b> 是复数否定句，所以用 <b>there aren't</b>。`);
    } else if (pattern === 1) {
        // There are [obj1]s, but there isn't a [obj2].
        const art2 = getArticle(obj2);
        topSentenceHTML = `${dz1} <span class="font-bold text-indigo-700">${getPlural(obj1)}</span>, but ${dz2} ${art2} <span class="font-bold text-indigo-700">${obj2}</span>.`;
        answers[0] = "There are";
        answers[1] = "there isn't";
        obj1State = { exists: true, plural: true, name: obj1 };
        obj2State = { exists: false, plural: false, name: obj2 };
        explanationParts.push(`1. <b>${getPlural(obj1)}</b> 是复数，所以用 <b>There are</b>。`);
        explanationParts.push(`2. <b>${obj2}</b> 是单数否定句，所以用 <b>there isn't</b>。`);
    } else if (pattern === 2) {
        // There aren't any [obj1]s, but there's a [obj2].
        const art2 = getArticle(obj2);
        topSentenceHTML = `${dz1} any <span class="font-bold text-indigo-700">${getPlural(obj1)}</span>, but ${dz2} ${art2} <span class="font-bold text-indigo-700">${obj2}</span>.`;
        answers[0] = "There aren't";
        answers[1] = "there's";
        obj1State = { exists: false, plural: true, name: obj1 };
        obj2State = { exists: true, plural: false, name: obj2 };
        explanationParts.push(`1. <b>${getPlural(obj1)}</b> 是复数否定句，所以用 <b>There aren't</b>。`);
        explanationParts.push(`2. <b>${obj2}</b> 是单数，所以用 <b>there's</b>。`);
    } else { // pattern === 3
        // There isn't a [obj1], but there are [obj2]s.
        const art1 = getArticle(obj1);
        topSentenceHTML = `${dz1} ${art1} <span class="font-bold text-indigo-700">${obj1}</span>, but ${dz2} <span class="font-bold text-indigo-700">${getPlural(obj2)}</span>.`;
        answers[0] = "There isn't";
        answers[1] = "there are";
        obj1State = { exists: false, plural: false, name: obj1 };
        obj2State = { exists: true, plural: true, name: obj2 };
        explanationParts.push(`1. <b>${obj1}</b> 是单数否定句，所以用 <b>There isn't</b>。`);
        explanationParts.push(`2. <b>${getPlural(obj2)}</b> 是复数，所以用 <b>there are</b>。`);
    }

    // 3. Determine Bottom Sentence (Question about one of the objects)
    const askAboutObj1 = Math.random() > 0.5;
    const targetObj = askAboutObj1 ? obj1State : obj2State;

    let bottomSentenceHTML = "";
    const dz3 = `<span id="zone-2" class="drop-zone" data-expected=""></span>`;
    const dz4 = `<span id="zone-3" class="drop-zone" data-expected=""></span>`;

    if (targetObj.plural) {
        // Plural Question: Are there any ...?
        bottomSentenceHTML = `${dz3} any <span class="font-bold text-indigo-700">${getPlural(targetObj.name)}</span>? `;
        answers[2] = "Are there";
        explanationParts.push(`3. <b>${getPlural(targetObj.name)}</b> 是复数，疑问句用 <b>Are there</b>。`);
        if (targetObj.exists) {
            bottomSentenceHTML += `Yes, ${dz4}.`;
            answers[3] = "there are";
            explanationParts.push(`4. 复数肯定简答用 <b>there are</b>。`);
        } else {
            bottomSentenceHTML += `No, ${dz4}.`;
            answers[3] = "there aren't";
            explanationParts.push(`4. 复数否定简答用 <b>there aren't</b>。`);
        }
    } else {
        // Singular Question: Is there a ...?
        const art = getArticle(targetObj.name);
        bottomSentenceHTML = `${dz3} ${art} <span class="font-bold text-indigo-700">${targetObj.name}</span>? `;
        answers[2] = "Is there";
        explanationParts.push(`3. <b>${targetObj.name}</b> 是单数，疑问句用 <b>Is there</b>。`);
        if (targetObj.exists) {
            bottomSentenceHTML += `Yes, ${dz4}.`;
            answers[3] = "there is"; // No contraction allowed in short answer positive
            explanationParts.push(`4. 单数肯定简答用 <b>there is</b> (不可缩写)。`);
        } else {
            bottomSentenceHTML += `No, ${dz4}.`;
            answers[3] = "there isn't";
            explanationParts.push(`4. 单数否定简答用 <b>there isn't</b>。`);
        }
    }

    currentRoundExplanation = explanationParts.map(e => `<div class="mb-1 text-sm text-slate-700">${e}</div>`).join('');

    // Render Sentences
    const p1 = document.createElement('div');
    p1.className = "sentence-line";
    p1.innerHTML = topSentenceHTML;
    sentencesArea.appendChild(p1);

    const p2 = document.createElement('div');
    p2.className = "sentence-line mt-4";
    p2.innerHTML = bottomSentenceHTML;
    sentencesArea.appendChild(p2);

    // Assign expected values to zones (after small delay to ensure DOM exists)
    setTimeout(() => {
        const z0 = document.getElementById('zone-0');
        const z1 = document.getElementById('zone-1');
        const z2 = document.getElementById('zone-2');
        const z3 = document.getElementById('zone-3');
        if (z0) z0.dataset.expected = answers[0];
        if (z1) z1.dataset.expected = answers[1];
        if (z2) z2.dataset.expected = answers[2];
        if (z3) z3.dataset.expected = answers[3];
    }, 0);

    // 4. Generate Draggables
    let dockItems = [...answers];
    shuffle(dockItems);
    dockItems.forEach((text, i) => {
        optionsDock.appendChild(createDraggable(text, i));
    });
}

function checkButtonVisibility() {
    const zones = document.querySelectorAll('.drop-zone');
    let filledCount = 0;
    zones.forEach(zone => {
        if (zone.dataset.currentValue) filledCount++;
    });

    const checkBtn = document.getElementById('check-btn');
    if (filledCount === zones.length && gameActive) {
        checkBtn.classList.remove('hidden');
    } else {
        checkBtn.classList.add('hidden');
    }
}

function checkAnswers() {
    if (!gameActive) return;

    const zones = document.querySelectorAll('.drop-zone');
    let correctCount = 0;

    zones.forEach(zone => {
        zone.classList.remove('correct', 'incorrect');
        const val = zone.dataset.currentValue;
        const expected = zone.dataset.expected;

        if (val === expected) {
            zone.classList.add('correct');
            correctCount++;
        } else {
            zone.classList.add('incorrect');
        }
    });

    if (!hasCheckedThisRound) {
        if (correctCount === zones.length) {
            totalStarScore += 1;
            const scoreEl = document.getElementById('star-score');
            scoreEl.style.transform = "scale(1.5)";
            setTimeout(() => scoreEl.style.transform = "scale(1)", 200);
        }
        hasCheckedThisRound = true;
        updateScoreUI();
    }

    const feedbackArea = document.getElementById('feedback-area');
    const feedbackContent = document.getElementById('feedback-content');
    const nextBtn = document.getElementById('next-btn');
    const checkBtn = document.getElementById('check-btn');
    const optionsDock = document.getElementById('options-dock');

    feedbackArea.classList.remove('hidden');
    feedbackArea.classList.add('flex');

    if (correctCount === zones.length) {
        gameActive = false;
        feedbackContent.innerHTML = `<div class="text-green-600 font-bold text-2xl mb-2">Excellent! 🎉</div>
        <div class="mt-2 text-left bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            ${currentRoundExplanation}
        </div>`;
        nextBtn.classList.remove('hidden');
        checkBtn.classList.add('hidden');
        optionsDock.classList.add('hidden');
    } else {
        feedbackContent.innerHTML = `<div class="text-orange-500 font-bold text-2xl mb-1">Not quite! 🧐</div>
        <div class="text-slate-600 text-lg">Watch for <b>'s</b> vs <b>is</b>.<br>Tap red boxes to remove.</div>`;
        nextBtn.classList.add('hidden');
        optionsDock.classList.remove('hidden');
    }
}

// ==========================================
// DRAG LOGIC
// ==========================================
let activeDrag = null;
const DRAG_THRESHOLD = 5;

function handlePointerDown(e) {
    if (!gameActive) return;

    const item = e.target.closest('.draggable-item');
    if (!item) return;

    e.preventDefault();

    const parentZone = item.closest('.drop-zone');

    if (parentZone) {
        parentZone.dataset.currentValue = '';
        parentZone.classList.remove('filled', 'correct', 'incorrect');
        returnToDock(item);

        document.getElementById('feedback-area').classList.add('hidden');
        document.getElementById('feedback-area').classList.remove('flex');
        checkButtonVisibility();
        return;
    }

    const rect = item.getBoundingClientRect();

    activeDrag = {
        original: item,
        clone: item.cloneNode(true),
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        startX: e.clientX,
        startY: e.clientY,
        hasMoved: false
    };

    activeDrag.clone.classList.add('drag-clone');
    activeDrag.clone.removeAttribute('id');
    moveClone(e.clientX, e.clientY);
    document.body.appendChild(activeDrag.clone);

    activeDrag.original.style.opacity = '0';
    activeDrag.original.style.pointerEvents = 'none';

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
}

function handlePointerMove(e) {
    if (!activeDrag) return;
    e.preventDefault();

    const dist = Math.hypot(e.clientX - activeDrag.startX, e.clientY - activeDrag.startY);
    if (dist > DRAG_THRESHOLD) {
        activeDrag.hasMoved = true;
    }

    moveClone(e.clientX, e.clientY);

    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    const dropZone = elementBelow ? elementBelow.closest('.drop-zone') : null;

    document.querySelectorAll('.drop-zone').forEach(dz => dz.classList.remove('highlight'));
    if (dropZone && !dropZone.dataset.currentValue) {
        dropZone.classList.add('highlight');
    }
}

function handlePointerUp(e) {
    if (!activeDrag) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    activeDrag.clone.remove();

    const elementBelow = document.elementFromPoint(clientX, clientY);
    const dropZone = elementBelow ? elementBelow.closest('.drop-zone') : null;

    if (!activeDrag.hasMoved) {
        resetItemStyles(activeDrag.original);
    } else {
        if (dropZone && !dropZone.dataset.currentValue) {
            dropItemIntoZone(activeDrag.original, dropZone);
        } else {
            returnToDock(activeDrag.original);
        }
    }

    document.querySelectorAll('.drop-zone').forEach(dz => dz.classList.remove('highlight'));
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    activeDrag = null;
}

function moveClone(x, y) {
    activeDrag.clone.style.left = x + 'px';
    activeDrag.clone.style.top = y + 'px';
}

function resetItemStyles(item) {
    item.removeAttribute('style');
    item.classList.remove('px-5', 'py-2');
    item.classList.add('px-5', 'py-2');
}

function dropItemIntoZone(item, zone) {
    zone.appendChild(item);
    resetItemStyles(item);
    zone.dataset.currentValue = item.dataset.value;
    zone.classList.add('filled');
    checkButtonVisibility();
}

function returnToDock(item) {
    document.getElementById('options-dock').appendChild(item);
    resetItemStyles(item);
    checkButtonVisibility();
}

// Start the game when page loads
window.onload = initGame;
