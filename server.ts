import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

async function parsePdfText(buffer: Buffer): Promise<string> {
  try {
    console.log("Using PDFParse class from modern pdf-parse package");
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8Array });
    const result = await parser.getText();
    return result.text || "";
  } catch (error: any) {
    console.error("PDF Parsing error inside helper:", error);
    throw error;
  }
}

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large limits for body parser to allow base64 transcripts/elements
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer memory storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

// Lazy initialize Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add your Gemini API key in the AI Studio Settings > Secrets panel.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Healthy route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Helper: Try to extract structured JSON slides from text notes using Pollinations AI (same provider as images - keyless and fast)
async function generateRevisionSlides(
  textNotes: string, 
  topicName: string = "", 
  standard: string = "", 
  board: string = ""
): Promise<{ topic: string; slides: any[] }> {
  const systemPrompt = `You are an expert masterclass educator, textbook author, and visual director. Your goal is to transform complex textbook notes or study guides into extremely engaging, deep study revision reels.
You must plan an extensive, high-quality visual slideshow of between 10 and 15 slides to make the revision reel long, complete, comprehensive, and high-value. Keep the student's cohort standard "${standard}" and syllabus board "${board}" in mind to align the academic rigor perfectly.

Every slide must contain top-tier synthesized revision content. You must return a valid JSON object matching the following structure:
{
  "topic": "A beautifully compact, highly attractive title summarizing the overarching subject.",
  "slides": [
    {
      "title": "A precise, attractive concept title for this specific slide.",
      "bullets": [
        "2 to 3 high-yield summary bullets. Focus on important terms and wrap key scientific / historical / technical terms in markdown **bold** tags (e.g., '**mitochondria**' or '**French Revolution**')."
      ],
      "narration": "A deep, highly educational, professional audio narration script (approx 45-65 words, 4-6 sentences). It must flow naturally, explaining the concept comprehensively and contextualizing the bullets in detail. Speak as if you are a highly enthusiastic world-class podcast host or teacher.",
      "image_prompts": [
        "First precise topic-relevant visual image prompt describing a concrete educational concept or metaphor. No text/labels.",
        "Second precise topic-relevant visual image prompt continuing the visual progression. No text/labels.",
        "Third precise topic-relevant visual image prompt continuing the visual progression. No text/labels.",
        "Fourth precise topic-relevant visual image prompt continuing the visual progression. No text/labels.",
        "Fifth precise topic-relevant visual image prompt for the climax/summary of this slide. No text/labels."
      ],
      "duration": 20
    }
  ]
}

CRITICAL REQUIREMENT FOR IMAGES: You MUST provide exactly 5 sequential, distinct visual image prompts inside the "image_prompts" array for every single slide. This is so we can cycle through images over the 15-20s duration to maintain dynamic interest. Each prompt must directly represent the scientific, historical, or academic subject of this slide in concrete, high-texture detail. Avoid generic cliches (e.g., do not say 'a glowing brain', 'mind map', 'books flying', 'a student studying', or 'a classroom'). Instead, describe a concrete visual scene representing the concept (e.g., 'A professional scientific macro 3D render of human cell mitochondria with highlighted inner cristae, glowing electron transport chain reactions, vibrant energy organelles'; OR 'A realistic, dramatic historical painting of the Parisian streets in 1789, cobblestones, revolutionaries carrying banners, atmospheric smoke, cinematic lighting'). Do NOT request any text, labels, letters, infographics, diagrams, or charts in any image prompt.

Ensure the output is robust, compliant JSON only, and follows the specified format perfectly.`;

  const inputPrompt = `Topic Hint: ${topicName}
Study Notes context:
${textNotes.slice(0, 18000)}`;

  try {
    console.log(`Using Pollinations AI keyless text model ('openai') for slide generation. Context: standard=${standard}, board=${board}`);
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: inputPrompt }
        ],
        model: "openai", // uses a premium model that responds beautifully in JSON mode
        jsonMode: true
      })
    });

    if (!response.ok) {
      throw new Error(`Pollinations API status code is ${response.status}`);
    }

    const text = await response.text();
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    
    return JSON.parse(cleanText.trim());
  } catch (err: any) {
    console.warn("Pollinations Text API slide generation failed. Falling back to built-in Gemini...", err);
    return generateRevisionSlidesWithGeminiFallback(textNotes, topicName, standard, board, systemPrompt, inputPrompt);
  }
}

// Fallback logic using built-in Gemini 3.5 Flash in case Pollinations text API is slow or offline
async function generateRevisionSlidesWithGeminiFallback(
  textNotes: string, 
  topicName: string, 
  standard: string, 
  board: string,
  systemPrompt: string,
  inputPrompt: string
): Promise<{ topic: string; slides: any[] }> {
  try {
    const ai = getAI();
    console.log("Engaging Gemini 3.5 Flash backup pipeline...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: inputPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: {
              type: Type.STRING,
              description: "Summarized beautiful, highly attractive main topic name."
            },
            slides: {
              type: Type.ARRAY,
              description: "List of exactly 10 to 15 study revision slides summarizing key concepts.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Clear, highly attractive slide title for this card."
                  },
                  bullets: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING
                    },
                    description: "2 to 3 high-yield summary bullet points highlighting important terms with markdown **bold** tags."
                  },
                  narration: {
                    type: Type.STRING,
                    description: "Deep, lively, energetic audio narration script (approx 45-65 words, 4-6 sentences) explaining the concept comprehensively."
                  },
                  image_prompts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING
                    },
                    description: "List of exactly 5 sequential, distinct visual image prompts representing the progression of this slide's explanation."
                  },
                  duration: {
                    type: Type.INTEGER,
                    description: "Slide duration in seconds (must be 15 or 20)."
                  }
                },
                required: ["title", "bullets", "narration", "image_prompts", "duration"]
              }
            }
          },
          required: ["topic", "slides"]
        },
        temperature: 0.7,
      },
    });

    const rawText = response.text || "";
    return JSON.parse(rawText.trim());
  } catch (err: any) {
    console.error("Both Pollinations text API and Gemini fallback failed:", err);
    throw new Error(`Revision generation failed: ${err.message || err}`);
  }
}

// Generate single educational image using Pollinations AI with enhanced context-matching
async function generateSlideImage(prompt: any, slideTitle: string = "", topicName: string = ""): Promise<string> {
  const safePrompt = typeof prompt === "string" ? prompt : (slideTitle || "educational study concept");
  
  // Clean special characters to keep URL parameters neat
  let cleanedPrompt = safePrompt.replace(/[^\w\s,\-\.\()]/g, "");

  // If the prompt is too short, augment it with the slide and topic contexts for perfect matching
  if (cleanedPrompt.length < 35 && slideTitle) {
    cleanedPrompt = `${slideTitle} of ${topicName || "Study concept"}: ${cleanedPrompt}`;
  }

  // Construct a masterclass image prompt with negative style modifiers
  const finalStyle = ", professional scientific macro photography, photorealistic textbook illustration, high fidelity 3D visual render, studio lights, 16:9 aspect ratio, strictly no text, no lettering, no user interface, no arrows, no diagrams, no charts";
  
  const finalPrompt = cleanedPrompt.slice(0, 320) + finalStyle;
  const seed = Math.floor(Math.random() * 1000000);
  
  return `https://image.pollinations.ai/p/${encodeURIComponent(finalPrompt)}?width=1280&height=720&nologo=true&seed=${seed}`;
}

// Generate TTS voice narration using Edge-TTS
async function generateTTS(narrationText: string, slideIndex: number): Promise<string> {
  // Return empty string to trigger browser-native window.speechSynthesis fallback.
  // This stops unhandled WebSocket socket errors and Connect Errors in restrictive container networks.
  return "";
}

// End-to-end generator endpoint (Accepts uploaded PDF)
app.post("/api/generate", upload.single("pdfFile"), async (req, res) => {
  try {
    let textContent = req.body.textNotes || "";
    const topicHint = req.body.topic || "";

    // If PDF file was uploaded, extract text
    if (req.file) {
       console.log(`Processing uploaded PDF file: ${req.file.originalname} (${req.file.size} bytes)`);
       const extractedText = await parsePdfText(req.file.buffer);
       if (extractedText && extractedText.trim().length > 10) {
         textContent = extractedText;
       } else {
         throw new Error("Uploaded PDF contains no extractable text or is formatted as images only.");
       }
    }

    if (!textContent || textContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Please provide either a PDF upload or some valid study notes text."
      });
    }

    console.log(`Analyzing notes (~${textContent.length} chars)...`);
    const standardHint = req.body.standard || "";
    const boardHint = req.body.board || "";
    const slidePlan = await generateRevisionSlides(textContent, topicHint, standardHint, boardHint);
    
    // Validate we got slides
    if (!slidePlan.slides || !Array.isArray(slidePlan.slides) || slidePlan.slides.length === 0) {
      throw new Error("Could not extract a clean slide plan from notes content.");
    }

    // Limit to max 15 slides (user requested more slides!)
    const activeSlides = slidePlan.slides.slice(0, 15);
    console.log(`Generated plan with ${activeSlides.length} slides for topic: "${slidePlan.topic}"`);

    // Process slide assets (Images and Audios) in parallel
    const refinedSlides = await Promise.all(
      activeSlides.map(async (slide, idx) => {
        console.log(`Generating assets for Slide ${idx + 1}: ${slide.title}`);
        
        // Extract or construct exactly 5 distinct image prompts to ensure we satisfy "at least 3 images per 10 seconds" (5 images over 15-20s duration)
        const rawPrompts = slide.image_prompts || slide.imagePrompts || [slide.image_prompt || slide.imagePrompt || slide.title];
        const promptsArray = Array.isArray(rawPrompts) ? [...rawPrompts] : [rawPrompts];
        
        // Ensure we always have exactly 5 prompts for dynamic visual pacing
        while (promptsArray.length < 5) {
          const bulletText = slide.bullets && slide.bullets.length > 0 
            ? slide.bullets[promptsArray.length % slide.bullets.length] 
            : slide.title;
          promptsArray.push(`${slide.title}, key visualization step ${promptsArray.length + 1}: ${bulletText}`);
        }
        const clampedPrompts = promptsArray.slice(0, 5);

        // Fetch all 5 images and TTS in parallel!
        const [imageUrls, audioUrl] = await Promise.all([
          Promise.all(
            clampedPrompts.map((p, pIdx) => generateSlideImage(
              p,
              `${slide.title} step ${pIdx + 1}`,
              slidePlan.topic || topicHint || "Study Revision Review"
            ))
          ),
          generateTTS(slide.narration, idx)
        ]);

        return {
          id: idx + 1,
          title: slide.title || `Concept ${idx + 1}`,
          bullets: slide.bullets || [],
          narration: slide.narration || "",
          imagePrompt: clampedPrompts[0],
          imageUrl: imageUrls[0],
          imagePrompts: clampedPrompts,
          imageUrls,
          audioUrl,
          duration: slide.duration || 20
        };
      })
    );

    return res.json({
      success: true,
      topic: slidePlan.topic || topicHint || "Study Revision Review",
      slides: refinedSlides
    });

  } catch (error: any) {
    console.error("Generation pipeline failed:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during the revision reel generation process."
    });
  }
});

// Global Express & Multer error-handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express Error Handler caught:", err);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Uploaded file is too large! Maximum limit is 15MB."
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }
  return res.status(500).json({
    success: false,
    error: err.message || "Internal server error occurred."
  });
});

// Serve frontend and handle bundler environments
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
    // Serve HTML
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Revize full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
