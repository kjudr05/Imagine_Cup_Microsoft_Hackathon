const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3001");

/**
 * Words that should NOT appear in sign gloss
 * (auxiliary verbs, articles, fillers)
 */
const STOP_WORDS = [
  "is", "am", "are", "was", "were",
  "the", "a", "an", "to", "of"
];

/**
 * Clean spoken text:
 * - lowercase
 * - remove fillers
 * - remove punctuation
 * - normalize spaces
 */
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[?.!,]/g, "")               // remove punctuation
    .replace(/actually|basically|um|uh|like/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Convert cleaned text to sign-language gloss
 */
function textToGloss(text) {
  const words = text.split(" ");
  const gloss = [];
  let isQuestion = false;

  words.forEach((word) => {
    if (STOP_WORDS.includes(word)) return;

    if (word === "i" || word === "my") gloss.push("ME");
    else if (word === "you" || word === "your") gloss.push("YOU");
    else if (word === "tomorrow") gloss.push("TOMORROW");
    else if (word === "go") gloss.push("GO");
    else if (word === "name") gloss.push("NAME");
    else if (word === "what") {
      isQuestion = true;
      gloss.push("WHAT");
    } 
    else gloss.push(word.toUpperCase());
  });

  // Question word goes at END in sign language
  if (isQuestion) {
    return gloss.filter(w => w !== "WHAT").concat("WHAT").join(" ");
  }

  return gloss.join(" ");
}

/**
 * Format gloss for avatar / animation pipeline
 */
function glossToPayload(gloss) {
  return {
    type: "gloss",
    sequence: gloss.split(" "),
    timestamp: Date.now()
  };
}

// ---------------- WebSocket Events ----------------

ws.on("open", () => {
  console.log("🧠 NLP client connected");
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());

  if (msg.type === "speech") {
    console.log("🗣 Speech:", msg.text);

    const cleaned = cleanText(msg.text);
    console.log("🧼 Cleaned:", cleaned);

    const gloss = textToGloss(cleaned);
    console.log("✋ Gloss:", gloss);

    const payload = glossToPayload(gloss);
    console.log("📤 Sending:", payload);

    ws.send(JSON.stringify(payload));
  }
});

ws.on("close", () => {
  console.log("❌ NLP client disconnected");
});
