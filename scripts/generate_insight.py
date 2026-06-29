#!/usr/bin/env python3
"""
Generate one daily "AI Thought Leadership" article and prepend it to index.html.

Runs in GitHub Actions. Uses the Claude Messages API (claude-opus-4-8) with the
server-side web_search tool to ground the article in the latest AI news, written
in Navang Gandhi's voice as a Security & AI leader. The new article is inserted
immediately after the `<!-- ARTICLES:TOP ... -->` marker (newest on top).

Env:
  ANTHROPIC_API_KEY  (required) — Anthropic API key
  FORCE              (optional) — "true" to post even if today's article exists
"""
import os
import re
import sys
import datetime
import zoneinfo

import anthropic

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(REPO_ROOT, "index.html")
MARKER = "<!-- ARTICLES:TOP"
MODEL = "claude-opus-4-8"


def main() -> int:
    force = os.environ.get("FORCE", "").strip().lower() in ("1", "true", "yes")

    now = datetime.datetime.now(zoneinfo.ZoneInfo("America/New_York"))
    display_date = now.strftime("%B %-d, %Y")   # e.g. "June 30, 2026"
    date_id = now.strftime("%Y-%m-%d")           # e.g. "2026-06-30"

    with open(INDEX, encoding="utf-8") as f:
        html = f.read()

    # Idempotency: skip if an article with today's date pill already exists.
    date_token = f'class="insight-card__date">{display_date}<'
    if not force and date_token in html:
        print(f"Article for {display_date} already present — skipping.")
        return 0

    if MARKER not in html:
        print("ERROR: ARTICLES:TOP marker not found in index.html.", file=sys.stderr)
        return 1

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

    system = f"""You are writing ONE daily "AI Thought Leadership" article for Navang Gandhi's personal website. Navang is a Security and AI Leader who advises financial-services and regulated enterprises. Write in his voice: an executive, security-and-AI-leadership perspective that connects the latest AI news to its implications for security, governance, and risk in regulated / financial-services enterprises. Confident, specific, no hype.

First, use web search to find genuine AI news from the last 1-2 days at the intersection of AI with enterprise security, agentic AI, LLMs, AI governance / regulation, identity, and financial services. Capture 3-5 credible source URLs (publisher + title).

Then output ONLY a single HTML <article> block — no markdown, no code fences, no commentary before or after. Use EXACTLY this structure and these class names:

<article class="insight-card glass reveal">
  <div class="insight-card__visual">
    <svg viewBox="0 0 800 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="DESCRIBE THE VISUAL">
      <!-- a striking, ORIGINAL abstract SVG using only the brand colors #8b5cf6, #ec4899, #22d3ee -->
    </svg>
    <span class="insight-card__tag">SHORT TAG</span>
  </div>
  <div class="insight-card__body">
    <span class="insight-card__date">{display_date}</span>
    <h3 class="insight-card__title">TITLE</h3>
    <p>PARAGRAPH 1</p>
    <p>PARAGRAPH 2</p>
    <p>PARAGRAPH 3</p>
    <h4 class="insight-card__links-title">Important links</h4>
    <ul class="insight-card__links">
      <li><a href="URL" target="_blank" rel="noopener">SOURCE TITLE — PUBLISHER</a></li>
      <!-- 3 to 5 real links from your search -->
    </ul>
  </div>
</article>

HARD REQUIREMENTS:
- The date pill must read exactly "{display_date}".
- Make EVERY svg id (gradients, filters, etc.) unique by suffixing "-{date_id}" — e.g. id="grad-{date_id}" referenced as fill="url(#grad-{date_id})" — so it never collides with other articles already on the page.
- About 3 short paragraphs. A concise title and a 2-3 word tag.
- 3 to 5 real source links with real URLs taken from your search results.
- Vary the SVG motif day to day (waves, orbits, circuitry, bar towers, constellation, neural mesh, shield) — do not always draw the same thing.
- Output the <article>...</article> and nothing else."""

    user = f"Write today's AI thought-leadership article. Today is {display_date}."
    tools = [{"type": "web_search_20260209", "name": "web_search", "max_uses": 8}]

    messages = [{"role": "user", "content": user}]
    response = None
    for _ in range(6):  # server-tool loops can return pause_turn; re-send to continue
        response = client.messages.create(
            model=MODEL,
            max_tokens=8000,
            system=system,
            tools=tools,
            messages=messages,
        )
        if response.stop_reason == "pause_turn":
            messages = [
                {"role": "user", "content": user},
                {"role": "assistant", "content": response.content},
            ]
            continue
        break

    text = "".join(b.text for b in response.content if b.type == "text").strip()

    # Strip accidental code fences if the model added them.
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```$", "", text).strip()

    match = re.search(r"<article\b.*?</article>", text, re.DOTALL)
    if not match:
        print("ERROR: model output did not contain an <article> block.", file=sys.stderr)
        print(text[:2000], file=sys.stderr)
        return 1
    article = match.group(0).strip()

    # Insert immediately after the marker comment line (newest on top).
    idx = html.index(MARKER)
    line_end = html.index("\n", idx) + 1
    new_html = html[:line_end] + "          " + article + "\n" + html[line_end:]

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"Inserted article for {display_date}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
