import { Recipe } from '../types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Anabolic Grilled Chicken & Quinoa Power Bowl',
    description: 'High-protein recovery bowl packed with lean chicken breast, organic quinoa, roasted sweet potato, and avocado.',
    goalCategory: 'Muscle Building',
    prepTimeMins: 15,
    cookTimeMins: 20,
    calories: 580,
    proteinGrams: 52,
    carbsGrams: 58,
    fatGrams: 14,
    servings: 1,
    tags: ['High Protein', 'Gluten-Free', 'Dairy-Free'],
    ingredients: [
      { name: 'Chicken Breast (raw weight)', amount: '220g' },
      { name: 'Cooked Quinoa', amount: '1 cup (185g)' },
      { name: 'Roasted Sweet Potato Cubes', amount: '100g' },
      { name: 'Fresh Avocado', amount: '1/2 medium (70g)' },
      { name: 'Baby Spinach & Kale Mix', amount: '2 cups' },
      { name: 'Extra Virgin Olive Oil', amount: '1 tsp' },
      { name: 'Lemon Juice & Smoked Paprika', amount: 'To taste' }
    ],
    instructions: [
      'Season chicken breast with smoked paprika, garlic powder, salt, and pepper.',
      'Grill or pan-sear chicken in olive oil over medium-high heat for 6-7 mins per side until internal temperature reaches 165°F (74°C).',
      'Fluff cooked quinoa and warm roasted sweet potato cubes.',
      'Assemble the bowl with a base of spinach and kale, layer quinoa, sweet potatoes, sliced grilled chicken breast, and sliced avocado.',
      'Squeeze fresh lemon juice over top and serve warm.'
    ]
  },
  {
    id: 'recipe-2',
    title: 'Lean Turkey & Zucchini Noodle Stir-Fry',
    description: 'Low-calorie, highly satiating fat-loss meal rich in lean ground turkey, zesty spiralized zucchini, and colorful bell peppers.',
    goalCategory: 'Fat Loss',
    prepTimeMins: 10,
    cookTimeMins: 12,
    calories: 360,
    proteinGrams: 42,
    carbsGrams: 18,
    fatGrams: 12,
    servings: 1,
    tags: ['Low Carb', 'High Protein', 'Gluten-Free', 'Dairy-Free'],
    ingredients: [
      { name: '93/7 Lean Ground Turkey', amount: '200g' },
      { name: 'Spiralized Zucchini (Zoodles)', amount: '2 large zucchinis (250g)' },
      { name: 'Sliced Bell Peppers & Onions', amount: '1 cup' },
      { name: 'Coconut Aminos / Low-Sodium Soy Sauce', amount: '1.5 tbsp' },
      { name: 'Sesame Oil', amount: '1 tsp' },
      { name: 'Minced Garlic & Ginger', amount: '1 tsp each' }
    ],
    instructions: [
      'Heat sesame oil in a large skillet over medium-high heat. Add garlic and ginger, sautéing for 30 seconds.',
      'Add ground turkey, breaking it up with a spatula until fully browned and cooked through (6-8 minutes).',
      'Toss in sliced bell peppers and onions, cooking for 3 minutes until tender-crisp.',
      'Add spiralized zucchini noodles and coconut aminos. Toss continuously for 2 minutes just until zoodles soften slightly without releasing excess water.',
      'Garnish with green onions or sesame seeds and serve immediately.'
    ]
  },
  {
    id: 'recipe-3',
    title: 'Pan-Seared Salmon with Asparagus & Jasmine Rice',
    description: 'Omega-3 dense lean muscle recovery plate featuring wild salmon, crispy garlic asparagus, and jasmine rice.',
    goalCategory: 'Muscle Building',
    prepTimeMins: 10,
    cookTimeMins: 15,
    calories: 620,
    proteinGrams: 46,
    carbsGrams: 48,
    fatGrams: 24,
    servings: 1,
    tags: ['High Protein', 'Gluten-Free', 'Dairy-Free'],
    ingredients: [
      { name: 'Wild Salmon Fillet', amount: '200g' },
      { name: 'Steamed Jasmine Rice', amount: '1 cup (150g)' },
      { name: 'Fresh Asparagus Spears', amount: '12 spears (150g)' },
      { name: 'Olive Oil', amount: '1 tbsp' },
      { name: 'Minced Garlic & Lemon Wedges', amount: '1 clove + 1 lemon' }
    ],
    instructions: [
      'Pat salmon dry with paper towels; season both sides with sea salt, black pepper, and dill.',
      'Heat 1/2 tbsp olive oil in a non-stick pan over medium-high heat. Place salmon skin-side down and sear for 4 minutes until crispy.',
      'Flip salmon and cook for another 3-4 minutes until cooked through.',
      'In the same pan, toss asparagus spears with remaining olive oil and garlic for 4 minutes until bright green.',
      'Serve salmon atop jasmine rice alongside garlic asparagus with a fresh lemon squeeze.'
    ]
  },
  {
    id: 'recipe-4',
    title: 'High-Energy Overnight Oats & Whey Berry Crunch',
    description: 'Pre-workout or endurance breakfast fueling sustained carbohydrate release and fast-acting whey protein.',
    goalCategory: 'Endurance',
    prepTimeMins: 5,
    cookTimeMins: 0,
    calories: 490,
    proteinGrams: 38,
    carbsGrams: 62,
    fatGrams: 9,
    servings: 1,
    tags: ['High Protein', 'Vegetarian'],
    ingredients: [
      { name: 'Rolled Oats', amount: '3/4 cup (60g)' },
      { name: 'Vanilla Whey Isolate Protein Powder', amount: '1 scoop (30g)' },
      { name: 'Unsweetened Almond Milk', amount: '1 cup (240ml)' },
      { name: 'Chia Seeds', amount: '1 tbsp (12g)' },
      { name: 'Fresh Blueberries & Strawberries', amount: '1/2 cup' },
      { name: 'Honey or Maple Syrup', amount: '1 tsp' }
    ],
    instructions: [
      'In a mason jar or glass bowl, combine rolled oats, whey protein powder, and chia seeds.',
      'Pour in unsweetened almond milk and stir thoroughly until no dry protein clumps remain.',
      'Cover tightly and refrigerate overnight (or at least 3 hours).',
      'Before serving, top with fresh berries and a drizzle of honey.'
    ]
  },
  {
    id: 'recipe-5',
    title: 'Keto Avocado & Egg Baked Boats with Crispy Turkey Bacon',
    description: 'Ultra-low carb, ketogenic breakfast loaded with healthy monounsaturated fats and essential micro-nutrients.',
    goalCategory: 'Keto',
    prepTimeMins: 5,
    cookTimeMins: 15,
    calories: 420,
    proteinGrams: 24,
    carbsGrams: 6,
    fatGrams: 32,
    servings: 1,
    tags: ['Low Carb', 'Gluten-Free', 'Keto'],
    ingredients: [
      { name: 'Ripe Ripe Avocado', amount: '1 whole large' },
      { name: 'Pasture-Raised Eggs', amount: '2 large' },
      { name: 'Cooked Turkey Bacon Crumbles', amount: '2 strips (25g)' },
      { name: 'Shredded Cheddar Cheese', amount: '2 tbsp (15g)' },
      { name: 'Fresh Chives & Red Pepper Flakes', amount: 'Garnish' }
    ],
    instructions: [
      'Preheat oven to 425°F (220°C).',
      'Halve avocado and remove pit. Scoop out a small spoon of flesh from each center to enlarge the hollows.',
      'Crack an egg gently into each avocado half. Season with salt and black pepper.',
      'Bake for 14-16 minutes until egg whites are set but yolk remains velvety.',
      'Top with warm bacon crumbles, shredded cheddar, and fresh chives.'
    ]
  },
  {
    id: 'recipe-6',
    title: 'Mediterranean Plant-Based Chickpea & Tofu Power Salad',
    description: 'Clean, plant-based longevity bowl delivering complete amino acids, dietary fiber, and Mediterranean herbs.',
    goalCategory: 'Maintenance',
    prepTimeMins: 12,
    cookTimeMins: 10,
    calories: 440,
    proteinGrams: 28,
    carbsGrams: 44,
    fatGrams: 16,
    servings: 1,
    tags: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
    ingredients: [
      { name: 'Extra Firm Tofu (cubed & air-fried)', amount: '150g' },
      { name: 'Rinsed Organic Chickpeas', amount: '1/2 cup (120g)' },
      { name: 'Diced Cucumbers & Cherry Tomatoes', amount: '1 cup' },
      { name: 'Kalamata Olives', amount: '6 olives' },
      { name: 'Tahini & Lemon Dressing', amount: '1.5 tbsp' },
      { name: 'Fresh Parsley & Oregano', amount: '2 tbsp' }
    ],
    instructions: [
      'Press moisture from tofu block using paper towels. Cut into 1-inch cubes.',
      'Air-fry or bake tofu at 400°F (200°C) for 12 minutes until crispy on the outside.',
      'In a large bowl, combine chickpeas, diced cucumber, tomatoes, olives, and crisp tofu.',
      'Whisk tahini, lemon juice, warm water, salt, and garlic powder into a smooth dressing.',
      'Drizzle dressing over salad, toss gently, and garnish with fresh herbs.'
    ]
  }
];
