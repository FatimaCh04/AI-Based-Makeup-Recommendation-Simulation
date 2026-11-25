/**
 * Official Google MediaPipe Face Landmarker Client for GlamAI.
 * Runs 100% in-browser via WebAssembly and WebGL/GPU delegates.
 * Assets are loaded exclusively from same-origin Vercel URLs (/wasm and /models).
 * Detects authentic 478 3D facial landmarks without synthetic fallbacks.
 */

import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

let _landmarkerInstance = null;
let _initPromise = null;

const WASM_PATH = '/wasm';
const MODEL_ASSET_PATH = '/models/face_landmarker.task';

/**
 * Initializes and caches the singleton FaceLandmarker instance.
 * Attempts GPU delegate first; seamlessly falls back to CPU if WebGL/GPU is unavailable.
 */
export async function getFaceLandmarker() {
  if (_landmarkerInstance) {
    return _landmarkerInstance;
  }
  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = (async () => {
    try {
      console.info('[FaceLandmarker] Initializing FilesetResolver from same-origin:', WASM_PATH);
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

      let landmarker = null;
      try {
        console.info('[FaceLandmarker] Attempting FaceLandmarker creation with GPU delegate...');
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_PATH,
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        console.info('[FaceLandmarker] GPU delegate initialized successfully.');
      } catch (gpuError) {
        console.warn('[FaceLandmarker] GPU delegate failed, falling back to CPU delegate:', gpuError);
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_PATH,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        console.info('[FaceLandmarker] CPU delegate initialized successfully.');
      }

      _landmarkerInstance = landmarker;
      return _landmarkerInstance;
    } catch (err) {
      console.error('[FaceLandmarker] Critical initialization failure:', err);
      _initPromise = null;
      throw new Error(`MediaPipe Face Landmarker initialization failed: ${err.message || err}`);
    }
  })();

  return _initPromise;
}

/**
 * Helper to convert a string (dataURL, blob URL, or image src) into an HTMLImageElement.
 */
function resolveImageElement(imageSource) {
  return new Promise((resolve, reject) => {
    if (imageSource instanceof HTMLImageElement) {
      if (imageSource.complete && imageSource.naturalWidth > 0) {
        resolve(imageSource);
      } else {
        imageSource.onload = () => resolve(imageSource);
        imageSource.onerror = (e) => reject(new Error('Failed to load HTMLImageElement: ' + e));
      }
      return;
    }

    if (imageSource instanceof HTMLCanvasElement) {
      resolve(imageSource);
      return;
    }

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to decode image from provided source string.'));
      img.src = imageSource;
      return;
    }

    reject(new Error('Unsupported image source type provided to FaceLandmarker.'));
  });
}

/**
 * Detects 478 authentic facial landmarks from an image source.
 * 
 * Returns:
 * {
 *   success: boolean,
 *   faceDetected: boolean,
 *   landmarks: Array<{x: number, y: number, z: number}> | null,
 *   count: number,
 *   error?: string
 * }
 */
export async function detectFaceLandmarks(imageSource) {
  if (!imageSource) {
    return {
      success: false,
      faceDetected: false,
      landmarks: null,
      count: 0,
      error: 'No image source provided for facial landmark detection.',
    };
  }

  try {
    const landmarker = await getFaceLandmarker();
    const element = await resolveImageElement(imageSource);

    const result = landmarker.detect(element);

    if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
      return {
        success: false,
        faceDetected: false,
        landmarks: null,
        count: 0,
        error: 'No face detected in the image. Please upload a clear front-facing portrait photo.',
      };
    }

    const rawLandmarks = result.faceLandmarks[0];

    // Validate that we have the full 478 points
    if (!Array.isArray(rawLandmarks) || rawLandmarks.length < 468) {
      return {
        success: false,
        faceDetected: false,
        landmarks: null,
        count: rawLandmarks ? rawLandmarks.length : 0,
        error: `Incomplete facial mesh detected (${rawLandmarks ? rawLandmarks.length : 0} points).`,
      };
    }

    // Validate coordinate finiteness and normalize
    const validatedLandmarks = [];
    for (let i = 0; i < rawLandmarks.length; i++) {
      const pt = rawLandmarks[i];
      if (
        !Number.isFinite(pt.x) ||
        !Number.isFinite(pt.y) ||
        !Number.isFinite(pt.z)
      ) {
        return {
          success: false,
          faceDetected: false,
          landmarks: null,
          count: 0,
          error: `Non-finite coordinate encountered at landmark index ${i}.`,
        };
      }

      // Check normalized bounds for x and y with reasonable tolerance for cropped/rotated faces
      if (pt.x < -0.3 || pt.x > 1.3 || pt.y < -0.3 || pt.y > 1.3) {
        return {
          success: false,
          faceDetected: false,
          landmarks: null,
          count: 0,
          error: `Landmark coordinates at index ${i} out of normalized bounds (x: ${pt.x}, y: ${pt.y}).`,
        };
      }

      validatedLandmarks.push({
        x: pt.x,
        y: pt.y,
        z: pt.z,
      });
    }

    return {
      success: true,
      faceDetected: true,
      landmarks: validatedLandmarks,
      count: validatedLandmarks.length,
    };
  } catch (err) {
    console.error('[FaceLandmarker] Detection exception:', err);
    return {
      success: false,
      faceDetected: false,
      landmarks: null,
      count: 0,
      error: `Facial landmark detection failed: ${err.message || err}`,
    };
  }
}
