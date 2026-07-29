import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI on the server
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "PulseFit AI Backend" });
});

// Endpoint: AI Regime Designer based on user goals and equipment
app.post("/api/generate-regime", async (req, res) => {
  try {
    const {
      goalPrompt,
      fitnessLevel,
      daysPerWeek,
      sessionDurationMins,
      availableEquipment,
      gymName,
      heightCm,
      weightKg,
      age,
      gender,
      bodyFatPercent,
      primaryGoal,
      focusAreas,
      trainingStyle
    } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is missing in server environment.",
        fallback: true 
      });
    }

    const prompt = `You are an elite Strength & Conditioning Head Coach for high performance athletes and iOS fitness apps.
Generate a tailored workout regime program personalized specifically to this individual's physical metrics and goals:

--- ATHLETE PHYSICAL METRICS & PROFILE ---
- Body Height: ${heightCm ? `${heightCm} cm` : 'Not specified (assume avg)'}
- Body Weight: ${weightKg ? `${weightKg} kg` : 'Not specified (assume avg)'}
- Age: ${age || '28'} years old
- Gender / Frame: ${gender || 'General'}
- Estimated Body Fat: ${bodyFatPercent ? `${bodyFatPercent}%` : 'Not specified'}

--- TARGET GOALS & PREFERENCES ---
- Primary Fitness Goal: "${primaryGoal || 'Hypertrophy & Muscle Building'}"
- Specific Custom Goal Notes: "${goalPrompt || 'Build balanced functional strength and lean mass'}"
- Target Focus Areas: ${focusAreas && focusAreas.length > 0 ? focusAreas.join(', ') : 'Chest, Back, Legs'}
- Preferred Training Style: ${trainingStyle || 'Progressive Overload'}
- Experience Level: ${fitnessLevel || 'Intermediate'}
- Weekly Frequency: ${daysPerWeek || 4} days per week
- Target Session Duration: ${sessionDurationMins || 50} minutes per workout
- Equipment Available: ${(availableEquipment && availableEquipment.length > 0) ? availableEquipment.join(', ') : 'Barbell, Dumbbell, Cables, Machines'}
- Primary Gym Facility: ${gymName || 'Local Gym'}

--- INSTRUCTIONS ---
1. Calculate realistic working target weights in kg based on the user's body weight (${weightKg || 75} kg) and experience level (${fitnessLevel || 'Intermediate'}).
2. Choose 4 to 6 exercises targeting the specified focus areas (${focusAreas && focusAreas.length > 0 ? focusAreas.join(', ') : 'Full Body'}).
3. Provide a clear coaching tip addressing the user's specific body stats, primary goal, rest intervals, and warm-up recommendations.
Format response strictly matching the JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            routineName: { type: Type.STRING, description: "Catchy, inspiring routine title" },
            description: { type: Type.STRING, description: "Brief scientific summary of the regime focus" },
            targetGoal: { type: Type.STRING, description: "Primary goal restated" },
            difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" },
            daysPerWeek: { type: Type.NUMBER, description: "Number of workout days" },
            coachingTip: { type: Type.STRING, description: "Key coach advice on rest, nutrition, and exertion targets" },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  exerciseName: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Chest, Back, Legs, Shoulders, Arms, Core, or Cardio" },
                  equipmentRequired: { type: Type.STRING },
                  targetSets: { type: Type.NUMBER },
                  targetReps: { type: Type.NUMBER },
                  targetWeightKg: { type: Type.NUMBER },
                  restSeconds: { type: Type.NUMBER },
                  instructions: { type: Type.STRING }
                },
                required: ["exerciseName", "category", "targetSets", "targetReps", "targetWeightKg", "restSeconds", "instructions"]
              }
            }
          },
          required: ["routineName", "description", "targetGoal", "difficulty", "daysPerWeek", "coachingTip", "exercises"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No text response from Gemini API.");
    }

    const regimeData = JSON.parse(resultText);
    res.json({ success: true, regime: regimeData });

  } catch (error: any) {
    console.error("Error in /api/generate-regime:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI Regime" });
  }
});

// Endpoint: AI Machine Alternative Swap (when gym machine is busy)
app.post("/api/ai-swap-exercise", async (req, res) => {
  try {
    const { originalExerciseName, category, busyEquipment, availableEquipment } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    const prompt = `The user is at the gym and needs an alternative exercise for "${originalExerciseName}" (Category: ${category}).
The machine or gear "${busyEquipment}" is currently IN USE or unavailable.
User has access to: ${(availableEquipment && availableEquipment.length > 0) ? availableEquipment.join(', ') : 'Dumbbells, Cables, Bodyweight'}.

Suggest 2 optimal substitute exercises that target the exact same muscle group with equal mechanics. Return JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            substitutes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  equipmentRequired: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  suggestedSets: { type: Type.NUMBER },
                  suggestedReps: { type: Type.NUMBER }
                },
                required: ["name", "equipmentRequired", "reasoning", "suggestedSets", "suggestedReps"]
              }
            }
          },
          required: ["substitutes"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, substitutes: data.substitutes || [] });
  } catch (err: any) {
    console.error("Error in /api/ai-swap-exercise:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: AI Exercise Quick Form Tips
app.post("/api/exercise-tips", async (req, res) => {
  try {
    const { exerciseName, category } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key missing", fallback: true });
    }

    const prompt = `You are a certified Strength Coach and Biomechanics Specialist.
Provide concise, high-yield execution & form guidance for: "${exerciseName}" (Category: ${category || 'Strength'}).

Return JSON strictly matching schema:
- "title": Clean title e.g. "Form Blueprint: ${exerciseName}"
- "primaryCue": One single powerful cue to remember during the lift (e.g., "Drive through heels, pack shoulders")
- "setupTips": Array of 2-3 bullet points for initial body positioning, grip, or stance
- "executionSteps": Array of 2-3 execution points during concentric/eccentric movement
- "commonMistakes": Array of 2 key mistakes to avoid for injury prevention
- "breathingPattern": Clear inhale/exhale timing guide`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            primaryCue: { type: Type.STRING },
            setupTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            executionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
            breathingPattern: { type: Type.STRING }
          },
          required: ["title", "primaryCue", "setupTips", "executionSteps", "commonMistakes", "breathingPattern"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, tips: data });
  } catch (err: any) {
    console.error("Error in /api/exercise-tips:", err);
    res.status(500).json({ error: err.message || "Failed to fetch exercise form tips" });
  }
});

// Endpoint: AI Goal-Based Recipe & Meal Plan Generator
app.post("/api/generate-recipes", async (req, res) => {
  try {
    const {
      goalCategory,
      dietaryRestriction,
      targetCalories,
      ingredientsOnHand,
      userWeightKg,
      customNote
    } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key missing", fallback: true });
    }

    const prompt = `You are a Performance Sports Nutritionist and Culinary Chef specializing in athletic goal-based meal planning.
Generate 2 healthy, delicious, macro-balanced recipes specifically tailored to this user's fitness goal and dietary requirements:

--- ATHLETE DIET PROFILE & GOALS ---
- Primary Fitness Goal: "${goalCategory || 'Muscle Building'}"
- Dietary Restrictions / Tags: "${dietaryRestriction || 'None'}"
- Target Meal Calories: ~${targetCalories || 550} kcal per serving
- Ingredients on Hand (incorporate if applicable): "${ingredientsOnHand || 'Any clean whole foods'}"
- User Body Weight: ${userWeightKg || 75} kg
- Additional Preferences / Notes: "${customNote || 'Quick to prepare, high protein, wholesome'}"

--- INSTRUCTIONS ---
1. Provide exact macro estimates (Calories, Protein in g, Carbs in g, Fat in g).
2. For Muscle Building: prioritize 40g+ protein with clean carbs.
3. For Fat Loss: prioritize high volume, low calorie density, high fiber & protein.
4. For Endurance: prioritize complex carbs and moderate lean protein.
5. Provide step-by-step cooking instructions and clean ingredient measurements.

Format response strictly matching the JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  goalCategory: { type: Type.STRING, description: "Muscle Building, Fat Loss, Endurance, Maintenance, or Keto" },
                  prepTimeMins: { type: Type.NUMBER },
                  cookTimeMins: { type: Type.NUMBER },
                  calories: { type: Type.NUMBER },
                  proteinGrams: { type: Type.NUMBER },
                  carbsGrams: { type: Type.NUMBER },
                  fatGrams: { type: Type.NUMBER },
                  servings: { type: Type.NUMBER },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING }
                      },
                      required: ["name", "amount"]
                    }
                  },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: [
                  "title",
                  "description",
                  "goalCategory",
                  "prepTimeMins",
                  "cookTimeMins",
                  "calories",
                  "proteinGrams",
                  "carbsGrams",
                  "fatGrams",
                  "servings",
                  "tags",
                  "ingredients",
                  "instructions"
                ]
              }
            }
          },
          required: ["recipes"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, recipes: data.recipes || [] });

  } catch (err: any) {
    console.error("Error in /api/generate-recipes:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI recipes" });
  }
});

// Endpoint: AI Tailored 5-Minute Dynamic Warm-up Routine Generator
app.post("/api/generate-warmup", async (req, res) => {
  try {
    const { routineName, targetMuscles, exerciseNames } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key missing", fallback: true });
    }

    const prompt = `You are an elite Physical Therapist and Strength Conditioning Coach.
Generate a custom 5-minute dynamic warm-up stretching routine tailored specifically to prepare the athlete for this workout:

--- WORKOUT DETAILS ---
- Routine Name: "${routineName || 'Strength Workout'}"
- Target Muscle Groups: ${(targetMuscles || ['Chest', 'Back', 'Legs']).join(', ')}
- Exercises in Routine: ${(exerciseNames || ['Squat', 'Bench Press']).join(', ')}

--- REQUIREMENTS ---
1. Provide exactly 5 dynamic stretches/movement prep drills (60 seconds each = 5 minutes total).
2. Focus strictly on DYNAMIC movement prep (no static holding) to prime neuromuscular activation, synovial fluid, and blood flow for these specific exercises.
3. Return JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            warmupTitle: { type: Type.STRING },
            totalDurationMins: { type: Type.NUMBER },
            stretches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  durationSeconds: { type: Type.NUMBER },
                  targetMuscle: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  purpose: { type: Type.STRING }
                },
                required: ["name", "durationSeconds", "targetMuscle", "instructions", "purpose"]
              }
            }
          },
          required: ["warmupTitle", "totalDurationMins", "stretches"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json({ success: true, warmup: data });
  } catch (err: any) {
    console.error("Error in /api/generate-warmup:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI warm-up routine" });
  }
});

async function startServer() {

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PulseFit App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
