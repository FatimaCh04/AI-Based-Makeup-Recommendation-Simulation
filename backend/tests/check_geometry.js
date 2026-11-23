import fs from 'fs';

const data = JSON.parse(fs.readFileSync('backend/tests/login_model_landmarks.json', 'utf8'));
const landmarks = data.landmarks || data;

const width = 600;
const height = 750;

function resolvePoint(pt) {
  let x = pt.x !== undefined ? pt.x : pt.pixel_x;
  let y = pt.y !== undefined ? pt.y : pt.pixel_y;
  if (x <= 1.5 && y <= 1.5) {
    return { x: x * width, y: y * height };
  }
  return { x: Number(x), y: Number(y) };
}

const getPt = (idx) => resolvePoint(landmarks[idx]);

// Foundation
const p9   = getPt(9);
const p10  = getPt(10);
const p152 = getPt(152);
const dxForehead = p10.x - p9.x;
const dyForehead = p10.y - p9.y;
const hForehead = Math.hypot(dxForehead, dyForehead);
const faceHeight = Math.abs(p152.y - p10.y);

console.log('--- FOUNDATION METRICS ---');
console.log('p9 (glabella):', p9);
console.log('p10 (mid-forehead):', p10);
console.log('p152 (chin):', p152);
console.log('hForehead (p9 to p10):', hForehead.toFixed(2));
console.log('faceHeight (p10 to p152):', faceHeight.toFixed(2));
console.log('Current ext (hForehead * 0.78):', (hForehead * 0.78).toFixed(2));
console.log('p10.y - current ext:', (p10.y - (hForehead * 0.78)).toFixed(2));
console.log('Proposed ext (max(hForehead * 1.65, faceHeight * 0.38)):', Math.max(hForehead * 1.65, faceHeight * 0.38).toFixed(2));
console.log('p10.y - proposed ext:', (p10.y - Math.max(hForehead * 1.65, faceHeight * 0.38)).toFixed(2));

// Left Eye
const p33 = getPt(33);
const p133 = getPt(133);
const p159 = getPt(159);
const p27 = getPt(27);
const leftEyeW = Math.hypot(p133.x - p33.x, p133.y - p33.y);
console.log('\n--- LEFT EYE METRICS ---');
console.log('p133 (medial, nose):', p133);
console.log('p33 (lateral, temple):', p33);
console.log('Eye width:', leftEyeW.toFixed(2));
console.log('p159 (lashline apex):', p159);
console.log('p27 (crease apex):', p27);
console.log('Lash to crease height (p159.y - p27.y):', (p159.y - p27.y).toFixed(2));

// Right Eye
const p362 = getPt(362);
const p263 = getPt(263);
const p386 = getPt(386);
const p257 = getPt(257);
const rightEyeW = Math.hypot(p263.x - p362.x, p263.y - p362.y);
console.log('\n--- RIGHT EYE METRICS ---');
console.log('p362 (medial, nose):', p362);
console.log('p263 (lateral, temple):', p263);
console.log('Eye width:', rightEyeW.toFixed(2));
console.log('p386 (lashline apex):', p386);
console.log('p257 (crease apex):', p257);
console.log('Lash to crease height (p386.y - p257.y):', (p386.y - p257.y).toFixed(2));
