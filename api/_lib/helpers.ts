import { Type } from "@google/genai";

export function getTipFallback(body: any) {
  const { phase, symptoms } = body || {};

  const defaultTips: Record<string, { category: string; title: string; tip: string; action: string }> = {
    Menstrual: {
      category: "REST & RECOVERY",
      title: "Warmth & Iron Replenishment",
      tip: "Hormone levels are at their monthly baseline. Blood loss makes iron and hydration vital for sustained energy.",
      action: "Sip warm ginger tea and incorporate dark leafy greens or lentils into your meals today."
    },
    Follicular: {
      category: "NUTRITION & VITALITY",
      title: "Gut Support for Rising Estrogen",
      tip: "Estrogen is steadily climbing, firing up your metabolic stamina and mental sharpness.",
      action: "Add fermented foods like kimchi or Greek yogurt to support healthy estrogen metabolism."
    },
    Ovulatory: {
      category: "MOVEMENT & ENERGY",
      title: "Capitalize on Peak Confidence",
      tip: "Estrogen and LH reach peak concentration today, providing maximum physical stamina and social power.",
      action: "Schedule a high-intensity workout, creative brainstorm, or social event to ride this natural wave!"
    },
    Luteal: {
      category: "MAGNESIUM & MOOD",
      title: "Magnesium for PMS Relief",
      tip: "Progesterone dominates while serotonin dips, which can lead to mild bloating or mood shifts.",
      action: "Enjoy pumpkin seeds or dark chocolate (70%+) with an evening magnesium-rich soak."
    }
  };

  const phaseKey = (phase && defaultTips[phase]) ? phase : "Follicular";
  const fallbackTip = { ...defaultTips[phaseKey] };

  if (symptoms && Array.isArray(symptoms) && symptoms.some((s: string) => s.toLowerCase().includes("cramp"))) {
    fallbackTip.category = "COMFORT & RECOVERY";
    fallbackTip.title = "Heat & Pelvic Muscle Relief";
    fallbackTip.action = "Apply a warm heating pad to your lower abdomen and practice gentle child's pose stretching.";
  }

  return fallbackTip;
}

export const tipSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    title: { type: Type.STRING },
    tip: { type: Type.STRING },
    action: { type: Type.STRING },
  },
  required: ["category", "title", "tip", "action"],
};

export function getInsightsFallback(body: any) {
  const { phase, cycleDay, symptoms } = body || {};

  const currentPhaseStr = phase || "Follicular";
  const currentDayNum = cycleDay || 1;

  const phaseOverviews: Record<string, string> = {
    Menstrual: `During your Menstrual phase (Day ${currentDayNum}), estrogen and progesterone are at baseline levels. Your body sheds the endometrial lining, requiring gentle rest, hydration, and iron-dense nourishment.`,
    Follicular: `During your Follicular phase (Day ${currentDayNum}), rising estrogen levels stimulate follicle maturation, delivering a noticeable uptick in brain focus, skin vitality, and physical stamina.`,
    Ovulatory: `During your Ovulatory phase (Day ${currentDayNum}), peak estrogen and a surge of LH trigger egg release, creating a window of maximum natural confidence, endurance, and social energy.`,
    Luteal: `During your Luteal phase (Day ${currentDayNum}), progesterone takes center stage to nurture the uterine lining. Metabolism slightly accelerates, making steady blood sugar management essential for mood stability.`
  };

  const nutritionByPhase: Record<string, string[]> = {
    Menstrual: [
      "Prioritize iron-rich foods: spinach, dark chocolate, lentils, and clean proteins.",
      "Warm, easily digestible broths and soups comfort digestive sensitivity.",
      "Pair foods with Vitamin C (citrus, berries) to maximize iron absorption."
    ],
    Follicular: [
      "Focus on sprouted seeds, fermented foods (kimchi, kefir), and vibrant green vegetables.",
      "Incorporate lean proteins and avocado healthy fats to support building follicle tissue.",
      "Stay hydrated with fresh water and antioxidant-rich green tea."
    ],
    Ovulatory: [
      "Eat fiber-rich veggies like broccoli and Brussels sprouts to help liver process surplus estrogen.",
      "Enjoy berry antioxidant smoothies and light, energetic protein bowls.",
      "Incorporate hydrating cucumbers, melons, and fresh herbs."
    ],
    Luteal: [
      "Consume complex carbs (sweet potatoes, oats, quinoa) to maintain stable serotonin levels.",
      "Incorporate magnesium-rich foods (dark chocolate, pumpkin seeds, almonds) to ease cramping.",
      "Limit excess refined sugar and caffeine to mitigate PMS mood fluctuations."
    ]
  };

  const exerciseByPhase: Record<string, string[]> = {
    Menstrual: [
      "Prioritize gentle movement like yin yoga, pelvic stretches, or light 15-minute walks.",
      "Avoid high-intensity strains or heavy lifting if experiencing active cramping."
    ],
    Follicular: [
      "Great time to try new workouts, dance cardio, or progressive strength training.",
      "Capitalize on rising stamina and faster muscle recovery times."
    ],
    Ovulatory: [
      "Engage in high-intensity interval training (HIIT), group cycling, or heavy lifting.",
      "Your physical energy and pain tolerance are at peak monthly levels."
    ],
    Luteal: [
      "Shift toward low-impact movement: Pilates, swimming, resistance bands, or nature hikes.",
      "Listen closely to your body—taper intensity if fatigue sets in."
    ]
  };

  return {
    phaseOverview: phaseOverviews[currentPhaseStr] || phaseOverviews.Follicular,
    nutritionAdvice: nutritionByPhase[currentPhaseStr] || nutritionByPhase.Follicular,
    exerciseAdvice: exerciseByPhase[currentPhaseStr] || exerciseByPhase.Follicular,
    symptomAnalysis: symptoms && symptoms.length > 0
      ? `You logged: ${symptoms.join(", ")}. These are common during the ${currentPhaseStr} phase. Applying localized warmth, staying hydrated, and eating anti-inflammatory foods provide natural comfort.`
      : "No major symptoms logged recently. Consistent tracking helps reveal your body's unique monthly rhythm.",
    mindsetTip: "Give yourself grace today. Emotional sensitivity and energy fluctuations are natural reflections of hormonal balance.",
    keyTakeaway: "Prioritize restorative rest, balanced hydration, and nutrient-dense meals today."
  };
}

export const insightsSchema = {
  type: Type.OBJECT,
  properties: {
    phaseOverview: { type: Type.STRING },
    nutritionAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    exerciseAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    symptomAnalysis: { type: Type.STRING },
    mindsetTip: { type: Type.STRING },
    keyTakeaway: { type: Type.STRING },
  },
  required: [
    "phaseOverview",
    "nutritionAdvice",
    "exerciseAdvice",
    "symptomAnalysis",
    "mindsetTip",
    "keyTakeaway",
  ],
};

export function getFallbackChatAnswer(question: string, currentContext: any): string {
  const q = question.toLowerCase();
  const phase = currentContext?.phase || "cycle";
  const day = currentContext?.cycleDay || 1;

  if (q.includes("cramp") || q.includes("pain") || q.includes("hurt") || q.includes("activity") || q.includes("activities")) {
    return `Here are effective activities and remedies to help manage period cramps during your ${phase} phase (Day ${day}):\n\n` +
      `1. Localized Heat Therapy: Apply a heating pad or hot water bottle to your lower abdomen or lower back to relax uterine muscle contractions.\n` +
      `2. Gentle Restorative Yoga & Pelvic Stretches: Positions like Child's Pose, Cat-Cow, and Reclined Bound Angle relieve pelvic tension without straining your body.\n` +
      `3. Anti-Inflammatory Herbal Teas: Sip warm ginger, chamomile, or peppermint tea. Ginger has natural anti-inflammatory compounds that soothe cramping.\n` +
      `4. Magnesium & Hydration: Drink warm water and eat magnesium-rich foods like dark chocolate (70%+), pumpkin seeds, or bananas to aid muscle relaxation.\n` +
      `5. Gentle Walking: A slow 10-15 minute walk stimulates natural endorphin release, acting as a natural pain reducer.\n\n` +
      `Note: If cramps are severe or unmanageable, please consult a healthcare professional.`;
  }
  if (q.includes("craving") || q.includes("sugar") || q.includes("food") || q.includes("eat") || q.includes("nutrition")) {
    return `Managing appetite and cravings during your ${phase} phase (Day ${day}):\n\n` +
      `1. Balance Blood Sugar: Combine complex carbs (sweet potatoes, oats, quinoa) with protein and healthy fats to avoid insulin spikes.\n` +
      `2. Dark Chocolate Comfort: Dark chocolate (70%+ cacao) supplies magnesium and satisfies sweet cravings while supporting serotonin production.\n` +
      `3. Magnesium-Rich Snacks: Pumpkin seeds, almonds, and walnuts curb chocolate and savory cravings naturally.\n` +
      `4. Hydration First: Dehydration often feels like hunger—sip warm herbal tea or lemon water when cravings arise.`;
  }
  if (q.includes("workout") || q.includes("exercise") || q.includes("train") || q.includes("gym") || q.includes("movement")) {
    return `Optimal movement guidelines for your ${phase} phase (Day ${day}):\n\n` +
      `• Menstrual Phase: Gentle walking, restorative yin yoga, stretching, and rest.\n` +
      `• Follicular Phase: Dance cardio, moderate strength training, and new workouts as stamina rises.\n` +
      `• Ovulatory Phase: High-intensity interval training (HIIT), heavy lifting, and social fitness at peak energy.\n` +
      `• Luteal Phase: Pilates, barre, steady swimming, and resistance bands as progesterone rises.\n\n` +
      `Listen to your body and adjust intensity according to your daily energy levels.`;
  }
  if (q.includes("sleep") || q.includes("tired") || q.includes("fatigue") || q.includes("insomnia")) {
    return `Improving sleeps quality during your ${phase} phase (Day ${day}):\n\n` +
      `1. Cooling Environment: Progesterone elevates core body temperature in the luteal phase—keep your bedroom cool (65-68°F / 18-20°C).\n` +
      `2. Magnesium Evening Soak: Try a warm bath with Epsom salts or enjoy magnesium-rich evening snacks to promote muscle relaxation.\n` +
      `3. Screen Cut-Off: Limit blue light 1 hour before bed and practice 4-7-8 deep diaphragmatic breathing.\n` +
      `4. Morning Sunlight: Get 10-15 minutes of natural sunlight after waking up to reinforce your circadian rhythm.`;
  }
  return `Thank you for asking about "${question}".\n\nDuring your ${phase} phase (Day ${day}), your hormonal balance influences energy, metabolism, and mood. Prioritizing balanced nutrition, steady hydration, anti-inflammatory whole foods, and restorative sleep will help keep your cycle supported.\n\nHow else can I assist you today?`;
}

export function getReportFallback(body: any) {
  const { settings } = body || {};

  return {
    summary: "Over the tracked period, your cycle data reflects steady logging. Consistent tracking of symptoms, flow intensity, and moods provides a reliable baseline for monitoring hormonal health.",
    cycleRegularityAssessment: `Your cycle duration is estimated at ${settings?.avgCycleLength || 28} days, with average period duration of ${settings?.avgPeriodLength || 5} days, consistent with standard healthy physiological ranges.`,
    commonSymptomsObserved: ["Cramps", "Bloating", "Fatigue", "Mood Shift"],
    physicianNotes: "Share this log summary with your gynaecologist or primary care physician during routine wellness visits to discuss symptom timing and hormonal phase alignment.",
    lifestyleRecommendations: [
      "Maintain a consistent sleep schedule, especially during the luteal phase.",
      "Increase dietary magnesium and omega-3 intake 5 days prior to expected period start.",
      "Track daily hydration (aim for 64-80 oz water daily) to reduce bloating and fatigue."
    ]
  };
}

export const reportSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    cycleRegularityAssessment: { type: Type.STRING },
    commonSymptomsObserved: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    physicianNotes: { type: Type.STRING },
    lifestyleRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "summary",
    "cycleRegularityAssessment",
    "commonSymptomsObserved",
    "physicianNotes",
    "lifestyleRecommendations",
  ],
};

export function applyCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
}
