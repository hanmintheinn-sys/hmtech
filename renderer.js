const canvas = document.getElementById('scopeCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const container = document.getElementById('canvasContainer');

let width, height;
let timePhase = 0;

// WebSocket မှ Data လှမ်းထည့်နိုင်ရန် Global Array များအဖြစ် ကြေညာခြင်း
window.ch1Data = null;
window.ch2Data = null;

function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Array များကို Browser လေးမသွားစေရန် Resize လုပ်ချိန်တွင်သာ တစ်ခါတည်း ဆောက်ပါ (Memory Leak Fixed)
    window.ch1Data = new Float32Array(width);
    window.ch2Data = new Float32Array(width);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call

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

    // Center Crosshairs
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

    // ★ ESP32 နှင့် မချိတ်ရသေးချိန်တွင်သာ လှိုင်းအတု (Dummy) ပြမည်
    if (!state.isConnected) {
        for (let i = 0; i < width; i++) {
            let t = (i * (0.5 / tScale)) + timePhase;
            window.ch1Data[i] = state.ch1.coupling === 'GND' ? 0 : Math.sin(t) * 10;
            window.ch2Data[i] = state.ch2.coupling === 'GND' ? 0 : Math.cos(t * 1.5) * 8;
        }
    }

    if (state.mode === 'YT') {
        ctx.lineWidth = 1.5;
        
        // CH1
        ctx.strokeStyle = '#ffcc00';
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            let pixelValue = (window.ch1Data[x] / ch1VScale) * (height/8);
            let y = (height / 2) - pixelValue - 40; // Offset up
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

        // CH2
        ctx.strokeStyle = '#00e5ff';
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            let pixelValue = (window.ch2Data[x] / ch2VScale) * (height/8);
            let y = (height / 2) - pixelValue + 40; // Offset down
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();

    } else if (state.mode === 'XY') {
        ctx.strokeStyle = '#9dff0f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < width; i++) {
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
        timePhase += 0.1; // Dummy time forward
    }
    requestAnimationFrame(render);
}

render(); // Start engine
