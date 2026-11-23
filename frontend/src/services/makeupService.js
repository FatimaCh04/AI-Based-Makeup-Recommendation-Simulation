import { apiClient } from './apiClient';
import { mockFeaturedRecommendation } from '../data/mockRecommendations';
import { mockOccasions } from '../data/mockOccasions';

export const makeupService = {
  /**
   * Get featured AI makeup recommendation
   * Endpoint: GET /api/recommendations/featured
   */
  getFeaturedRecommendation: async () => {
    try {
      const response = await apiClient.get('/recommendations/featured');
      return response.data.look;
    } catch (err) {
      return mockFeaturedRecommendation;
    }
  },

  /**
   * Get recommendations by occasion (Wedding, Party, Casual, Office)
   * Endpoint: GET /api/recommendations/by-occasion/:occasion
   */
  getRecommendationsByOccasion: async (occasion) => {
    try {
      const response = await apiClient.get(`/recommendations/by-occasion/${occasion.toLowerCase()}`);
      return response.data;
    } catch (err) {
      const occ = mockOccasions.find(o => o.id === occasion.toLowerCase()) || mockOccasions[0];
      return {
        success: true,
        occasion: occ.name,
        recommendation: {
          title: `${occ.name} Luminous Look`,
          highlights: occ.keyHighlights
        }
      };
    }
  }
};
