# Bubble Gum Rhythm Game - Instructions

## Overview
"Bubble Gum Rhythm Game" is a quirky rhythm-based web game where players control an animated mouth, chewing a piece of gum and preventing it from escaping the play area.

## Concept
Players time their inputs to chew the gum, manage its durability, and redirect the gum back into the play area using a dynamic tongue mechanic.

## Platform
The game is web-based, playable through modern browsers without downloads or installations.

## Objectives
The primary objective is to keep the gum bouncing between the upper and lower jaw, preventing it from escaping and inflating into a bubble.

## Core Game Mechanics

### Chewing
- Press Spacebar to chew
- Successful chews bounce gum, reduce durability  
- Critical chews grant bonus points, higher durability reduction

### Tongue Redirection
- Press "A" for left, "D" for right
- Quick reflexes required to redirect gum

## Game Systems

### Lives
- Start with 3 lives
- Lose a life for missed chew or failed redirection

### Durability
- Gum starts at 100 points
- Normal chew reduces by 6.6, critical by 10
- Bubble inflates at 0 durability

### Scoring
- Normal: 10 points, Critical: 15 points
- Bonus for tongue redirection
- Multiplier for consecutive successes

## Visual & Audio Design
- Bright, cartoonish visuals
- Smooth tongue animation
- Satisfying chewing/redirection sounds
- Failure sounds like "splat" or "thud"

## Controls
- Spacebar: Chew
- "A"/"D": Tongue redirection
- Escape: Pause

## Tech & Development
- Framework: Next.js
- Rendering: Canvas/Web Animations
- State: React Hooks
- Audio: Web Audio API