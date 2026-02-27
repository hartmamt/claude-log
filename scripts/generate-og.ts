import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import * as fs from "fs";
import * as path from "path";

async function generateOG() {
  // Load JetBrains Mono for the monospace text
  const fontPath = path.join(
    process.cwd(),
    "node_modules",
    "@fontsource",
    "jetbrains-mono",
    "files",
    "jetbrains-mono-latin-700-normal.woff"
  );

  let fontData: ArrayBuffer;

  if (fs.existsSync(fontPath)) {
    fontData = fs.readFileSync(fontPath).buffer as ArrayBuffer;
  } else {
    // Fallback: fetch from GitHub-hosted font
    const res = await fetch(
      "https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.304/fonts/ttf/JetBrainsMono-Bold.ttf"
    );
    if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
    fontData = await res.arrayBuffer();
  }

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#0a0a0a",
          padding: "80px",
          fontFamily: "JetBrains Mono",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                color: "#10b981",
                fontSize: 72,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              },
              children: "insights.codes",
            },
          },
          {
            type: "div",
            props: {
              style: {
                color: "#e4e4e7",
                fontSize: 36,
                fontWeight: 700,
                marginBottom: "40px",
                lineHeight: 1.3,
              },
              children: "Notes on building with AI",
            },
          },
          {
            type: "div",
            props: {
              style: {
                color: "#a1a1aa",
                fontSize: 22,
                lineHeight: 1.5,
                maxWidth: "800px",
              },
              children:
                "Real patterns from real projects.",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "32px",
                marginTop: "48px",
                fontSize: 20,
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { color: "#10b981" },
                    children: "insights.codes",
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "#3f3f46" },
                    children: "/",
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { color: "#a1a1aa" },
                    children: "@matthew_hartman",
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "JetBrains Mono",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const png = resvg.render().asPng();

  const outPath = path.join(process.cwd(), "public", "og.png");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  console.log(`Generated OG image → public/og.png (${png.length} bytes)`);
}

generateOG().catch(console.error);
