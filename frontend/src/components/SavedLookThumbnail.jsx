import React, { useState, useEffect, useRef } from 'react';
import {
  applyFoundationToCanvas,
  applyBlushToCanvas,
  applyHighlighterToCanvas,
  applyEyeshadowToCanvas,
  applyEyelinerToCanvas,
  applyMascaraToCanvas,
  applyLipstickToCanvas
} from '../utils/virtualMakeupEngine';
import { apiClient } from '../services/apiClient';

/**
 * Renders a saved look thumbnail.
 * If the saved look only has the bare unmakeuped photo, this component
 * automatically renders all 7 cosmetic layers using the stored landmarks
 * and shades, and persists the rendered result back to the server.
 */
export default function SavedLookThumbnail({ look, className = '' }) {
  const [currentSrc, setCurrentSrc] = useState(look?.thumbnail || '');
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    if (!look) return;

    // Check if look already has a simulated thumbnail distinct from original_image
    if (look.original_image && look.thumbnail && look.thumbnail !== look.original_image) {
      setCurrentSrc(look.thumbnail);
      return;
    }

    // If look doesn't have landmarks or shades, fallback to existing thumbnail
    const landmarks = Array.isArray(look.analysis?.landmarks)
      ? look.analysis.landmarks
      : (Array.isArray(look.analysis) ? look.analysis : null);

    if (!landmarks || !look.shades || hasRenderedRef.current) {
      setCurrentSrc(look.thumbnail || '');
      return;
    }

    const baseSrc = look.original_image || look.thumbnail;
    if (!baseSrc) return;

    hasRenderedRef.current = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || 600;
        c.height = img.naturalHeight || 750;
        const ctx = c.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, c.width, c.height);

        const occasion = look.event || 'Casual';
        const isGlamOccasion = ['wedding', 'party', 'eid'].includes(occasion.toLowerCase());
        const shades = look.shades || {};

        const getHex = (cat, fallback) => {
          if (Array.isArray(shades)) {
            const item = shades.find(s => s.category?.toLowerCase() === cat.toLowerCase());
            return item?.hex || fallback;
          }
          return shades[cat]?.hex || fallback;
        };

        const foundHex = getHex('foundation', '#F5DEB3');
        const blushHex = getHex('blush', '#E6917A');
        const highHex = getHex('highlighter', '#F3E3C3');
        const eyeHex = getHex('eyeshadow', '#967A6B');
        const linerHex = getHex('eyeliner', '#3E2B24');
        const mascaraHex = getHex('mascara', isGlamOccasion ? '#080808' : '#141414');
        const lipHex = getHex('lipstick', '#DEAA96');
        const faceShape = look.analysis?.face_shape || 'Oval';

        // 1. Foundation
        applyFoundationToCanvas(ctx, c.width, c.height, landmarks, {
          hex: foundHex,
          coverage: isGlamOccasion ? 'full' : 'medium',
          finish: 'Satin',
          opacity: isGlamOccasion ? 0.70 : 0.48,
          occasion
        });

        // 2. Blush
        applyBlushToCanvas(ctx, c.width, c.height, landmarks, {
          hex: blushHex,
          finish: 'Natural',
          opacity: isGlamOccasion ? 0.65 : 0.55,
          faceShape,
          occasion
        });

        // 3. Highlighter
        applyHighlighterToCanvas(ctx, c.width, c.height, landmarks, {
          hex: highHex,
          finish: 'Radiant',
          opacity: isGlamOccasion ? 0.58 : 0.50,
          faceShape,
          occasion
        });

        // 4. Eyeshadow
        applyEyeshadowToCanvas(ctx, c.width, c.height, landmarks, {
          hex: eyeHex,
          finish: isGlamOccasion ? 'Shimmer' : 'Soft Matte',
          opacity: isGlamOccasion ? 0.70 : 0.65,
          occasion
        });

        // 5. Eyeliner
        applyEyelinerToCanvas(ctx, c.width, c.height, landmarks, {
          hex: linerHex,
          style: isGlamOccasion ? 'Winged' : 'Classic',
          opacity: isGlamOccasion ? 0.95 : 0.90,
          thickness: isGlamOccasion ? 2.2 : 1.8,
          occasion
        });

        // 6. Mascara
        applyMascaraToCanvas(ctx, c.width, c.height, landmarks, {
          hex: mascaraHex,
          intensity: isGlamOccasion ? 'Dramatic' : 'Defined',
          opacity: 0.95,
          occasion
        });

        // 7. Lipstick
        applyLipstickToCanvas(ctx, c.width, c.height, landmarks, {
          hex: lipHex,
          finish: 'Satin',
          opacity: isGlamOccasion ? 0.82 : 0.65,
          occasion
        });

        const renderedDataUrl = c.toDataURL('image/jpeg', 0.90);
        setCurrentSrc(renderedDataUrl);

        // Persist the rendered thumbnail to the backend in background
        if (look.id) {
          apiClient.patch(`/user/saved-looks/${look.id}`, {
            thumbnail: renderedDataUrl,
            original_image: baseSrc
          }).catch(() => {
            // Non-blocking background sync
          });
        }
      } catch (err) {
        console.warn('[GlamAI] Could not render saved look thumbnail:', err);
      }
    };

    img.src = baseSrc;
  }, [look]);

  if (!currentSrc) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-xs text-white/50 ${className}`}>
        No Preview
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={look.title || look.event || 'Saved Makeup Look'}
      className={className || "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"}
    />
  );
}
