# Code Review Instructions

When there is code review feedback, handle it autonomously.

## Default workflow

1. Collect all review comments for the pull request.
2. For each comment decide:
   - Valid: fix the code and reply acknowledging the fix with a one-sentence explanation.
   - Irrelevant or intentional: reply with a concise technical reason and do not change the code.
3. Post replies in the same PR thread where the comments appear.
4. Act on feedback and post replies without waiting for approval unless the comment requires product input.

## Tone for replies

- Be direct and brief (one to three sentences).
- When pushing back, cite concrete design reasons.
- Avoid filler or polite platitudes.

## What counts as irrelevant

- Suggestions that conflict with deliberate design choices.
- Style preferences that contradict established project conventions.
- Issues already addressed in later commits within the same PR.

## Notes

- If a comment raises a genuine design question that needs product input, ask for guidance before changing code.
- Keep replies focused and traceable (short explanation or reference to the fix).
