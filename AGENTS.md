<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Plan files

- **Active plans**: Put every plan document (roadmaps, task breakdowns, design notes treated as a “plan”) under `plan/active/`. Do not leave new plans at the repo root or scattered elsewhere unless there is an exceptional, documented reason.
- **Completed plans**: When a plan is finished, move its file(s) from `plan/active/` to `plan/done/` for archival. Prefer moving the same file(s) rather than duplicating, so history stays in one place.
