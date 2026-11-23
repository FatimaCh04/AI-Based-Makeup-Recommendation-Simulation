// Test virtualMakeupEngine methods (Step 200 Lipstick, Step 202 Blush, Step 203 Eyeshadow & Eyeliner, Step 204 Foundation, Step 205 7-Product Experience)
import {
  LIP_LANDMARK_INDICES,
  CHEEK_LANDMARK_INDICES,
  EYESHADOW_LANDMARK_INDICES,
  EYELINER_LANDMARK_INDICES,
  FOUNDATION_LANDMARK_INDICES,
  MASCARA_LANDMARK_INDICES,
  HIGHLIGHTER_LANDMARK_INDICES,
  hexToRgb,
  validateLipLandmarks,
  validateCheekLandmarks,
  validateEyeshadowLandmarks,
  validateEyelinerLandmarks,
  validateFoundationLandmarks,
  validateMascaraLandmarks,
  validateHighlighterLandmarks,
  getCachedLandmarks,
  generateImageSignature,
  invalidateLandmarkCache,
  applyLipstickToCanvas,
  applyBlushToCanvas,
  applyEyeshadowToCanvas,
  applyEyelinerToCanvas,
  applyFoundationToCanvas,
  applyMascaraToCanvas,
  applyHighlighterToCanvas
} from '../../frontend/src/utils/virtualMakeupEngine.js';

console.log('Testing virtualMakeupEngine.js (Step 205 Complete 7-Product Simulation Engine)...');

// 1. Verify Lip indices
console.assert(LIP_LANDMARK_INDICES.outer.length === 21, 'Outer lip should have 21 vertices');
console.assert(LIP_LANDMARK_INDICES.inner.length === 21, 'Inner lip should have 21 vertices');
console.assert(LIP_LANDMARK_INDICES.cupidApex === 0, 'Cupid apex should be landmark 0');
console.assert(LIP_LANDMARK_INDICES.lowerCenter === 17, 'Lower center should be landmark 17');

// 2. Verify Cheek indices
console.assert(CHEEK_LANDMARK_INDICES.left.center === 205, 'Left cheek center should be 205');
console.assert(CHEEK_LANDMARK_INDICES.right.center === 425, 'Right cheek center should be 425');
console.assert(CHEEK_LANDMARK_INDICES.left.zygion === 234, 'Left zygion should be 234');
console.assert(CHEEK_LANDMARK_INDICES.right.zygion === 454, 'Right zygion should be 454');
console.assert(CHEEK_LANDMARK_INDICES.exclusions.leftEye.length === 16, 'Left eye exclusion should have 16 points');
console.assert(CHEEK_LANDMARK_INDICES.exclusions.rightEye.length === 16, 'Right eye exclusion should have 16 points');
console.assert(CHEEK_LANDMARK_INDICES.faceOval.length === 37, 'Face oval should have 37 points');

// 3. Verify Eyeshadow indices (Step 203)
console.assert(EYESHADOW_LANDMARK_INDICES.left.upperLashline.length === 9, 'Left upper lashline should have 9 points');
console.assert(EYESHADOW_LANDMARK_INDICES.left.crease.length === 7, 'Left crease fold should have 7 points');
console.assert(EYESHADOW_LANDMARK_INDICES.left.eyeball.length === 16, 'Left eyeball palpebral opening should have 16 points');
console.assert(EYESHADOW_LANDMARK_INDICES.left.lashlineApex === 159, 'Left lashline apex should be landmark 159');
console.assert(EYESHADOW_LANDMARK_INDICES.left.creaseApex === 27, 'Left crease apex should be landmark 27');

console.assert(EYESHADOW_LANDMARK_INDICES.right.upperLashline.length === 9, 'Right upper lashline should have 9 points');
console.assert(EYESHADOW_LANDMARK_INDICES.right.crease.length === 7, 'Right crease fold should have 7 points');
console.assert(EYESHADOW_LANDMARK_INDICES.right.eyeball.length === 16, 'Right eyeball palpebral opening should have 16 points');
console.assert(EYESHADOW_LANDMARK_INDICES.right.lashlineApex === 386, 'Right lashline apex should be landmark 386');
console.assert(EYESHADOW_LANDMARK_INDICES.right.creaseApex === 257, 'Right crease apex should be landmark 257');

// 3B. Verify Eyeliner indices (Step 203 Eyeliner)
console.assert(EYELINER_LANDMARK_INDICES.left.upperLashline.length === 9, 'Left eyeliner upper lashline should have 9 points');
console.assert(EYELINER_LANDMARK_INDICES.right.upperLashline.length === 9, 'Right eyeliner upper lashline should have 9 points');
console.assert(EYELINER_LANDMARK_INDICES.left.medialCanthus === 133, 'Left medial canthus should be 133');
console.assert(EYELINER_LANDMARK_INDICES.left.lateralCanthus === 33, 'Left lateral canthus should be 33');
console.assert(EYELINER_LANDMARK_INDICES.right.medialCanthus === 362, 'Right medial canthus should be 362');
console.assert(EYELINER_LANDMARK_INDICES.right.lateralCanthus === 263, 'Right lateral canthus should be 263');
console.assert(validateEyelinerLandmarks(null) === false, 'null eyeliner landmarks must be rejected');
console.assert(typeof applyEyelinerToCanvas === 'function', 'applyEyelinerToCanvas must be a function');

// 4. Verify RGB conversion
const rgb = hexToRgb('#8F5E43');
console.assert(rgb.r === 143 && rgb.g === 94 && rgb.b === 67, 'RGB conversion failed for eyeshadow bronze');

// 5. Verify cheek landmark validation
console.assert(validateCheekLandmarks(null) === false, 'null cheek landmarks must be rejected');
console.assert(validateCheekLandmarks([]) === false, 'empty cheek landmarks must be rejected');

const degenerateCheeks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
console.assert(validateCheekLandmarks(degenerateCheeks) === false, 'Degenerate cheek landmarks must be rejected');

// 6. Verify eyeshadow landmark validation
console.assert(validateEyeshadowLandmarks(null) === false, 'null eyeshadow landmarks must be rejected');
console.assert(validateEyeshadowLandmarks([]) === false, 'empty eyeshadow landmarks must be rejected');

const degenerateEyes = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
console.assert(validateEyeshadowLandmarks(degenerateEyes) === false, 'Degenerate eye landmarks must be rejected');

// Realistic eye landmarks
const validEyes = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
validEyes[33] = { x: 0.35, y: 0.35, z: 0.0 };  // left lateral canthus (temple)
validEyes[133] = { x: 0.42, y: 0.35, z: 0.0 }; // left medial canthus (nose)
validEyes[159] = { x: 0.38, y: 0.34, z: 0.0 }; // left lash apex
validEyes[27] = { x: 0.38, y: 0.32, z: 0.0 };  // left crease apex
validEyes[362] = { x: 0.58, y: 0.35, z: 0.0 }; // right medial canthus
validEyes[263] = { x: 0.65, y: 0.35, z: 0.0 }; // right lateral canthus
validEyes[386] = { x: 0.62, y: 0.34, z: 0.0 }; // right lash apex
validEyes[257] = { x: 0.62, y: 0.32, z: 0.0 }; // right crease apex
console.assert(validateEyeshadowLandmarks(validEyes) === true, 'Valid eye landmarks must be accepted');

// 7. Verify image signature generation & cache isolation
const dummyImage1 = 'data:image/jpeg;base64,' + 'A'.repeat(500);
const dummyImage2 = 'data:image/jpeg;base64,' + 'B'.repeat(500);
const sig1 = generateImageSignature(dummyImage1);
const sig2 = generateImageSignature(dummyImage2);
console.assert(sig1 !== sig2, 'Signatures must differ for different images');

const analysisWithEyes = {
  landmarks: validEyes,
  image_signature: sig1
};

console.assert(
  getCachedLandmarks(analysisWithEyes, dummyImage1) === validEyes,
  'Matching image signature should retrieve eye landmarks'
);
console.assert(
  getCachedLandmarks(analysisWithEyes, dummyImage2) === null,
  'Mismatched image signature must be rejected'
);

// 8. Verify Foundation indices (Step 204 Face-Aware Foundation)
console.assert(FOUNDATION_LANDMARK_INDICES.faceOval.length === 37, 'Face oval must have 37 boundary vertices');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.leftEye.length === 16, 'Left eye exclusion aperture must have 16 points');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.rightEye.length === 16, 'Right eye exclusion aperture must have 16 points');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.leftEyebrow.length === 10, 'Left eyebrow exclusion contour must have 10 points');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.rightEyebrow.length === 10, 'Right eyebrow exclusion contour must have 10 points');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.lips.length === 21, 'Lips vermilion exclusion must have 21 points');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.leftNostril.length === 4, 'Left nostril alar opening must have 4 points');
console.assert(FOUNDATION_LANDMARK_INDICES.exclusions.rightNostril.length === 4, 'Right nostril alar opening must have 4 points');
console.assert(typeof applyFoundationToCanvas === 'function', 'applyFoundationToCanvas must be an exported function');

// 9. Verify Foundation validation
console.assert(validateFoundationLandmarks(null) === false, 'null foundation landmarks must be rejected');
console.assert(validateFoundationLandmarks([]) === false, 'empty foundation landmarks must be rejected');
const degenerateFace = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
console.assert(validateFoundationLandmarks(degenerateFace) === false, 'Degenerate face landmarks must be rejected');

const validFace = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
validFace[10]  = { x: 0.50, y: 0.15, z: 0.0 }; // forehead top
validFace[152] = { x: 0.50, y: 0.85, z: 0.0 }; // chin bottom
validFace[234] = { x: 0.20, y: 0.50, z: 0.0 }; // left zygion
validFace[454] = { x: 0.80, y: 0.50, z: 0.0 }; // right zygion
// Add lip points for lip validation check
validFace[0]   = { x: 0.50, y: 0.65, z: 0.0 };
validFace[17]  = { x: 0.50, y: 0.72, z: 0.0 };
validFace[61]  = { x: 0.40, y: 0.68, z: 0.0 };
validFace[291] = { x: 0.60, y: 0.68, z: 0.0 };
// Add cheek points
validFace[205] = { x: 0.35, y: 0.55, z: 0.0 };
validFace[425] = { x: 0.65, y: 0.55, z: 0.0 };
console.assert(validateFoundationLandmarks(validFace) === true, 'Plausible face landmarks must be accepted for foundation');

// 10. Verify Mascara indices & functions (Step 205)
console.assert(MASCARA_LANDMARK_INDICES.left.upperLashline.length === 9, 'Mascara left upper lashline must have 9 points');
console.assert(MASCARA_LANDMARK_INDICES.left.lowerLashline.length === 9, 'Mascara left lower lashline must have 9 points');
console.assert(typeof applyMascaraToCanvas === 'function', 'applyMascaraToCanvas must be an exported function');
console.assert(validateMascaraLandmarks(null) === false, 'null mascara landmarks must be rejected');
console.assert(validateMascaraLandmarks(validEyes) === true, 'valid eye landmarks must be accepted for mascara');

// 11. Verify Highlighter indices & functions (Step 205)
console.assert(HIGHLIGHTER_LANDMARK_INDICES.leftCheekCenter === 116, 'Highlighter left cheek center must be 116');
console.assert(HIGHLIGHTER_LANDMARK_INDICES.rightCheekCenter === 345, 'Highlighter right cheek center must be 345');
console.assert(HIGHLIGHTER_LANDMARK_INDICES.noseTip[0] === 4, 'Highlighter nose tip must be 4');
console.assert(typeof applyHighlighterToCanvas === 'function', 'applyHighlighterToCanvas must be an exported function');
console.assert(validateHighlighterLandmarks(null) === false, 'null highlighter landmarks must be rejected');

const validHighlighterLms = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
validHighlighterLms[116] = { x: 0.35, y: 0.45, z: 0.0 };
validHighlighterLms[345] = { x: 0.65, y: 0.45, z: 0.0 };
validHighlighterLms[168] = { x: 0.50, y: 0.38, z: 0.0 };
validHighlighterLms[4]   = { x: 0.50, y: 0.52, z: 0.0 };
console.assert(validateHighlighterLandmarks(validHighlighterLms) === true, 'Valid highlighter landmarks must be accepted');

// 12. Verify Event-Adaptive Makeup Execution (Step 208 QA)
const mockCtx = {
  save: () => {},
  restore: () => {},
  beginPath: () => {},
  closePath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  stroke: () => {},
  fill: () => {},
  clip: () => {},
  drawImage: () => {},
  rect: () => {},
  arc: () => {},
  createRadialGradient: () => ({ addColorStop: () => {} }),
  ellipse: () => {}
};
global.document = {
  createElement: () => ({ width: 0, height: 0, getContext: () => mockCtx })
};

// Test Mascara runtime execution
const mascaraWeddingRes = applyMascaraToCanvas(mockCtx, 600, 600, validEyes, { occasion: 'Wedding' });
console.assert(mascaraWeddingRes.success === true, 'Mascara must succeed on valid landmarks');
console.assert(mascaraWeddingRes.volume === 'dramatic', 'Mascara for Wedding must automatically activate dramatic volume');
console.assert(mascaraWeddingRes.intensity === 'dramatic', 'Mascara intensity for Wedding must be dramatic');

// Test Foundation runtime execution
const foundWeddingRes = applyFoundationToCanvas(mockCtx, 600, 600, validFace, { occasion: 'Wedding' });
console.assert(foundWeddingRes.success === true, 'Foundation must succeed on valid landmarks');
console.assert(foundWeddingRes.coverage === 'full', 'Foundation for Wedding must automatically activate full coverage');
console.assert(foundWeddingRes.effectiveOpacity >= 0.70, 'Foundation effective opacity for Wedding must be >= 0.70');

// Test Lipstick runtime execution
const lipWeddingRes = applyLipstickToCanvas(mockCtx, 600, 600, validFace, { occasion: 'Wedding' });
console.assert(lipWeddingRes.success === true, 'Lipstick must succeed on valid landmarks');
console.assert(lipWeddingRes.effectiveOpacity >= 0.80, 'Lipstick effective opacity for Wedding must be >= 0.80');

console.log('ALL STEP 205 & STEP 208 EVENT-ADAPTIVE VIRTUAL MAKEUP ENGINE CHECKS PASSED!');
