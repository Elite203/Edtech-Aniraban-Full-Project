// pageScript.js – runs INSIDE page context (not extension context)

console.log("VoiceNav: page script loaded.");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let running = false;

function startListening() {
    if (!SpeechRecognition) {
        window.postMessage({ source: "VoiceNav", type: "error", message: "SpeechRecognition not supported" });
        return;
    }

    if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript
                .trim()
                .toLowerCase();

            console.log("Heard:", transcript);

            window.postMessage({ source: "VoiceNav", type: "command", text: transcript });
        };

        recognition.onend = () => { if (running) recognition.start(); };
    }

    recognition.start();
    running = true;
    console.log("VoiceNav: listening started");
}

function stopListening() {
    if (recognition && running) {
        running = false;
        recognition.stop();
        console.log("VoiceNav: listening stopped");
    }
}

// Receive commands from extension content script
window.addEventListener("message", (e) => {
    if (!e.data || e.data.source !== "VoiceNavExt") return;

    if (e.data.command === "start") startListening();
    if (e.data.command === "stop") stopListening();
});
