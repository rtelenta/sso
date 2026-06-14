---
name: commit
description: Stage and commit current changes using conventional commits format. Shows the commit message for approval before committing. No AI attribution.
license: MIT
metadata:
  author: Renzo Telenta
  version: "1.0"
---

Stage all changes and create a conventional commit. Show the message to the user for approval before committing. Never include AI attribution.

---

**Steps**

1. **Gather the diff**

   Run these in parallel:

   ```bash
   git diff --cached
   git diff
   git status
   ```

2. **Draft the commit message**

   Using the staged and unstaged changes, write a conventional commit message following this format:

   ```
   <type>(<optional scope>): <short imperative summary>

   <optional body — only if changes need explanation beyond the summary>
   ```

   Types: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`, `test`, `perf`, `ci`, `build`

   Rules:
   - Summary line: max 72 chars, imperative mood ("add", "fix", "remove" — not "added", "fixes")
   - No trailing period on the summary line
   - Body only when the why/how is non-obvious from the diff
   - **Never** add `Co-Authored-By`, `Generated with`, or any attribution lines
   - **Never** add a footer referencing Claude Code, AI, or any tooling

3. **Show the message and ask for approval**

   Display the full commit message in a code block, then ask:

   > Does this commit message look good? Reply **yes** to commit, or provide feedback / a revised message to update it.

   If the agent supports structured prompts (e.g. Claude Code's `AskUserQuestion`), use it with:
   - Question: "Does this commit message look good?"
   - Options:
     - "Yes, commit it" — Proceed with this message
     - "Edit first" — Type your revised message or feedback

   Either way, if the user provides feedback or a revised message:
   - Apply their feedback or use their text as the new message
   - Show the updated message again and ask once more before proceeding

4. **Stage and commit**

   Once approved:

   ```bash
   git add -A
   git commit -m "<approved message>"
   ```

   If there are specific files to exclude (e.g. `.env`), stage selectively with `git add` per file instead.

5. **Confirm**

   Show the one-line output of:

   ```bash
   git log --oneline -1
   ```

**Guardrails**

- Never skip the approval step
- Never include attribution, co-author, or AI-generated footers in the commit
- If nothing is staged or modified, tell the user there is nothing to commit
