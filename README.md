# Backend – Real-Time Speech to Sign Gloss

## Overview
This backend converts live microphone speech into sign-language gloss in real time.

## Components
- server.js – Azure Speech streaming + WebSocket server
- nlp_client.js – Text cleaning and gloss generation
- mic_test.html – Microphone testing utility

## How to Run

### Step 1: Install dependencies
```bash
npm install
