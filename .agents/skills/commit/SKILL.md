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

2. **Draft the commit message(s)**

   Inspect the diff. If the changes are logically distinct (different features, fixes, or areas), **split them into multiple commits** rather than one combined commit.

   Each commit message must be a **single line** — no body, no footer, no blank lines:

   ```
   <type>(<optional scope>): <short imperative summary>
   ```

   Types: `feat`, `fix`, `refactor`, `chore`, `style`, `docs`, `test`, `perf`, `ci`, `build`

   Rules:
   - One line only — never add a body or footer
   - Max 72 chars, imperative mood ("add", "fix", "remove" — not "added", "fixes")
   - No trailing period
   - If the changes are too broad for one message, plan multiple commits (each with its own single-line message) and stage them separately
   - **Never** add `Co-Authored-By`, `Generated with`, or any attribution lines
   - **Never** add a footer referencing Claude Code, AI, or any tooling

3. **Show the message(s) and ask for approval**

   If planning multiple commits, list them all (each as a single line in a code block), then ask:

   > Do these commit messages look good? Reply **yes** to commit, or provide feedback / revised messages.

   If the agent supports structured prompts (e.g. Claude Code's `AskUserQuestion`), use it with:
   - Question: "Do these commit messages look good?"
   - Options:
     - "Yes, commit it" — Proceed with this message
     - "Edit first" — Type your revised message or feedback

   Either way, if the user provides feedback or a revised message:
   - Apply their feedback or use their text as the new message
   - Show the updated message again and ask once more before proceeding

4. **Stage and commit**

   Once approved, for each commit stage only the relevant files and commit with a single `-m` flag (no `\n`, no multi-line heredoc):

   ```bash
   git add <relevant files>
   git commit -m "<single-line message>"
   ```

   If committing all changes in one go:

   ```bash
   git add -A
   git commit -m "<single-line message>"
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
