# Casino bonus scraper

A lightweight Python scraper and responsive static web application for the screening task. Python 3.10+ is the only local dependency; standard library only (no external packages need installing). The scraper uses LLM structured outputs via Google Gemini API (`gemini-3.8-flash` / `gemini-3.6-flash`) or OpenAI Structured Outputs (`gpt-4o-mini`).

## Current status

- **Live Site**: [https://katmarite.github.io/Casino-Scrapper/](https://katmarite.github.io/Casino-Scrapper/)
- **Repository**: [https://github.com/KatMarite/Casino-Scrapper](https://github.com/KatMarite/Casino-Scrapper)
- **Scrape & Extraction**: Successfully executed against live source [BonusReviewers](https://www.bonusreviewers.com/casino-comparison) using Google Gemini (`gemini-3.6-flash`).
- **Data output**: `dist/bonuses.json` contains exactly 3 real, verified casino bonus offers (Betandplay Casino, Rooli Casino, Jackpoty).
- **Validation & Tests**: All 11 offline unit tests pass, and frontend JavaScript syntax check passes. All scraped fields strictly match raw source text.
- **Production Plan**: Production scaling and deployment plan documented in [`PRODUCTION_PLAN.md`](PRODUCTION_PLAN.md).

## Install and run

1. Install Python 3.10 or newer and clone this repository:
   ```sh
   git clone https://github.com/KatMarite/Casino-Scrapper.git
   cd Casino-Scrapper
   ```
2. Set an API key in your environment for your preferred provider:
   - **Google Gemini** (tested & default):
     ```sh
     # Windows (PowerShell)
     $env:GEMINI_API_KEY="your-gemini-api-key"
     # Linux/macOS
     export GEMINI_API_KEY="your-gemini-api-key"
     ```
   - **OpenAI**:
     ```sh
     # Windows (PowerShell)
     $env:OPENAI_API_KEY="your-openai-api-key"
     # Linux/macOS
     export OPENAI_API_KEY="your-openai-api-key"
     ```
   *(Provider is auto-detected from whichever environment variable is set. Do not commit keys to version control.)*

3. Run the scraper:
   ```sh
   python scraper.py
   ```
   *(Windows users can also use `py scraper.py`.)*

### Optional CLI arguments

- `--provider {gemini,openai}`: Explicitly choose provider (auto-detected from environment if omitted).
- `--model MODEL_NAME`: Override model (defaults to `gemini-3.8-flash` for Gemini or `gpt-4o-mini` for OpenAI). Can also be set via `OPENAI_MODEL` environment variable.

### Output files

- `dist/bonuses.json`: The final validated JSON payload containing exactly three casinos with required fields: `casino`, `welcome_bonus`, numeric `wagering_requirement`, `minimum_deposit`, and provenance `source_url`.
- `evidence/source-fetch.json`: Audit log of the raw HTTP fetch, HTML SHA-256 hash, HTTP status, and robots.txt policy verification.
- `evidence/latest-run.json`: Complete audit trail including model metadata, extraction prompt, raw model response, token usage, and source evidence.

## View the page

### 1. Live deployed version
Visit the GitHub Pages deployment:
👉 **[https://katmarite.github.io/Casino-Scrapper/](https://katmarite.github.io/Casino-Scrapper/)**

### 2. Local preview
Run the local HTTP server:
```sh
python -m http.server 8000 --directory dist
```
Open [http://localhost:8000](http://localhost:8000). *(Always serve over HTTP; opening `index.html` directly from the filesystem may block fetch requests.)*

On desktop, offers are displayed in a clean responsive table; on mobile devices, rows stack into accessible, labelled cards. Network or data issues display user-friendly error banners rather than fallback mock data.

## Source and extraction

- **Source**: [BonusReviewers Casino Comparison](https://www.bonusreviewers.com/casino-comparison).
- **Robots & Ethics**: The scraper inspects `robots.txt` before making page requests, respects `crawl-delay` directives and user-agent rules, and halts if disallowed. No cookies, logins, or bypasses are used.
- **Selection**: Selects the first three complete, unambiguous bonus offers with concrete values for bonus, numeric wagering requirements, and deposit minimums. Ambiguous offers ("varies", ranges) are omitted.
- **LLM Extraction**: Extracted HTML terms are sent to the LLM with a strict JSON schema.
- **Deterministic Validation**: Local post-validation ensures every extracted string exists verbatim in the source terms, wagering multipliers are positive numbers, currencies and formatting are preserved, and source URLs are assigned deterministically by code.

## Tests

Run the test suite:
```sh
python -m unittest discover -s tests -v
node --check dist/app.js
```
The 11 unit tests run offline without network access or API keys, using synthetic HTML fixtures and mocked responses.

## Deployment

Static assets in `dist/` are automatically validated and deployed to GitHub Pages via GitHub Actions upon pushes to `main` or `master` (see `.github/workflows/pages.yml`). The workflow executes the test suite and verifies schema integrity before deploying.

## Documentation

- [`PRODUCTION_PLAN.md`](PRODUCTION_PLAN.md) — Production architecture, infrastructure choices, database schema, backup strategy, and cost analysis for scaling to 200 daily records.
- [`SUBMISSION.md`](SUBMISSION.md) — Submission checklist, AI disclosure, and timeline notes.
