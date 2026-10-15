# Submission checklist

- Live page: Deployed live via GitHub Actions at [https://katmarite.github.io/Casino-Scrapper/](https://katmarite.github.io/Casino-Scrapper/)
- Git repository: Public at [https://github.com/KatMarite/Casino-Scrapper](https://github.com/KatMarite/Casino-Scrapper)
- Script: `scraper.py` — completed, with Google Gemini API support added alongside OpenAI.
- JSON output: `dist/bonuses.json` successfully generated from a live scrape and LLM extraction run at 14:47 SAST. Not manually filled.
- Written part: `PRODUCTION_PLAN.md` completed and rewritten in own voice, detailing infrastructure, database schema, backups, scheduling, and monitoring.
- Validation: 11 offline Python tests pass; frontend JavaScript syntax check passes. Scraped data verified against live source page — all three records match exactly.
- Blocker resolution: switched to Google Gemini API (`gemini-3.6-flash`) after initial OpenAI 401 error.

## Five lines on AI

1. I used an AI coding assistant (Antigravity / Gemini) to help implement the scraper, add Gemini API support, debug API errors, and verify output against the live source.
2. The scraper was extended to support Google Gemini (`GEMINI_API_KEY`) in addition to OpenAI; the provider is auto-detected from whichever key is set in the environment.
3. The AI assistant identified that `gemini-2.0-flash` was deprecated and discovered `gemini-3.5-flash` as the working model by querying the available models list from the API.
4. Retry logic with exponential backoff was added for transient 503/429 errors after encountering repeated "high demand" failures on the Gemini endpoint.
5. Source-matching validation and tests reject invented currencies, changed bonus text, and incorrect wagering multipliers rather than trusting schema compliance alone; this held true in the live Gemini run.

## Time

Work started on 15 October 2026 at approximately 13:22 SAST (11:22 UTC). Scrape completed successfully at 14:47 SAST. Submission updated at 14:55 SAST. Total elapsed time (including API credential setup and debugging): approximately 1 hour 33 minutes.
