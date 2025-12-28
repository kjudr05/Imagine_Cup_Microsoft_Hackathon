require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const sdk = require("microsoft-cognitiveservices-speech-sdk");

const app = express();
const PORT = 3001;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

app.get("/", (req, res) => {
  res.send("Speech backend running");
});

const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.SPEECH_KEY,
  process.env.SPEECH_REGION
);
speechConfig.speechRecognitionLanguage = "en-US";

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("🎤 Client connected");

  const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  recognizer.recognizing = (s, e) => {
    if (e.result.text) {
      console.log("🟡 Recognizing:", e.result.text);
    }
  };

  recognizer.recognized = (s, e) => {
    if (e.result.text) {
      console.log("🟢 Final:", e.result.text);

      const payload = JSON.stringify({
        type: "speech",
        text: e.result.text
      });

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  };

  recognizer.startContinuousRecognitionAsync();

  ws.on("message", (data) => {
    if (Buffer.isBuffer(data)) {
      pushStream.write(data);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    recognizer.stopContinuousRecognitionAsync();
    pushStream.close();
    console.log("❌ Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Speech server running at http://localhost:${PORT}`);
});
