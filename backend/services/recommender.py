"""
Makeup Recommender Service for AI GLAM
Generates personalized makeup palettes based on facial analysis (skin tone, undertone, face shape)
and selected event (Wedding, Party, Casual / Daily Wear, Office).
Day/Night selection is not used — recommendations are event-based only.
"""


class MakeupRecommender:
    def __init__(self):
        self.occasions = ["Wedding", "Party", "Casual", "Office", "Eid"]
        self._build_shade_tables()

    def _build_shade_tables(self):
        # ── Foundation: keyed by skin_tone ──────────────────────────────────
        self.foundation_shades = {
            "Fair":   {"name": "Porcelain Silk",   "hex": "#F5DEB3", "finish": "Dewy Luminous"},
            "Light":  {"name": "Vanilla Cream",    "hex": "#EFCFAB", "finish": "Satin Natural"},
            "Medium": {"name": "Warm Honey",        "hex": "#D8A782", "finish": "Satin Radiant"},
            "Tan":    {"name": "Golden Caramel",    "hex": "#C49164", "finish": "Matte Velvet"},
            "Deep":   {"name": "Espresso Bronze",   "hex": "#8B6340", "finish": "Luminous Matte"},
            "Rich":   {"name": "Mahogany Glow",     "hex": "#5C3A21", "finish": "Radiant Matte"},
        }

        # ── Lipstick: skin_tone → undertone → occasion ───────────────────────
        self.lipstick_shades = {
            "Fair": {
                "Warm":    {"Wedding": {"name": "Petal Pink",     "hex": "#E8A0BF"},
                            "Party":   {"name": "Coral Kiss",     "hex": "#E76F7A"},
                            "Casual":  {"name": "Nude Peach",     "hex": "#DEAA96"},
                            "Office":  {"name": "Rose Whisper",   "hex": "#D4A0A0"}},
                "Cool":    {"Wedding": {"name": "Mauve Bliss",    "hex": "#C98BB9"},
                            "Party":   {"name": "Berry Frost",    "hex": "#A4506B"},
                            "Casual":  {"name": "Pink Nude",      "hex": "#D4A6B3"},
                            "Office":  {"name": "Dusty Rose",     "hex": "#C49BA5"}},
                "Neutral": {"Wedding": {"name": "Soft Rose",      "hex": "#D9909E"},
                            "Party":   {"name": "Rosewood",       "hex": "#B85C6E"},
                            "Casual":  {"name": "Peach Rose",     "hex": "#CFA098"},
                            "Office":  {"name": "Blush Nude",     "hex": "#C8A09A"}},
            },
            "Light": {
                "Warm":    {"Wedding": {"name": "Rose Gold",      "hex": "#D4848F"},
                            "Party":   {"name": "Warm Berry",     "hex": "#A8445A"},
                            "Casual":  {"name": "Peachy Keen",    "hex": "#E09E7A"},
                            "Office":  {"name": "Terracotta Nude","hex": "#C08070"}},
                "Cool":    {"Wedding": {"name": "Plum Satin",     "hex": "#8E4470"},
                            "Party":   {"name": "Raspberry Wine", "hex": "#832950"},
                            "Casual":  {"name": "Rose Quartz",    "hex": "#C9A0AA"},
                            "Office":  {"name": "Mauve Mist",     "hex": "#B08090"}},
                "Neutral": {"Wedding": {"name": "Vintage Rose",   "hex": "#B86D7E"},
                            "Party":   {"name": "Cranberry",      "hex": "#8B2252"},
                            "Casual":  {"name": "Warm Nude",      "hex": "#C09888"},
                            "Office":  {"name": "Rose Taupe",     "hex": "#A88080"}},
            },
            "Medium": {
                "Warm":    {"Wedding": {"name": "Velvet Crimson",  "hex": "#8B263E"},
                            "Party":   {"name": "Spiced Wine",     "hex": "#7B2D3A"},
                            "Casual":  {"name": "Cinnamon Rose",   "hex": "#BC6C7B"},
                            "Office":  {"name": "Warm Rosewood",   "hex": "#A05050"}},
                "Cool":    {"Wedding": {"name": "Plum Velvet",     "hex": "#6B2D5B"},
                            "Party":   {"name": "Deep Berry",      "hex": "#7A2848"},
                            "Casual":  {"name": "Mauve Rose",      "hex": "#A06878"},
                            "Office":  {"name": "Muted Plum",      "hex": "#806070"}},
                "Neutral": {"Wedding": {"name": "Classic Red",     "hex": "#A83232"},
                            "Party":   {"name": "Berry Crush",     "hex": "#8B3050"},
                            "Casual":  {"name": "Rose Nude",       "hex": "#B07878"},
                            "Office":  {"name": "Dusty Mauve",     "hex": "#907070"}},
            },
            "Tan": {
                "Warm":    {"Wedding": {"name": "Burnt Sienna",    "hex": "#8A3D2F"},
                            "Party":   {"name": "Ruby Red",        "hex": "#9B1B30"},
                            "Casual":  {"name": "Terracotta",      "hex": "#B45B3E"},
                            "Office":  {"name": "Warm Brick",      "hex": "#905040"}},
                "Cool":    {"Wedding": {"name": "Deep Plum",       "hex": "#5C2058"},
                            "Party":   {"name": "Burgundy Luxe",   "hex": "#6D2044"},
                            "Casual":  {"name": "Berry Nude",      "hex": "#8A5868"},
                            "Office":  {"name": "Wine Rose",       "hex": "#784858"}},
                "Neutral": {"Wedding": {"name": "Mahogany Red",    "hex": "#7A2828"},
                            "Party":   {"name": "Deep Cherry",     "hex": "#6B1838"},
                            "Casual":  {"name": "Cocoa Rose",      "hex": "#906060"},
                            "Office":  {"name": "Muted Berry",     "hex": "#785060"}},
            },
            "Deep": {
                "Warm":    {"Wedding": {"name": "Oxblood",         "hex": "#6A1B2A"},
                            "Party":   {"name": "Electric Red",    "hex": "#C41E3A"},
                            "Casual":  {"name": "Warm Cocoa",      "hex": "#8B5A4B"},
                            "Office":  {"name": "Chestnut",        "hex": "#704030"}},
                "Cool":    {"Wedding": {"name": "Deep Wine",       "hex": "#4A1028"},
                            "Party":   {"name": "Violet Berry",    "hex": "#5B1A50"},
                            "Casual":  {"name": "Mocha Plum",      "hex": "#6B4058"},
                            "Office":  {"name": "Dark Mauve",      "hex": "#5A3848"}},
                "Neutral": {"Wedding": {"name": "Dark Cherry",     "hex": "#5A1520"},
                            "Party":   {"name": "Bold Crimson",    "hex": "#8B0020"},
                            "Casual":  {"name": "Chocolate Rose",  "hex": "#6A4040"},
                            "Office":  {"name": "Espresso Nude",   "hex": "#5A3838"}},
            },
            "Rich": {
                "Warm":    {"Wedding": {"name": "Deep Mahogany",   "hex": "#4E1A1A"},
                            "Party":   {"name": "Fire Engine Red", "hex": "#B22222"},
                            "Casual":  {"name": "Rich Cocoa",      "hex": "#5C3520"},
                            "Office":  {"name": "Dark Cinnamon",   "hex": "#4A2820"}},
                "Cool":    {"Wedding": {"name": "Midnight Plum",   "hex": "#3C0A38"},
                            "Party":   {"name": "Violet Luxe",     "hex": "#4B0E50"},
                            "Casual":  {"name": "Dark Berry",      "hex": "#4A2838"},
                            "Office":  {"name": "Aubergine",       "hex": "#3E2030"}},
                "Neutral": {"Wedding": {"name": "Deepest Red",     "hex": "#4A0E0E"},
                            "Party":   {"name": "Bold Burgundy",   "hex": "#6B0020"},
                            "Casual":  {"name": "Nude Espresso",   "hex": "#4A3030"},
                            "Office":  {"name": "Mocha Matte",     "hex": "#3E2828"}},
            },
        }

        # ── Eyeshadow: undertone → occasion ─────────────────────────────────
        self.eyeshadow_shades = {
            "Warm":    {"Wedding": {"name": "Gilded Copper",   "hex": "#A46638"},
                        "Party":   {"name": "Smoky Bronze",    "hex": "#8F5E43"},
                        "Casual":  {"name": "Soft Taupe",      "hex": "#967A6B"},
                        "Office":  {"name": "Warm Beige",      "hex": "#C4A882"}},
            "Cool":    {"Wedding": {"name": "Silver Frost",    "hex": "#8890A0"},
                        "Party":   {"name": "Smoky Charcoal",  "hex": "#505060"},
                        "Casual":  {"name": "Lavender Mist",   "hex": "#9890A8"},
                        "Office":  {"name": "Cool Taupe",      "hex": "#8A8090"}},
            "Neutral": {"Wedding": {"name": "Champagne Gold",  "hex": "#C8A870"},
                        "Party":   {"name": "Smoky Plum",      "hex": "#6A5060"},
                        "Casual":  {"name": "Soft Brown",      "hex": "#8A7060"},
                        "Office":  {"name": "Natural Taupe",   "hex": "#A09080"}},
        }

        # ── Blush: undertone → occasion ──────────────────────────────────────
        self.blush_shades = {
            "Warm":    {"Wedding": {"name": "Sunlit Terracotta", "hex": "#D37D64"},
                        "Party":   {"name": "Coral Glow",        "hex": "#E0876A"},
                        "Casual":  {"name": "Warm Peach",        "hex": "#E6917A"},
                        "Office":  {"name": "Soft Apricot",      "hex": "#E8A88A"}},
            "Cool":    {"Wedding": {"name": "Rosy Flush",        "hex": "#D87080"},
                        "Party":   {"name": "Berry Pink",        "hex": "#C06078"},
                        "Casual":  {"name": "Soft Mauve",        "hex": "#C08898"},
                        "Office":  {"name": "Dusty Pink",        "hex": "#C8A0A8"}},
            "Neutral": {"Wedding": {"name": "Rose Petal",        "hex": "#D88088"},
                        "Party":   {"name": "Warm Rose",         "hex": "#C87080"},
                        "Casual":  {"name": "Natural Flush",     "hex": "#D09888"},
                        "Office":  {"name": "Nude Pink",         "hex": "#C8A098"}},
        }

        # ── Why-recommended notes: occasion → product ────────────────────────
        self.why_notes = {
            "Wedding": {
                "Foundation": "A flawless base is essential for wedding photography. This shade creates an even, long-lasting canvas that photographs beautifully under different lighting.",
                "Lipstick":   "Wedding lips should be elegant and long-lasting. This shade complements your undertone for timeless bridal glamour.",
                "Eyeshadow":  "Defined, dramatic eyes suit the grandeur of a wedding. This shade enhances your eye depth and photographs with rich dimension.",
                "Blush":      "A sculpted, luminous blush gives bridal radiance. Applied to the cheekbones it creates a naturally lifted, glowing finish.",
                "Eyeliner":   "Precise liner defines the eyes for close-up moments and keeps the look polished throughout the ceremony.",
                "Mascara":    "Voluminous lashes add elegance. This mascara gives full, defined lashes that hold up all day.",
                "Highlighter":"Strategic highlighting creates a lit-from-within glow on your cheekbones, brow bones, and cupid's bow for stunning photos.",
            },
            "Party": {
                "Foundation": "A buildable, radiant foundation keeps your look fresh under warm party lighting while allowing your skin to glow.",
                "Lipstick":   "Bold, expressive lips are a party statement. This shade is vibrant enough to stand out and flatters your skin tone.",
                "Eyeshadow":  "A smoky, dimensional eyeshadow adds drama and trendy edge that captures attention in a crowd.",
                "Blush":      "A pop of colour on the cheeks adds a healthy, energetic flush that reads well under party lights.",
                "Eyeliner":   "A bold liner intensifies the eye and completes the party-ready smoky effect.",
                "Mascara":    "Dramatic lashes amplify the overall party look and make your eyes appear larger and more striking.",
                "Highlighter":"A generous highlight on the high points of the face creates a dazzling glow under party lighting.",
            },
            "Casual": {
                "Foundation": "A lightweight, skin-like foundation evens your complexion without masking your natural features for a fresh everyday look.",
                "Lipstick":   "A soft, wearable shade enhances your natural lip colour for an effortless everyday appearance.",
                "Eyeshadow":  "A neutral, matte shade defines the eyes gently without looking overdone for casual outings.",
                "Blush":      "A soft flush of colour gives healthy radiance for daily wear without appearing heavy.",
                "Eyeliner":   "A softly blended liner keeps the eyes defined yet understated — perfect for low-key settings.",
                "Mascara":    "A lengthening, natural-finish mascara opens up the eyes without looking overdone.",
                "Highlighter":"A subtle, natural-looking highlight gives a fresh dewy glow suitable for everyday activities.",
            },
            "Office": {
                "Foundation": "A matte, long-wearing foundation keeps your look polished and professional through long work hours.",
                "Lipstick":   "A professional neutral shade keeps your appearance authoritative yet approachable in a workplace setting.",
                "Eyeshadow":  "A subtle, neutral shade creates a polished, refined eye that is appropriate for professional environments.",
                "Blush":      "A soft, understated blush adds warmth without appearing overly made-up — ideal for a professional setting.",
                "Eyeliner":   "A thin, precise liner gives definition without distraction, keeping the focus on your professional presence.",
                "Mascara":    "Defined, separated lashes look neat and groomed — exactly right for workplace confidence.",
                "Highlighter":"A minimal highlight on the brow bone and inner corner freshens the face subtly without looking shiny.",
            },
            "Eid": {
                "Foundation": "A radiant, velvety base ensures your festive look stays luminous from morning prayers through evening family celebrations.",
                "Lipstick":   "A rich, festive berry-rose provides a vibrant celebratory smile that pairs elegantly with traditional attire.",
                "Eyeshadow":  "Gilded metallic accents and warm bronzes evoke traditional festive luxury with stunning dimensionality.",
                "Blush":      "A warm, sunlit flush sculpts cheekbones with celebratory vitality and luminous warmth.",
                "Eyeliner":   "Deep kohl wing frames and elongates the eyes for a striking, traditional celebratory gaze.",
                "Mascara":    "Full, fluttery volume elevates the festive eye look with dramatic lash definition.",
                "Highlighter":"Golden champagne luminescence on the high cheekbones captures golden hour light beautifully for holiday portraits.",
            },
        }

        # ── Eyeliner: occasion → undertone ───────────────────────────────────
        self.eyeliner_shades = {
            "Wedding": {"Warm": {"shade": "Rich Espresso",  "hex": "#3E2B24"},
                        "Cool": {"shade": "Slate Navy",     "hex": "#2B3050"},
                        "Neutral": {"shade": "Soft Black",  "hex": "#282828"}},
            "Party":   {"Warm": {"shade": "Kohl Onyx",      "hex": "#1A1A1A"},
                        "Cool": {"shade": "Jet Black",      "hex": "#101010"},
                        "Neutral": {"shade": "Kohl Black",  "hex": "#141414"}},
            "Casual":  {"Warm": {"shade": "Espresso Brown", "hex": "#3E2B24"},
                        "Cool": {"shade": "Slate Charcoal", "hex": "#2F353B"},
                        "Neutral": {"shade": "Soft Brown",  "hex": "#3A2E28"}},
            "Office":  {"Warm": {"shade": "Warm Brown",     "hex": "#4A342A"},
                        "Cool": {"shade": "Grey Charcoal",  "hex": "#383C42"},
                        "Neutral": {"shade": "Dark Taupe",  "hex": "#3E3430"}},
            "Eid":     {"Warm": {"shade": "Deep Kohl Onyx", "hex": "#121212"},
                        "Cool": {"shade": "Midnight Black", "hex": "#0D0D11"},
                        "Neutral": {"shade": "Rich Black",  "hex": "#141414"}},
        }

        # ── Mascara: occasion ─────────────────────────────────────────────────
        self.mascara_shades = {
            "Wedding": {"name": "Lash Drama Volumizing",  "shade": "Rich Black",    "hex": "#141414"},
            "Party":   {"name": "Lash Drama Volumizing",  "shade": "Jet Black",     "hex": "#101010"},
            "Casual":  {"name": "Featherlight Defined",   "shade": "Deep Brown",    "hex": "#251D19"},
            "Office":  {"name": "Precision Lengthening",  "shade": "Soft Black",    "hex": "#202020"},
            "Eid":     {"name": "Festive Volume & Curl",  "shade": "Intense Black", "hex": "#0F0F0F"},
        }

        # ── Highlighter: undertone ────────────────────────────────────────────
        self.highlighter_shades = {
            "Warm":    {"name": "Sunlit Golden Peach",  "shade": "Champagne Glow", "hex": "#F3E3C3"},
            "Cool":    {"name": "Starlight Pink Glow",  "shade": "Opal Frost",     "hex": "#F5EBF0"},
            "Neutral": {"name": "Silk Rose Radiance",   "shade": "Rose Gold Glow", "hex": "#ECC4B6"},
        }

    # ─────────────────────────────────────────────────────────────────────────
    def get_recommendations(self, analysis_results, occasion="Party"):
        """
        Generate event-based personalized makeup recommendations.
        No time_of_day — removed entirely.
        Returns shade palette with why-recommended notes per product.
        """
        skin_tone  = analysis_results.get("skin_tone",  "Medium")
        undertone  = analysis_results.get("undertone",  "Warm")
        face_shape = analysis_results.get("face_shape", "Oval")
        skin_type  = analysis_results.get("skin_type",  "Normal")

        # Normalize occasion to known key
        norm = occasion.strip().capitalize()
        if "casual" in occasion.lower() or "daily" in occasion.lower():
            norm = "Casual"
        elif "eid" in occasion.lower() or "festival" in occasion.lower():
            norm = "Eid"
        if norm not in self.occasions:
            norm = "Party"

        notes = self.why_notes.get(norm, self.why_notes["Party"])

        # 1. Foundation
        foundation = self.foundation_shades.get(skin_tone, self.foundation_shades["Medium"]).copy()
        foundation["category"] = "Foundation"
        foundation["why"] = notes["Foundation"]

        # 2. Lipstick
        lip_tone  = self.lipstick_shades.get(skin_tone, self.lipstick_shades["Medium"])
        lip_under = lip_tone.get(undertone, lip_tone.get("Neutral", {}))
        lipstick  = lip_under.get(norm, lip_under.get("Party", {})).copy()
        lipstick["category"] = "Lipstick"
        lipstick["finish"]   = "Velvet Cream"
        lipstick["why"]      = notes["Lipstick"]

        # 3. Eyeshadow
        eye_under = self.eyeshadow_shades.get(undertone, self.eyeshadow_shades["Neutral"])
        eyeshadow = eye_under.get(norm, eye_under.get("Party", {})).copy()
        eyeshadow["category"] = "Eyeshadow"
        eyeshadow["finish"]   = "Soft Matte" if norm in ("Casual", "Office") else "Shimmer Blend"
        eyeshadow["why"]      = notes["Eyeshadow"]

        # 4. Blush
        blush_under = self.blush_shades.get(undertone, self.blush_shades["Neutral"])
        blush = blush_under.get(norm, blush_under.get("Party", {})).copy()
        blush["category"] = "Blush"
        blush["finish"]   = "Soft Matte" if norm in ("Casual", "Office") else "Luminous"
        blush["why"]      = notes["Blush"]

        # 5. Eyeliner
        liner_occ   = self.eyeliner_shades.get(norm, self.eyeliner_shades["Casual"])
        liner_shade = liner_occ.get(undertone, liner_occ.get("Neutral", {}))
        eyeliner = {
            "category": "Eyeliner",
            "name":     "Precision Liner",
            "shade":    liner_shade.get("shade", "Soft Black"),
            "hex":      liner_shade.get("hex",  "#282828"),
            "finish":   "Gel Precision",
            "why":      notes["Eyeliner"],
        }

        # 6. Mascara
        mascara_data = self.mascara_shades.get(norm, self.mascara_shades["Party"])
        mascara = {
            "category": "Mascara",
            "name":     mascara_data["name"],
            "shade":    mascara_data["shade"],
            "hex":      mascara_data["hex"],
            "finish":   "Buildable Volume",
            "why":      notes["Mascara"],
        }

        # 7. Highlighter
        hl = self.highlighter_shades.get(undertone, self.highlighter_shades["Neutral"]).copy()
        hl["category"] = "Highlighter"
        hl["finish"]   = "Pressed Pearl"
        hl["why"]      = notes["Highlighter"]

        shades = [foundation, lipstick, eyeshadow, blush, eyeliner, mascara, hl]

        display_event = "Casual / Daily Wear" if norm == "Casual" else norm
        palette_title = f"Your {display_event} Makeup Look"

        face_shape_norm = face_shape.strip().capitalize() if face_shape else "Oval"
        face_shape_rules = {
            "Round": {
                "face_shape": "Round",
                "blush_style": "Angled Contour",
                "blush_placement": "Sweep blush diagonally from the cheek apples upward toward the temples to visually slim and lengthen the face.",
                "highlighter_placement": "Focus vertically on the center of the forehead, narrow nose bridge, and chin point to draw light vertically.",
                "contour_angle_offset": 15,
                "eyeliner_style": "Winged"
            },
            "Oval": {
                "face_shape": "Oval",
                "blush_style": "Classic Apple Sweep",
                "blush_placement": "Apply directly to the apples of your cheeks and blend softly outward along the cheekbone for balanced harmony.",
                "highlighter_placement": "Dust lightly along the top crest of the cheekbones, brow bones, and cupid's bow.",
                "contour_angle_offset": 0,
                "eyeliner_style": "Classic" if norm in ("Casual", "Office") else "Winged"
            },
            "Square": {
                "face_shape": "Square",
                "blush_style": "Soft Rounded Apple",
                "blush_placement": "Apply in soft, circular motions directly on the cheek apples to soften angular jawline contours.",
                "highlighter_placement": "Apply softly to the cheekbone crest and temples in a subtle C-curve to soften facial angles.",
                "contour_angle_offset": -5,
                "eyeliner_style": "CatEye" if norm in ("Party", "Wedding", "Eid") else "Classic"
            },
            "Heart": {
                "face_shape": "Heart",
                "blush_style": "Inward Soft Drapery",
                "blush_placement": "Apply slightly lower on the cheekbones and blend inward toward the nose to balance prominent cheekbones and a tapered chin.",
                "highlighter_placement": "Highlight the cheekbones and center of the chin to soften and balance chin proportions.",
                "contour_angle_offset": -10,
                "eyeliner_style": "Soft Winged"
            },
            "Oblong": {
                "face_shape": "Oblong",
                "blush_style": "Horizontal Dimension",
                "blush_placement": "Apply horizontally across the cheeks toward the ears to create the visual illusion of width and shorten facial length.",
                "highlighter_placement": "Keep highlight strictly on the outer cheekbones; avoid forehead and chin to avoid adding vertical height.",
                "contour_angle_offset": -20,
                "eyeliner_style": "Winged"
            }
        }
        guidance = face_shape_rules.get(face_shape_norm, face_shape_rules["Oval"])

        return {
            "look_name":   palette_title,
            "occasion":    display_event,
            "description": (
                f"Personalized {display_event.lower()} look crafted for {skin_tone.lower()} skin "
                f"with {undertone.lower()} undertones and {face_shape.lower()} face shape."
            ),
            "face_shape_guidance": guidance,
            "shades":    shades,
            "shade_map": {
                "foundation":  {"name": foundation.get("name",  "Foundation"),  "hex": foundation.get("hex",  "#D8A782")},
                "lipstick":    {"name": lipstick.get("name",    "Lipstick"),     "hex": lipstick.get("hex",    "#B92F60")},
                "eyeshadow":   {"name": eyeshadow.get("name",   "Eyeshadow"),    "hex": eyeshadow.get("hex",   "#A46638")},
                "blush":       {"name": blush.get("name",       "Blush"),        "hex": blush.get("hex",       "#D37D64")},
                "eyeliner":    {"name": eyeliner.get("shade",   "Eyeliner"),     "hex": eyeliner.get("hex",    "#1A1A1A")},
                "mascara":     {"name": mascara.get("shade",    "Mascara"),      "hex": mascara.get("hex",     "#101010")},
                "highlighter": {"name": hl.get("shade",         "Highlighter"),  "hex": hl.get("hex",          "#EAD5A6")},
            },
        }
