import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)

export async function generateRecipes(ingredients, options = {}) {
  const { diet = '', maxTime = '', difficulty = '' } = options
  
  const prompt = `Generate 3-5 detailed recipes using these ingredients: ${ingredients.join(', ')}.

Requirements:
${diet ? `- Diet: ${diet}` : ''}
${maxTime ? `- Max cooking time: ${maxTime} minutes` : ''}
${difficulty ? `- Difficulty: ${difficulty}` : ''}

For each recipe, provide a JSON response with this exact structure:
{
  "recipes": [
    {
      "id": "unique-recipe-id",
      "name": "Recipe Name",
      "cuisine": "Cuisine Type",
      "image": "https://images.unsplash.com/photo-[placeholder]?auto=format&fit=crop&w=400&q=80",
      "ingredients": [
        {"name": "ingredient", "qty": 1, "unit": "cup"},
        {"name": "ingredient2", "qty": 2, "unit": "tbsp"}
      ],
      "steps": [
        "Step 1: Detailed instruction",
        "Step 2: Detailed instruction"
      ],
      "time": 30,
      "servings": 4,
      "diet": ["vegetarian", "gluten-free"],
      "difficulty": "easy",
      "nutrition": {
        "calories": 350,
        "protein": 15,
        "carbs": 45,
        "fat": 12
      }
    }
  ]
}

Make recipes practical and delicious. Use realistic cooking times and serving sizes.`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }
    
    const data = JSON.parse(jsonMatch[0])
    return data.recipes || []
  } catch (error) {
    console.error('Error generating recipes:', error)
    throw new Error('Failed to generate recipes. Please try again.')
  }
}
