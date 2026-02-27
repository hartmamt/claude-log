import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const POSTS_DIR = path.join(process.cwd(), "src/data/posts");
const PERSONAL_POSTS_DIR = path.join(process.cwd(), "src/data/personal-posts");
const NOTIFIED_PATH = path.join(
  process.cwd(),
  "src/data/notified-slugs.json"
);
const SITE_URL = process.env.SITE_URL || "https://insights.codes";

interface PostMeta {
  slug: string;
  title: string;
  subtitle: string;
}

function loadSlugs(dir: string): PostMeta[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
      return { slug: data.slug, title: data.title, subtitle: data.subtitle };
    });
}

async function main() {
  const sendFlag = process.argv.includes("--send");

  // Load all current post slugs
  const allPosts = [...loadSlugs(POSTS_DIR), ...loadSlugs(PERSONAL_POSTS_DIR)];
  const notified: string[] = JSON.parse(
    fs.readFileSync(NOTIFIED_PATH, "utf-8")
  );

  const newPosts = allPosts.filter((p) => !notified.includes(p.slug));

  if (newPosts.length === 0) {
    console.log("No new posts to notify about.");
    return;
  }

  console.log(`Found ${newPosts.length} new post(s):\n`);

  for (const post of newPosts) {
    console.log(`  - ${post.title}`);
    console.log(`    ${post.subtitle}`);
    console.log(`    ${SITE_URL}/posts/${post.slug}\n`);
  }

  if (!sendFlag) {
    console.log('Run with --send to send notifications to all subscribers.');
    return;
  }

  // Validate env vars
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.RESEND_AUDIENCE_ID
  ) {
    console.error("Missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  for (const post of newPosts) {
    console.log(`Sending notification for: ${post.title}...`);

    // Create broadcast
    const { data: broadcast, error: createError } =
      await resend.broadcasts.create({
        audienceId,
        from: "insights.codes <hello@insights.codes>",
        subject: `New post: ${post.title}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <p style="color: #737373; font-size: 13px; margin-bottom: 20px;">insights.codes</p>
            <h2 style="color: #e5e5e5; font-size: 20px; margin-bottom: 8px;">${post.title}</h2>
            <p style="color: #a3a3a3; line-height: 1.6; margin-bottom: 24px;">
              ${post.subtitle}
            </p>
            <a href="${SITE_URL}/posts/${post.slug}"
               style="display: inline-block; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Read post
            </a>
          </div>
        `,
      });

    if (createError) {
      console.error(`Failed to create broadcast:`, createError);
      continue;
    }

    // Send the broadcast
    if (broadcast?.id) {
      const { error: sendError } = await resend.broadcasts.send(broadcast.id);
      if (sendError) {
        console.error(`Failed to send broadcast:`, sendError);
        continue;
      }
      console.log(`  Sent!`);
    }
  }

  // Update notified slugs
  const updated = [...notified, ...newPosts.map((p) => p.slug)];
  fs.writeFileSync(NOTIFIED_PATH, JSON.stringify(updated, null, 2) + "\n");
  console.log(`\nUpdated notified-slugs.json with ${newPosts.length} new slug(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
