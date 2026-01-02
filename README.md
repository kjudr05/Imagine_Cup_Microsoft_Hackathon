# Backend – Real-Time Speech to Sign Gloss

## Overview
This backend converts live microphone speech into sign-language gloss in real time.

## Components
- server.js – Azure Speech streaming + WebSocket server
- nlp_client.js – Text cleaning and gloss generation
- mic_test.html – Microphone testing utility


## Pipeline
Speech → Azure ASR → NLP Gloss → WebSocket → 3D Signing Avatar

## Tech Stack
- Azure Speech Services
- Node.js + WebSockets
- React + Three.js
- Real-time NLP gloss processing

## Impact
Enables inclusive communication in education, public services, and daily life.

## How to Run
Terminal 1
```cd backend
```node server.js
Terminal 2
```node nlp_client.js
Terminal 3
```cd avatar/avatar-ui
```npm run dev

### Step 1: Install dependencies
```bash
npm install
