// --- Global Scale Steps ---
window.vScaleSteps = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];
window.tScaleSteps = [1, 2, 5, 10, 20, 50, 100]; // ms

// --- Global State ---
window.scopeState = {
    isRunning: true,
    isConnected: false,
    mode: 'YT',
    ch1: { scaleIdx: 5, coupling: 'AC', active: true }, 
    ch2: { scaleIdx: 4, coupling: 'DC', active: true }, 
    timebaseIdx: 3, 
    trigger: { src: 'CH1', mode: 'AUTO' }
};

// --- UI Updates ---
function updateUIButtons(groupId, activeText) {
    const btns = document.querySelectorAll(`#${groupId} .seg-btn`);
    btns.forEach(btn => {
        if(btn.innerText === activeText) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

window.adjustScale = function(ch, dir) {
    let idx = window.scopeState[ch].scaleIdx + dir;
    if(idx >= 0 && idx < window.vScaleSteps.length) {
        window.scopeState[ch].scaleIdx = idx;
        document.getElementById(`val-${ch}-scale`).innerText = window.vScaleSteps[idx].toFixed(1) + 'V';
    }
};

window.adjustTimebase = function(dir) {
    let idx = window.scopeState.timebaseIdx + dir;
    if(idx >= 0 && idx < window.tScaleSteps.length) {
        window.scopeState.timebaseIdx = idx;
        document.getElementById('val-timebase').innerText = window.tScaleSteps[idx] + 'ms';
    }
};

window.setCoupling = function(ch, mode) {
    window.scopeState[ch].coupling = mode;
    updateUIButtons(`seg-${ch}-mode`, mode);
};

window.setMode = function(mode) {
    window.scopeState.mode = mode;
    updateUIButtons('seg-hor-mode', mode);
};

window.setTriggerSrc = function(src) {
    window.scopeState.trigger.src = src;
    updateUIButtons('seg-trg-src', src);
};

window.setTriggerMode = function(mode) {
    window.scopeState.trigger.mode = mode;
    updateUIButtons('seg-trg-mode', mode);
};

window.toggleRunStop = function() {
    window.scopeState.isRunning = !window.scopeState.isRunning;
    const badge = document.getElementById('runState');
    badge.innerText = window.scopeState.isRunning ? 'RUN' : 'STOP';
    badge.classList.toggle('stop', !window.scopeState.isRunning);
};

// ★ PWA Service Worker Registration Fix
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered successfully:', reg.scope))
            .catch(err => console.log('SW Registration Failed:', err));
    });
}
