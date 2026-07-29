import { GoogleGenAI, Type } from "@google/genai";

export interface Env {
  GEMINI_API_KEY: string;
  ASSETS?: { fetch: typeof fetch };
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx?: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Standard CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health Check Endpoint
    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          service: "PulseFit Cloudflare Worker Backend",
          timestamp: new Date().toISOString()
        }),
        { headers: corsHeaders }
      );
    }

    // AI Workout Regime Generator Endpoint
    if (url.pathname === "/api/generate-regime" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "GEMINI_API_KEY environment binding is required." }),
            { status: 500, headers: corsHeaders }
          );
        }

        const ai = new GoogleGenAI({ apiKey });
        const {
          goalPrompt, fitnessLevel, daysPerWeek, sessionDurationMins,
          availableEquipment, gymName, heightCm, weightKg, age, gender,
          bodyFatPercent, primaryGoal, focusAreas, trainingStyle
        } = body;

        const prompt = `You are an elite Strength & Conditioning Head Coach for high performance athletes and iOS fitness apps.
Generate a tailored workout regime program personalized specifically to this individual's physical metrics and goals:

--- ATHLETE PHYSICAL METRICS & PROFILE ---
- Body Height: ${heightCm ? `${heightCm} cm` : 'Not specified'}
- Body Weight: ${weightKg ? `${weightKg} kg` : 'Not specified'}
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
                routineName: { type: Type.STRING },
                description: { type: Type.STRING },
                targetGoal: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                daysPerWeek: { type: Type.NUMBER },
                coachingTip: { type: Type.STRING },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      exerciseName: { type: Type.STRING },
                      category: { type: Type.STRING },
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

        const regimeData = JSON.parse(response.text || '{}');
        return new Response(JSON.stringify({ success: true, regime: regimeData }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Failed to generate regime" }), { status: 500, headers: corsHeaders });
      }
    }

    // AI Machine Swap Endpoint
    if (url.pathname === "/api/ai-swap-exercise" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500, headers: corsHeaders });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { originalExerciseName, category, busyEquipment, availableEquipment } = body;

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
        return new Response(JSON.stringify({ success: true, substitutes: data.substitutes || [] }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Exercise Tips Endpoint
    if (url.pathname === "/api/exercise-tips" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500, headers: corsHeaders });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { exerciseName, category } = body;

        const prompt = `You are a certified Strength Coach and Biomechanics Specialist.
Provide concise, high-yield execution & form guidance for: "${exerciseName}" (Category: ${category || 'Strength'}).

Return JSON strictly matching schema:
- "title": Clean title e.g. "Form Blueprint: ${exerciseName}"
- "primaryCue": One single powerful cue to remember during the lift
- "setupTips": Array of 2-3 bullet points for positioning
- "executionSteps": Array of 2-3 execution points
- "commonMistakes": Array of 2 key mistakes to avoid
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
        return new Response(JSON.stringify({ success: true, tips: data }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Generate Recipes Endpoint
    if (url.pathname === "/api/generate-recipes" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500, headers: corsHeaders });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { goalCategory, dietaryRestriction, targetCalories, ingredientsOnHand, userWeightKg, customNote } = body;

        const prompt = `You are a Performance Sports Nutritionist and Culinary Chef specializing in athletic goal-based meal planning.
Generate 2 healthy, delicious, macro-balanced recipes specifically tailored to this user's fitness goal and dietary requirements:

--- ATHLETE DIET PROFILE & GOALS ---
- Primary Fitness Goal: "${goalCategory || 'Muscle Building'}"
- Dietary Restrictions / Tags: "${dietaryRestriction || 'None'}"
- Target Meal Calories: ~${targetCalories || 550} kcal per serving
- Ingredients on Hand: "${ingredientsOnHand || 'Any clean whole foods'}"
- User Body Weight: ${userWeightKg || 75} kg
- Additional Preferences / Notes: "${customNote || 'Quick to prepare, high protein'}"

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
                      goalCategory: { type: Type.STRING },
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
                    required: ["title", "description", "goalCategory", "prepTimeMins", "cookTimeMins", "calories", "proteinGrams", "carbsGrams", "fatGrams", "servings", "tags", "ingredients", "instructions"]
                  }
                }
              },
              required: ["recipes"]
            }
          }
        });

        const data = JSON.parse(response.text || '{}');
        return new Response(JSON.stringify({ success: true, recipes: data.recipes || [] }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Generate Dynamic Warmup Endpoint
    if (url.pathname === "/api/generate-warmup" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500, headers: corsHeaders });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { routineName, targetMuscles, exerciseNames } = body;

        const prompt = `You are an elite Physical Therapist and Strength Conditioning Coach.
Generate a custom 5-minute dynamic warm-up stretching routine tailored specifically to prepare the athlete for this workout:

--- WORKOUT DETAILS ---
- Routine Name: "${routineName || 'Strength Workout'}"
- Target Muscle Groups: ${(targetMuscles || ['Chest', 'Back', 'Legs']).join(', ')}
- Exercises in Routine: ${(exerciseNames || ['Squat', 'Bench Press']).join(', ')}

Return JSON matching schema.`;

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
        return new Response(JSON.stringify({ success: true, warmup: data }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // Serve static assets if binding exists
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(JSON.stringify({ error: "Endpoint not found" }), { status: 404, headers: corsHeaders });
  }
};
