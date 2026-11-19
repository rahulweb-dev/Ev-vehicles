// Detects AI-generation provenance embedded in an image file (C2PA Content Credentials, IPTC/XMP
// DigitalSourceType "trainedAlgorithmicMedia", vendor tags). Used to label AI images on upload.
// Note: Google SynthID lives in the pixels, so a Gemini image with no metadata can't be detected this way.
const VENDORS = [
  ["ChatGPT / OpenAI", /OpenAI|ChatGPT|DALL[·\-]?E|GPT-4o/i],
  ["Google Gemini", /Gemini|Imagen|Made with Google AI|SynthID/i],
  ["Midjourney", /Midjourney/i],
  ["Adobe Firefly", /Firefly/i],
  ["Stable Diffusion", /Stable Diffusion/i],
];

export function detectAiImage(buffer) {
  const txt = Buffer.from(buffer).toString("latin1");
  const marker = /trainedAlgorithmicMedia|compositeSynthetic|algorithmicMedia/i.test(txt) || (/c2pa/i.test(txt) && /jumb/.test(txt) && VENDORS.some(([, re]) => re.test(txt)));
  const vendor = VENDORS.find(([, re]) => re.test(txt))?.[0] || "";
  return { aiGenerated: !!marker, vendor: marker ? vendor : "" };
}

export const AI_CAPTION = "Illustration (AI-generated)";
