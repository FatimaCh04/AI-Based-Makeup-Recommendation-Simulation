import fs from 'fs';

const data = JSON.parse(fs.readFileSync('backend/tests/login_model_landmarks.json', 'utf8'));
const landmarks = data.landmarks || data;

console.log('Total landmarks:', landmarks.length);

const inspectPts = (name, indices) => {
  console.log(`\n--- ${name} ---`);
  indices.forEach(idx => {
    const pt = landmarks[idx];
    if (pt) {
      const x = pt.x !== undefined ? pt.x : pt.pixel_x;
      const y = pt.y !== undefined ? pt.y : pt.pixel_y;
      console.log(`Point ${idx}: x=${x.toFixed(4)}, y=${y.toFixed(4)}`);
    } else {
      console.log(`Point ${idx}: MISSING`);
    }
  });
};

// Nose bridge / midline
inspectPts('Midline (Forehead to Chin)', [10, 9, 168, 6, 197, 195, 5, 4, 1, 2, 0, 17, 152]);

// Left Eye (viewer left, MP Left)
inspectPts('Left Lashline [133..33]', [133, 173, 157, 158, 159, 160, 161, 246, 33]);
inspectPts('Left Crease [190..247]', [190, 56, 28, 27, 29, 30, 247]);
inspectPts('Left Brow [55..46]', [55, 65, 52, 53, 46]);

// Right Eye (viewer right, MP Right)
inspectPts('Right Lashline [362..263]', [362, 398, 384, 385, 386, 387, 388, 466, 263]);
inspectPts('Right Crease [414..467]', [414, 286, 258, 257, 259, 260, 467]);
inspectPts('Right Brow [285..276]', [285, 295, 282, 283, 276]);

// Forehead boundary
inspectPts('Forehead & Temples', [10, 338, 297, 332, 109, 67, 103]);
