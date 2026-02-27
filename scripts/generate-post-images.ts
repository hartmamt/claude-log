import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const POSTS_DIR = path.join(process.cwd(), "src", "data", "posts");
const PERSONAL_POSTS_DIR = path.join(
  process.cwd(),
  "src",
  "data",
  "personal-posts"
);
const OG_DIR = path.join(process.cwd(), "public", "og");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.1-flash-image-preview";

interface PostData {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  content: string;
}

function loadAllPosts(): PostData[] {
  const posts: PostData[] = [];

  for (const dir of [POSTS_DIR, PERSONAL_POSTS_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const data = JSON.parse(raw);
      posts.push({
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle,
        category: data.category,
        content: data.content,
      });
    }
  }

  return posts;
}

/** Pull out the first ~500 chars of plain text from markdown content */
function extractExcerpt(content: string, maxLen = 500): string {
  return content
    .replace(/:::[\s\S]*?:::/g, "") // remove callouts
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/#{1,6}\s/g, "")       // remove headings
    .replace(/[*_~`]/g, "")         // remove formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
    .replace(/\n{2,}/g, " ")
    .trim()
    .slice(0, maxLen);
}

function buildPrompt(post: PostData): string {
  const excerpt = extractExcerpt(post.content);

  return [
    `Create an image for a developer blog article header.`,
    "",
    `Article: "${post.title}"`,
    `Summary: ${post.subtitle}`,
    `Key content: ${excerpt}`,
    "",
    "ART STYLE — isometric miniature diorama:",
    "- A tiny, detailed 3D isometric scene floating in a pure dark void (#09090b background)",
    "- Like a glowing miniature world or desk scene viewed from above at a 30-degree angle",
    "- Soft, warm volumetric lighting from within the scene — like it's self-illuminated",
    "- Color palette restricted to: emerald green (#10b981) glow, indigo (#6366f1) accents, warm amber (#f59e0b) light sources, against deep blacks",
    "- Tilt-shift miniature effect — everything looks like a tiny model",
    "- Clean, slightly stylized 3D rendering — not photorealistic, not cartoonish",
    "- Think: tiny glowing worlds by Zhelong Xu or isometric art by Mohamed Chahin",
    "",
    "SCENE (specific to THIS article — read the content carefully):",
    "- Build a miniature scene that captures the article's core theme as a physical metaphor",
    "- The scene should tell a story at a glance — someone should understand the vibe immediately",
    "- Include small, delightful details that reward closer inspection",
    "- Examples of scene-thinking (DO NOT use these literally, create something unique for this article):",
    "  - Article about AI workflows → tiny desk with dual monitors, one showing code, a robot arm handing a coffee cup to a human hand",
    "  - Article about things going wrong → a beautiful miniature server room with one rack on fire, tiny fire extinguisher nearby",
    "  - Article about building fast → a tiny workshop with a half-assembled rocket on the workbench, tools scattered around",
    "",
    "RULES:",
    "- NO text, words, letters, numbers, labels, or UI anywhere in the image",
    "- The scene should be centered with generous dark space around it",
    "- Wide 16:9 aspect ratio (banner format)",
    "- Keep the dark background truly dark — the scene should glow against void",
  ].join("\n");
}

function httpsPost(url: string, body: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "POST", headers: { "Content-Type": "application/json" }, timeout: 120_000 }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, body: Buffer.concat(chunks).toString() }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out")); });
    req.write(body);
    req.end();
  });
}

async function generateImage(post: PostData): Promise<Buffer | null> {
  const prompt = buildPrompt(post);

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await httpsPost(url, body);

  if (res.status !== 200) {
    console.error(`  API error for ${post.slug}: ${res.status} ${res.body}`);
    return null;
  }

  const json = JSON.parse(res.body);
  const parts = json.candidates?.[0]?.content?.parts;
  if (!parts) {
    console.error(`  No candidates in response for ${post.slug}`);
    return null;
  }

  const imagePart = parts.find(
    (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
  );
  if (!imagePart) {
    console.error(`  No image data in response for ${post.slug}`);
    return null;
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

async function main() {
  if (!GEMINI_API_KEY) {
    console.log(
      "Skipping image generation: GEMINI_API_KEY not set"
    );
    return;
  }

  console.log("Generating post images with Gemini...\n");

  const posts = loadAllPosts();
  console.log(`  Found ${posts.length} posts`);

  fs.mkdirSync(OG_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    const outPath = path.join(OG_DIR, `${post.slug}.png`);

    if (fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    console.log(`  Generating: ${post.slug}...`);

    const imageData = await generateImage(post);
    if (imageData) {
      fs.writeFileSync(outPath, imageData);
      console.log(
        `    Saved ${outPath} (${(imageData.length / 1024).toFixed(0)} KB)`
      );
      generated++;
    } else {
      failed++;
    }

    // Rate limiting — be gentle with the API
    if (generated > 0) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(
    `\nDone: ${generated} generated, ${skipped} cached, ${failed} failed`
  );
}

main().catch(console.error);
