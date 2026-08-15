import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Lazy initialize GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback intelligent natural language matcher when Gemini API is unavailable
interface CatalogItem {
  id: string;
  sku?: string;
  name: string;
  subtitle?: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
}

function fallbackSemanticMatch(query: string, catalog: CatalogItem[]) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);

  // Natural language topic maps
  const conceptMap: Record<string, { categories?: string[]; keywords: string[]; synonyms: string[]; intent: string }> = {
    summer: {
      categories: ['Apparel & Wear', 'Accessories'],
      keywords: ['linen', 'sun', 'sunglasses', 'breeze', 'lightweight', 'breathable', 'shirt', 'vacation', 'resort', 'shorts'],
      synonyms: ['warm weather', 'beach', 'hot', 'sunny', 'tropical', 'vacation'],
      intent: 'Warm weather and breathable styles',
    },
    winter: {
      categories: ['Apparel & Wear', 'Accessories'],
      keywords: ['wool', 'cashmere', 'knitwear', 'warm', 'trench', 'coat', 'jacket', 'overshirt', 'cozy'],
      synonyms: ['cold', 'snow', 'frost', 'insulating', 'heavy'],
      intent: 'Cold weather and insulating wardrobe',
    },
    audio: {
      categories: ['Audio & Tech'],
      keywords: ['headphones', 'anc', 'sound', 'music', 'dac', 'spatial', 'acoustic', 'wireless', 'earbuds', 'speaker'],
      synonyms: ['listening', 'audiophile', 'hifi', 'noise cancelling', 'podcast'],
      intent: 'High-fidelity acoustics & personal audio',
    },
    commute: {
      categories: ['Audio & Tech', 'Accessories'],
      keywords: ['headphones', 'anc', 'wireless', 'leather', 'folio', 'sunglasses', 'watch', 'portable'],
      synonyms: ['train', 'travel', 'transit', 'subway', 'flight', 'on the go'],
      intent: 'Everyday carry & commute essentials',
    },
    office: {
      categories: ['Audio & Tech', 'Home & Living', 'Accessories'],
      keywords: ['headphones', 'folio', 'lamp', 'desk', 'automatic', 'watch', 'coffee', 'leather'],
      synonyms: ['work', 'wfh', 'workspace', 'productivity', 'job', 'business'],
      intent: 'Modern professional workspace essentials',
    },
    gift: {
      categories: ['Accessories', 'Home & Living', 'Wellness & Care'],
      keywords: ['watch', 'diffuser', 'lamp', 'coffee', 'dripper', 'chronograph', 'leather', 'serum', 'candle'],
      synonyms: ['present', 'luxury', 'birthday', 'anniversary', 'surprise'],
      intent: 'Thoughtfully curated luxury gifts',
    },
    formal: {
      categories: ['Apparel & Wear', 'Accessories'],
      keywords: ['trench', 'coat', 'chronograph', 'leather', 'automatic', 'watch', 'cashmere', 'merino'],
      synonyms: ['suit', 'dinner', 'evening', 'event', 'elegant', 'dress'],
      intent: 'Refined formalwear and horology',
    },
    relax: {
      categories: ['Home & Living', 'Wellness & Care'],
      keywords: ['diffuser', 'lamp', 'sunset', 'linen', 'throw', 'botanical', 'serum', 'coffee'],
      synonyms: ['chill', 'calm', 'rest', 'peaceful', 'spa', 'evening'],
      intent: 'Aromatherapy and tranquil home atmosphere',
    },
  };

  const results: Array<{ productId: string; score: number; reason: string; highlightedFeatures: string[] }> = [];

  catalog.forEach((item) => {
    let score = 0;
    const reasons: string[] = [];
    const textBlob = `${item.name} ${item.subtitle || ''} ${item.description} ${item.category} ${item.tags.join(' ')}`.toLowerCase();

    // 1. Direct word match
    words.forEach((w) => {
      if (w.length < 2) return;
      if (item.name.toLowerCase().includes(w)) {
        score += 35;
        reasons.push(`Direct name match for "${w}"`);
      } else if (item.category.toLowerCase().includes(w)) {
        score += 25;
        reasons.push(`Matches category ${item.category}`);
      } else if (item.tags.some((t) => t.toLowerCase().includes(w))) {
        score += 20;
        reasons.push(`Tagged with "${w}"`);
      } else if (textBlob.includes(w)) {
        score += 15;
      }
    });

    // 2. Semantic concept match
    Object.entries(conceptMap).forEach(([conceptKey, concept]) => {
      const isConceptQueried =
        q.includes(conceptKey) ||
        concept.synonyms.some((syn) => q.includes(syn)) ||
        concept.keywords.some((k) => q.includes(k));

      if (isConceptQueried) {
        let conceptMatch = false;

        // Check if item fits category
        if (concept.categories?.includes(item.category)) {
          score += 20;
          conceptMatch = true;
        }

        // Check item keywords
        concept.keywords.forEach((kw) => {
          if (textBlob.includes(kw)) {
            score += 15;
            conceptMatch = true;
          }
        });

        if (conceptMatch && reasons.length < 2) {
          reasons.push(`Matches ${concept.intent}`);
        }
      }
    });

    // Price query detection (e.g. "under 200", "under $100")
    const priceMatch = q.match(/under\s*\$?(\d+)/i) || q.match(/less\s*than\s*\$?(\d+)/i);
    if (priceMatch) {
      const maxP = parseFloat(priceMatch[1]);
      if (!isNaN(maxP)) {
        if (item.price <= maxP) {
          score += 25;
          reasons.push(`Priced under $${maxP} ($${item.price})`);
        } else {
          score -= 30;
        }
      }
    }

    if (score > 15) {
      results.push({
        productId: item.id,
        score: Math.min(score, 99),
        reason: reasons[0] || `Natural language match for "${query}"`,
        highlightedFeatures: item.tags.slice(0, 3),
      });
    }
  });

  results.sort((a, b) => b.score - a.score);

  // Generate suggested queries
  const suggestions = [
    `Lightweight summer linen and accessories`,
    `Acoustic noise cancelling headphones`,
    `Luxury gifts under $200`,
    `Curated home and desk essentials`,
  ];

  return {
    matchedProductIds: results.map((r) => r.productId),
    results,
    suggestedQueries: suggestions,
    detectedCategory: results.length > 0 ? catalog.find((c) => c.id === results[0].productId)?.category : null,
    detectedIntent: `Curated selection matching "${query}"`,
    source: 'fallback',
  };
}

// 1. Natural Language AI Search API
app.post('/api/search', async (req, res) => {
  try {
    const { query, catalog } = req.body as { query: string; catalog: CatalogItem[] };

    if (!query || !query.trim()) {
      return res.json({
        matchedProductIds: [],
        results: [],
        suggestedQueries: [],
        detectedIntent: '',
        detectedCategory: null,
      });
    }

    const trimmedQuery = query.trim();
    const ai = getAiClient();

    if (!ai || !process.env.GEMINI_API_KEY) {
      // Fallback semantic search
      const fallbackResult = fallbackSemanticMatch(trimmedQuery, catalog || []);
      return res.json(fallbackResult);
    }

    // Summarize catalog for LLM context
    const catalogSummary = (catalog || []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags,
      subtitle: p.subtitle,
      description: p.description.slice(0, 180),
    }));

    const systemPrompt = `You are an expert personal shopping assistant for AURA, a luxury atelier store.
The user enters a natural language search query (e.g. "summer clothes", "noise cancelling for long flights", "minimalist gifts under 150", "cozy home decor", "working from home setup").
Your job is to analyze the user's intent, reason semantically, and rank matching products from the store catalog.

Evaluate synonyms, seasonality, utility, price constraints, aesthetic pairings, and materials.
Always provide a concise, natural explanation of why each item matches (max 12 words per reason).`;

    const userPrompt = `Store Catalog:
${JSON.stringify(catalogSummary, null, 2)}

User Search Query: "${trimmedQuery}"

Analyze and return the relevant products ranked by match score (1 to 100).
Also provide 3 natural language follow-up queries that the user might also enjoy, and the primary detected category/intent.`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedIntent: {
              type: Type.STRING,
              description: 'Brief 3-6 word summary of what the user is looking for',
            },
            detectedCategory: {
              type: Type.STRING,
              description: 'The most relevant catalog category or "All"',
            },
            results: {
              type: Type.ARRAY,
              description: 'List of matching products ranked by relevance',
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  score: { type: Type.NUMBER, description: 'Relevance score from 1 to 100' },
                  reason: { type: Type.STRING, description: 'Short justification of why it fits the natural language query' },
                  highlightedFeatures: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['productId', 'score', 'reason'],
              },
            },
            suggestedQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-4 related natural language search ideas',
            },
          },
          required: ['detectedIntent', 'results', 'suggestedQueries'],
        },
      },
    });

    const responseText = geminiResponse.text?.trim();
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(responseText);
    const results = (parsed.results || []).filter((r: { productId: string }) =>
      catalogSummary.some((c) => c.id === r.productId)
    );

    return res.json({
      matchedProductIds: results.map((r: { productId: string }) => r.productId),
      results,
      suggestedQueries: parsed.suggestedQueries || [],
      detectedCategory: parsed.detectedCategory || null,
      detectedIntent: parsed.detectedIntent || trimmedQuery,
      source: 'gemini-3.7-flash',
    });
  } catch (error) {
    console.error('Error in /api/search with Gemini:', error);
    // Graceful fallback to heuristic semantic matcher
    const { query, catalog } = req.body as { query: string; catalog: CatalogItem[] };
    const fallbackResult = fallbackSemanticMatch(query || '', catalog || []);
    return res.json(fallbackResult);
  }
});

// 2. Predictive Suggestions API (for quick autocomplete / discovery prompts)
app.get('/api/suggest', (req, res) => {
  const trendingSuggestions = [
    { text: 'Breathable summer linen & shirts', category: 'Apparel & Wear', icon: 'Sun' },
    { text: 'Active noise cancelling headphones for commute', category: 'Audio & Tech', icon: 'Headphones' },
    { text: 'Luxury horology & leather gifts under $300', category: 'Accessories', icon: 'Watch' },
    { text: 'Cozy evening aromatherapy & ambient lighting', category: 'Home & Living', icon: 'Sparkles' },
    { text: 'Minimalist everyday carry & sunglasses', category: 'Accessories', icon: 'Glasses' },
    { text: 'Organic skincare & botanical wellness', category: 'Wellness & Care', icon: 'Heart' },
  ];
  res.json({ suggestions: trendingSuggestions });
});

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite Middleware for Development / Static serving for Production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AURA Storefront Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
