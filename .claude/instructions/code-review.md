# Code Review Instructions

When Calixto mentions there is code review feedback (e.g. on a PR), handle it autonomously:

## Default workflow

1. **Fetch all review comments** from the PR using `gh api repos/.../pulls/comments`.
2. **For each comment, decide:**
   - **Valid** → fix the code, then reply acknowledging the fix (e.g. "Valid — fixed in this commit. [one sentence explaining what changed]").
   - **Irrelevant / intentional** → reply with a concise technical reason why the current approach is correct. Do NOT change the code.
3. **Reply directly on the GitHub thread** using `gh api repos/.../pulls/comments/<id>/replies -X POST -f body="..."`.
4. **Do not wait for Calixto's approval** before replying — act on the feedback and post the replies. Only ask if a comment reveals a genuine design question that needs product input.

## Tone for replies

- Direct and brief — one to three sentences.
- When pushing back, cite the concrete design reason (not just "it's intentional").
- No filler phrases like "great point" or "thank you for the feedback".

## What counts as irrelevant

- Suggestions to adopt a project pattern when the current deviation is deliberate (e.g. not extending `BaseEntity` for reference data).
- Style preferences that conflict with existing project conventions.
- Comments that flag a problem that has already been fixed in a later commit in the same PR.

## Notes

- Use `gh api` (not `gh pr review`) so replies land in the correct inline thread.
- If `jq` is unavailable, omit `| jq .html_url` — the raw response is fine.
- Replies are posted under Calixto's identity (the authenticated `gh` user).
