let ws = null;

// Modal ကို အဖွင့်/အပိတ်လုပ်ရန်
window.toggleConnModal = function() {
    const modal = document.getElementById('conn-modal');
    modal.classList.toggle('hidden');
};

// ESP32 သို့ ချိတ်ဆက်ရန် (သို့) ဖြတ်တောက်ရန်
window.connectESP32 = function() {
    const ip = document.getElementById('esp-ip').value.trim();
    const connectBtn = document.getElementById('btn-ws-connect');
    const statusBtn = document.getElementById('btn-wifi-status');

    // ချိတ်ဆက်ထားပြီးသားဆိုရင် ဖြတ်ချမယ် (Disconnect)
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        return;
    }

    connectBtn.innerText = "CONNECTING...";
    
    try {
        // WebSocket လမ်းကြောင်းဖွင့်ခြင်း
        ws = new WebSocket(`ws://${ip}/ws`);
        ws.binaryType = "arraybuffer"; // ESP32 မှ Binary Data လက်ခံမည်

        ws.onopen = () => {
            console.log("WebSocket Connected to: ", ip);
            
            // ★ ချိတ်ဆက်ကြောင်း State ကို Update လုပ်မည် (Dummy လှိုင်းများ ရပ်သွားမည်)
            window.scopeState.isConnected = true; 

            // UI Update
            statusBtn.classList.remove('disconnected');
            statusBtn.classList.add('connected');
            statusBtn.querySelector('span').innerText = "CONNECTED";
            
            connectBtn.innerText = "DISCONNECT";
            connectBtn.classList.add('disconnect-mode');
            
            // Modal ကို အလိုအလျောက်ပိတ်မည်
            setTimeout(() => { toggleConnModal(); }, 500);
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
            
            // ★ ပြတ်တောက်သွားကြောင်း State ကို Update လုပ်မည် (Dummy ပြန်ပေါ်မည်)
            window.scopeState.isConnected = false; 

            // UI Update
            statusBtn.classList.add('disconnected');
            statusBtn.classList.remove('connected');
            statusBtn.querySelector('span').innerText = "DISCONNECTED";
            
            connectBtn.innerText = "CONNECT";
            connectBtn.classList.remove('disconnect-mode');
            ws = null;
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error: ", error);
            alert("Connection Failed! Please check Esp32 power and Wi-Fi connection.");
            if(ws) ws.close();
        };

        // ESP32 မှ Data များ ဝင်လာသောအခါ
        ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer && window.scopeState.isRunning) {
                // ဥပမာ - ESP32 မှ 8-bit Data ပို့သည်ဟု ယူဆလျှင်
                let rawData = new Uint8Array(event.data);
                
                // ဒီနေရာတွင် ဝင်လာသော rawData ကို window.ch1Data ထဲသို့ ထည့်ပေးရမည်
                // C++ အပိုင်းပြီးလျှင် ဤနေရာတွင် Data Mapping အတိအကျ ပြန်ရေးပါမည်။
                
                /* ဥပမာ:
                for(let i=0; i<rawData.length && i<window.ch1Data.length; i++) {
                     // ဗို့အားပြောင်းလဲရန် (ဥပမာ)
                     window.ch1Data[i] = (rawData[i] - 128) * 0.1; 
                }
                */
            }
        };

    } catch (e) {
        alert("Invalid IP Address format!");
        connectBtn.innerText = "CONNECT";
    }
};
