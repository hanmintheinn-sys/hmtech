const canvas = document.getElementById('scopeCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('canvasContainer');

let width, height;
let timePhase = 0;

// ★ Memory Fix: Resize တိုင်း Array အသစ်မဆောက်စေရန် Fixed Size ပေးထားသည်
const MAX_POINTS = 2048; 
window.ch1Data = new Float32Array(MAX_POINTS);
window.ch2Data = new Float32Array(MAX_POINTS);

function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawGrid() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = 'rgba(157, 255, 15, 0.15)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
        let x = (width / 10) * i;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
        let y = (height / 8) * i;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(157, 255, 15, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); ctx.stroke();
    ctx.setLineDash([]);
}

function drawWaveforms() {
    let state = window.scopeState;
    let tScale = window.tScaleSteps[state.timebaseIdx];
    let ch1VScale = window.vScaleSteps[state.ch1.scaleIdx];
    let ch2VScale = window.vScaleSteps[state.ch2.scaleIdx];

    // Responsive length
    let pointsToDraw = Math.min(width, MAX_POINTS);

    if (!state.isConnected) {
        for (let i = 0; i < pointsToDraw; i++) {
            let t = (i * (0.5 / tScale)) + timePhase;
            window.ch1Data[i] = state.ch1.coupling === 'GND' ? 0 : Math.sin(t) * 10;
            window.ch2Data[i] = state.ch2.coupling === 'GND' ? 0 : Math.cos(t * 1.5) * 8;
        }
    }

    if (state.mode === 'YT') {
        ctx.lineWidth = 1.5;
        
        ctx.strokeStyle = '#ffcc00';
        ctx.beginPath();
        for (let i = 0; i < pointsToDraw; i++) {
            let x = (i / pointsToDraw) * width;
            let pixelValue = (window.ch1Data[i] / ch1VScale) * (height/8);
            let y = (height / 2) - pixelValue - 40;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#00e5ff';
        ctx.beginPath();
        for (let i = 0; i < pointsToDraw; i++) {
            let x = (i / pointsToDraw) * width;
            let pixelValue = (window.ch2Data[i] / ch2VScale) * (height/8);
            let y = (height / 2) - pixelValue + 40;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

    } else if (state.mode === 'XY') {
        ctx.strokeStyle = '#9dff0f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < pointsToDraw; i++) {
            let pX = (window.ch1Data[i] / ch1VScale) * (width/10);
            let pY = (window.ch2Data[i] / ch2VScale) * (height/8);
            let cx = (width / 2) + pX;
            let cy = (height / 2) - pY;
            i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    }
}

function render() {
    if(window.scopeState.isRunning) {
        drawGrid();
        drawWaveforms();
        timePhase += 0.1; 
    }
    requestAnimationFrame(render);
}
render();
