---
description: Update the claude_log site with fresh /insights data
user_invocable: true
---

# Update Site

Regenerate the claude_log dev blog with fresh Claude Code insights data. Each run is archived and content accumulates across runs — posts get richer over time.

## Steps

1. **Copy insights data**: Copy the latest insights JSON from `~/.claude/usage-data/` into the project:
   ```
   cp ~/.claude/usage-data/facets/insights_data.json src/data/insights.json
   ```
   If that file doesn't exist, tell the user to run `/insights` in a Claude Code session first.

2. **Generate posts**: Run the post generator:
   ```
   npx tsx scripts/generate-posts.ts
   ```
   This will:
   - Archive the current insights.json to `src/data/insights-archive/YYYY-MM-DD.json`
   - Merge content across ALL archived runs (workflows, friction examples, stories accumulate)
   - Use latest run for stats/numbers (most accurate)
   - Anonymize product/client names
   - Convert second-person voice to first-person
   - Run a leak check for sensitive names
   - Output timeline, stats, and post index

3. **Verify no sensitive data**: Check the generator output for the "No sensitive names detected" message. If it warns about leaks, update the `ANONYMIZE_RULES` array in `scripts/generate-posts.ts` to add the new patterns.

4. **Build the site**:
   ```
   npm run build
   ```

5. **Verify all routes**: Serve the built site and check all routes return 200:
   ```
   npx serve out -p 3333
   ```
   Then verify: `/`, `/journey`, `/setup`, and all 7 post routes under `/posts/`.

6. **Report**: Tell the user what changed — how many archived runs were merged, new session counts, accumulated content stats.

## How Accumulation Works

Each `/insights` run produces different editorial content (different examples, stories, workflows). The generator merges across all archived runs:

- **Stats & numbers**: Always from the latest run (most accurate)
- **Narrative & key pattern**: Always from the latest run
- **Impressive workflows**: Union across all runs (deduped by title)
- **Friction examples**: Accumulated across all runs (deduped by similarity)
- **Usage patterns & tips**: Union across all runs (deduped by title)
- **Fun ending**: Picks the one with the most detail
- **On the horizon**: Union across all runs (deduped by title)

This means posts get richer every time you run `/insights` — new friction examples, new workflows, new stories all get added while stats stay current.

## Important

- **Slugs are stable**: Never change post slugs. They are used for external linking. The 7 slugs are: `how-i-use-claude-code`, `what-works`, `where-things-go-wrong`, `power-user-tips`, `the-story`, `whats-next`, `the-projects`.
- **Anonymization**: If /insights reveals new product names, client names, or other identifying details, add them to the `ANONYMIZE_RULES` array in `scripts/generate-posts.ts` before generating.
- **Voice**: The /insights narrative is written in second person. The generator converts it to first person. If any "You are" or "Your" slips through, fix the `secondToFirstPerson` function.
- **Archives**: Stored in `src/data/insights-archive/`. One file per day. Safe to commit — they're just JSON.
