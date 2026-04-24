# Claude Code memory (for cross-machine continuity)

Claude Code keeps per-project memory in a local folder on each machine,
which does **not** sync automatically when you move between PCs. This
folder is a committed snapshot of the memory files so that:

- You can see what context Claude has accumulated about this project.
- When setting up the project on a new machine, you can restore that
  context by copying these files to the machine-local memory path.

## Files

- `MEMORY.md` — index of memory entries (always loaded).
- `project_icoming_rebuild.md` — the main project-context memory.

## Restoring on a new PC

On the new machine, after cloning this repo and opening Claude Code:

1. Find your per-machine memory path. On Windows, it's typically:
   `C:\Users\<YOU>\.claude\projects\D--vscode-icoming\memory\`
   (The folder name mirrors the project's working directory; replace
   `D--vscode-icoming` with whatever path you cloned to, flattened the
   same way.)
2. Create that folder if it doesn't exist.
3. Copy `MEMORY.md` and `project_icoming_rebuild.md` from this
   `docs/claude-memory/` directory into it.
4. Open Claude Code in the project — it will pick up the memory
   automatically.

## When updating memory

When Claude writes new memory entries during a session, they live on
the local machine. To keep the committed snapshot up to date, either:

- Periodically copy the machine-local memory folder back into this
  `docs/claude-memory/` directory and commit, or
- Ask Claude to do it: "sync my local Claude memory files into the
  repo's `docs/claude-memory/` folder".
