# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static HTML5 love animation page** - an interactive romantic web experience featuring a heart-shaped flower garden animation and love story narrative. It's a single-page application designed for special occasions (Valentine's Day, anniversaries, proposals).

## Development

### Running the Project

No build process required. Open `index.html` directly in a browser:

```bash
# Option 1: Direct file open
# Double-click index.html

# Option 2: Simple HTTP server (recommended)
python -m http.server 8000
# or with Python 3:
python3 -m http.server 8000

# Option 3: Node.js live server
npx live-server
```

### Testing

Manual testing only:
1. Open `index.html` in a web browser
2. Click "Let our love begin here" button to start the love timer
3. Click anywhere to trigger petal fall animation
4. Verify animations play correctly

## Architecture

### Technology Stack
- **Pure HTML5/CSS3/JavaScript** - No frameworks, no build tools
- **jQuery v1.4.2** - DOM manipulation (included locally)
- **HTML5 Canvas API** - Graphics rendering for heart animation

### File Structure

```
/
├── index.html          # Main entry point with embedded narrative & inline scripts
├── css/
│   └── default.css     # Styling, typography, layout
├── js/
│   ├── jquery.js       # jQuery 1.4.2 library
│   ├── garden.js       # Animation engine (Vector, Petal, Bloom, Garden classes)
│   └── functions.js    # UI interactions, time tracking, heart animation logic
└── digital.ttf         # Custom font for timer display
```

### Core Animation System (garden.js)

The animation is built on a class hierarchy:

1. **Vector** - 2D vector mathematics for position/rotation calculations
2. **Petal** - Individual flower petal with bezier curve rendering
3. **Bloom** - Flower cluster managing multiple petals
4. **Garden** - Main animation engine that manages blooms and falling petals

Key pattern: Blooms are created along a heart-shaped parametric curve, each bloom grows petals using bezier curves, and the garden renders everything at 60fps intervals.

### Heart Shape Algorithm

The heart is generated using parametric equations in `getHeartPoint()` (functions.js:33):
```javascript
x = 19.5 * (16 * sin^3(t))
y = -20 * (13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
```

Bloom positions are distributed along this curve from t=0 to t=30 (approximately 0 to π in the equation).

### Animation Flow

1. **On Page Load** (`index.html:160-163`):
   - `startHeartAnimation()` creates blooms along the heart curve
   - Garden renders at 60fps via `setInterval` (functions.js:19-23)

2. **On Button Click** (`index.html:126-148`):
   - Shows the timer display
   - Starts `loveTimer` interval that updates every 500ms
   - Timer counts days/hours/minutes/seconds from the click moment

3. **On Window Click** (`index.html:116-124`):
   - Triggers `fall()` which renders falling petals
   - Petals fall with random X drift and downward Y velocity

### Customization Points

**Love Story Narrative**: Edit the pseudo-code in `#code` div (index.html:30-89)

**Names and Dates**:
- Boy name: `i = Boy("畅")` (line 38)
- Girl name: `u = Girl("娜")` (line 38)
- Meeting date comment: line 40-42
- Separation date comment: lines 49-51

**Animation Settings**: `Garden.options` (garden.js:131-140)
- `petalCount`: Number of petals per bloom (8-15)
- `bloomRadius`: Size of each flower (8-10)
- `growSpeed`: Animation speed (1000/60 = 60fps)
- `color`: RGB ranges for random bloom colors

**Heart Size**: Modify the multipliers in `getHeartPoint()` (functions.js:35-36)

**Timer Behavior**:
- Currently starts counting from button click
- To set a fixed date, uncomment lines 109-114 in index.html

### Important Notes

- The `#code` div has a `typewriter` jQuery plugin (functions.js:74-94) for typewriter effect - currently commented out in main flow
- `#code` element is hidden via CSS (`display: none`) - currently unused
- Garden canvas uses `globalCompositeOperation = "lighter"` for additive color blending (functions.js:13)
- Window resize triggers page reload to recalculate dimensions (functions.js:25-30)
- The falling petal system (`FallingPetal` class, functions.js:140-167) is implemented but the `fall()` function currently only calls `garden.updateFallingPetals()` without creating new petals
