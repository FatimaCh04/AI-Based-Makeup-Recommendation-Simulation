export const mockFeaturedRecommendation = {
  id: "rec-soft-rose-glam",
  title: "Soft Rose Glam",
  occasion: "Party / Evening",
  matchScore: 96,
  description: "AI-matched exclusively for your Warm undertone and Oval face structure. Accentuates almond eyes with soft warm crease transitions while sculpting cheekbones with peachy radiance.",
  image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
  beforeImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  shades: [
    {
      category: "Foundation",
      name: "Warm Beige",
      hex: "#D8A782",
      finish: "Radiant Satin",
      code: "F-302",
      alternatives: [
        { name: "Golden Honey", hex: "#CE9B72", code: "F-304" },
        { name: "Warm Almond", hex: "#E2B795", code: "F-208" }
      ]
    },
    {
      category: "Lipstick",
      name: "Rose Nude",
      hex: "#BC6C7B",
      finish: "Velvet Cream",
      code: "L-114",
      alternatives: [
        { name: "Berry Crush", hex: "#8B263E", code: "L-202" },
        { name: "Coral Satin", hex: "#D46859", code: "L-089" },
        { name: "Spiced Mauve", hex: "#9E5B6E", code: "L-310" }
      ]
    },
    {
      category: "Eyeshadow",
      name: "Soft Brown",
      hex: "#8A5A36",
      finish: "Velvet Matte + Gold Shimmer",
      code: "E-401",
      alternatives: [
        { name: "Copper Sunset", hex: "#A75D33", code: "E-405" },
        { name: "Champagne Pearl", hex: "#CDB399", code: "E-102" }
      ]
    },
    {
      category: "Blush",
      name: "Peach",
      hex: "#E0876A",
      finish: "Soft Luminous",
      code: "B-205",
      alternatives: [
        { name: "Warm Terracotta", hex: "#C76953", code: "B-210" },
        { name: "Petal Flush", hex: "#DC828E", code: "B-108" }
      ]
    }
  ],
  aiAnalysisNotes: [
    "Detected 468 landmark facial symmetry points",
    "Optimized cheekbone contour for Oval face curvature",
    "Tailored warmth ratio for Fitzpatrick III skin tone"
  ]
};
