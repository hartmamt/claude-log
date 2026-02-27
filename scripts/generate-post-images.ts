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

interface PostMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
}

function loadAllPosts(): PostMeta[] {
  const posts: PostMeta[] = [];

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
      });
    }
  }

  return posts;
}

function buildPrompt(post: PostMeta): string {
  return [
    `Generate a premium blog header image for an article titled "${post.title}" in the "${post.category}" category.`,
    `The article is about: ${post.subtitle}`,
    "",
    "Style requirements:",
    "- Deep dark background (#09090b to #111113)",
    "- Subtle glowing accents in emerald green (#10b981), indigo (#6366f1), or amber (#f59e0b)",
    "- Abstract geometric patterns or data visualizations related to the post's theme",
    "- Soft depth-of-field bokeh effects",
    "- Subtle grid or terminal textures",
    "- NO text whatsoever in the image",
    "- Think: Vercel's blog headers meets a moody code editor aesthetic",
    "- Premium, polished, developer-oriented feel",
    "- 1200x630 pixel aspect ratio (wide banner format)",
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

async function generateImage(post: PostMeta): Promise<Buffer | null> {
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
