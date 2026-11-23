export const mockUserData = {
  id: "usr_aliza_01",
  name: "Aliza Naeem",
  greetingName: "Aliza",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  email: "aliza.naeem@example.com",
  phone: "+92 300 1234567",
  memberTier: "Pro Member",
  memberSince: "July 2024",
  beautyProfile: {
    faceShape: {
      value: "Oval",
      confidence: "96%",
      description: "Harmonious symmetrical proportions with gently rounded jawline."
    },
    skinTone: {
      value: "Warm Wheatish",
      hex: "#D8A782",
      description: "Golden warm undertone with peachy radiance."
    },
    undertone: {
      value: "Warm",
      hex: "#E8A574",
      description: "Yellow and golden undertones."
    },
    eyeShape: {
      value: "Almond",
      confidence: "94%",
      description: "Upward outer corner contour."
    },
    noseShape: {
      value: "Straight",
      description: "Balanced proportions."
    },
    lips: {
      value: "Medium",
      description: "Defined cupid's bow."
    }
  }
};

export const mockEventTypes = [
  {
    id: "wedding",
    name: "Wedding",
    subtypes: ["Day Wedding", "Night Wedding", "Bridal"],
    icon: "gem",
    color: "bg-pink-100 text-pink-600 border-pink-200",
    bannerColor: "from-pink-500 to-rose-600"
  },
  {
    id: "party",
    name: "Party",
    subtypes: ["Birthday Party", "Dinner Party", "Friends Get Together"],
    icon: "sparkles",
    color: "bg-purple-100 text-purple-600 border-purple-200",
    bannerColor: "from-purple-500 to-pink-600"
  },
  {
    id: "office",
    name: "Office",
    subtypes: ["Meeting", "Presentation", "Interview"],
    icon: "briefcase",
    color: "bg-blue-100 text-blue-600 border-blue-200",
    bannerColor: "from-blue-500 to-indigo-600"
  },
  {
    id: "casual",
    name: "Casual",
    subtypes: ["Daily Routine", "Shopping", "Travel"],
    icon: "sun",
    color: "bg-amber-100 text-amber-600 border-amber-200",
    bannerColor: "from-amber-500 to-orange-500"
  },
  {
    id: "date-night",
    name: "Date Night",
    subtypes: ["Dinner Date", "Romantic Look"],
    icon: "heart",
    color: "bg-rose-100 text-rose-600 border-rose-200",
    bannerColor: "from-rose-500 to-red-600"
  },
  {
    id: "other",
    name: "Other",
    subtypes: ["Special Occasion", "Custom Look"],
    icon: "palette",
    color: "bg-indigo-100 text-indigo-600 border-indigo-200",
    bannerColor: "from-indigo-500 to-purple-600"
  }
];

export const mockProducts = [
  {
    id: "prod-1",
    category: "Foundation",
    brand: "Maybelline",
    name: "Fit Me Matte + Poreless",
    shade: "Warm Beige 128",
    rating: 4.5,
    reviewsCount: "2.1k",
    whyRecommended: "Matches your skin tone and provides natural finish.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
    price: "$11.99"
  },
  {
    id: "prod-2",
    category: "Foundation",
    brand: "L'Oréal",
    name: "Infallible 24H Fresh Wear",
    shade: "Golden Beige",
    rating: 4.6,
    reviewsCount: "1.8k",
    whyRecommended: "Long lasting and perfect for your undertone.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=300&q=80",
    price: "$14.49"
  },
  {
    id: "prod-3",
    category: "Lipstick",
    brand: "MAC",
    name: "Retro Matte Liquid Lipcolour",
    shade: "Rose Pink Delight",
    rating: 4.8,
    reviewsCount: "3.4k",
    whyRecommended: "Hydrating velvet finish that complements your medium lips.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=300&q=80",
    price: "$24.00"
  },
  {
    id: "prod-4",
    category: "Eyeshadow",
    brand: "Urban Decay",
    name: "Naked Heat Eyeshadow Palette",
    shade: "Warm Amber & Terracotta",
    rating: 4.7,
    reviewsCount: "4.2k",
    whyRecommended: "Deepens almond eye contour with high pigment payoff.",
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=300&q=80",
    price: "$54.00"
  },
  {
    id: "prod-5",
    category: "Blush",
    brand: "NARS",
    name: "Orgasm Powder Blush",
    shade: "Peachy Pink with Golden Shimmer",
    rating: 4.9,
    reviewsCount: "5.1k",
    whyRecommended: "Illuminates cheekbones on warm wheatish skin.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
    price: "$32.00"
  }
];

export const mockSavedLooksList = [
  {
    id: "saved-1",
    title: "Party Makeup Look",
    occasion: "Party",
    date: "05 July 2024",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    notes: "Perfect for evening parties and gala events."
  },
  {
    id: "saved-2",
    title: "Wedding Makeup",
    occasion: "Wedding",
    date: "02 July 2024",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=80",
    notes: "Warm glow with golden eyeshadow and bold rose lip."
  },
  {
    id: "saved-3",
    title: "Office Look",
    occasion: "Office",
    date: "28 June 2024",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    notes: "Subtle matte contour with nude lips."
  },
  {
    id: "saved-4",
    title: "Casual Day",
    occasion: "Casual",
    date: "20 June 2024",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
    notes: "Dewy no-makeup makeup look."
  }
];

export const mockHistoryList = [
  {
    id: "hist-1",
    title: "Party Look",
    date: "05 July 2024, 07:45 PM",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "hist-2",
    title: "Wedding Look",
    date: "02 July 2024, 09:30 AM",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "hist-3",
    title: "Casual Day Look",
    date: "30 June 2024, 04:20 PM",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "hist-4",
    title: "Office Look",
    date: "28 June 2024, 11:10 AM",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
  }
];
