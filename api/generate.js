import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  const { prompt } = req.body;

  // Prompt for JSON output in Spotify playlist format
  const fullPrompt = `
    Take this playlist description: "${prompt}".
    Generate an array of objects for a Spotify playlist, 
    each with "song", "artist", and "album".
    Output ONLY valid JSON, e.g.:
    [{"song":"Song Title","artist":"Artist","album":"Album"}]
  `;

try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
    generationConfig: {
      response_mime_type: "application/json"
    }
  });
  console.log(response.text)

  let jsonString = response.text.trim();
  // remove the markdown code block if present
  if (jsonString.startsWith("```")) {
    // remove startting ``` and language identifier like ```json
    jsonString = jsonString.replace(/^```[a-z]*\n?/, '')
    // remove the edning wala ```
    jsonString = jsonString.replace(/\n?```$/, '');
  }

  const data = JSON.parse(jsonString.trim());
  res.status(200).json(data);

} catch (err) {
  res.status(500).json({ error: err.message || "Gemini API call failed" });
}

}
