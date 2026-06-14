---
name: pr
description: Create a GitHub pull request for the current branch. Shows the PR title and description for approval before submitting. No AI attribution, no test checklist.
license: MIT
metadata:
  author: Renzo Telenta
  version: "1.0"
---

Create a pull request for the current branch against the main branch. Show the PR content to the user for approval before submitting. Never include AI attribution or test verification sections.

---

**Steps**

1. **Gather context**

   Run these in parallel:

   ```bash
   git branch --show-current
   git log main...HEAD --oneline
   git diff main...HEAD
   ```

   Also check if a remote tracking branch exists:

   ```bash
   git status -sb
   ```

2. **Draft the PR title and body**

   Using the commits and diff, write:

   **Title**: Short, imperative, under 70 characters. Describes what the change does — not how it was made.

   **Body**: Explain what this change does and why. Focus on:
   - What problem it solves or what feature it adds
   - Any important implementation decisions or trade-offs worth noting
   - Context the reviewer needs to understand the change

   Format:

   ```
   ## What

   <1-3 bullet points describing what changed>

   ## Why

   <1-2 sentences on motivation — skip if obvious from What>
   ```

   Rules:
   - **Never** include a "Test plan" or "Testing" section
   - **Never** add `🤖 Generated with Claude Code` or any similar footer
   - **Never** mention Claude, AI, or any tooling in the PR
   - Keep it factual and concise — no marketing language

3. **Show the PR content and ask for approval**

   Display the full title and body in a code block, then ask:

   > Does this pull request description look good? Reply **yes** to create the PR, or provide feedback / revised content to update it.

   If the agent supports structured prompts (e.g. Claude Code's `AskUserQuestion`), use it with:
   - Question: "Does this pull request description look good?"
   - Options:
     - "Yes, create the PR" — Submit this PR to GitHub
     - "Edit first" — Type your changes or feedback

   Either way, if the user provides feedback or revised content:
   - Apply their feedback or use their revised content
   - Show the updated PR content again and ask once more before proceeding

4. **Push if needed**

   If the current branch has no remote tracking branch, push it first:

   ```bash
   git push -u origin <branch-name>
   ```

5. **Create the PR**

   Once approved:

   ```bash
   gh pr create --title "<title>" --body "$(cat <<'EOF'
   <body>
   EOF
   )"
   ```

   Target base branch: `main` (or `master` if that's the repo default — check with `git remote show origin | grep HEAD`).

6. **Return the PR URL**

   Show the URL returned by `gh pr create` so the user can open it.

**Guardrails**

- Never skip the approval step
- Never include test checklists, attribution, or AI-generated footers
- If there are no commits ahead of main, tell the user there is nothing to PR
- If `gh` is not authenticated, tell the user to run `gh auth login` first
