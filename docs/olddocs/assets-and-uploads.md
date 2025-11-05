## Assets & Uploads Structure

Static product/marketing UI images live in `backend/src/assets` and are served at the runtime path `/api/assets/<filename>` by `server.js`:

```js
app.use('/api/assets', express.static(path.resolve(process.cwd(), 'src/assets')));
```

User‑generated uploaded files (resources) are stored in `backend/uploads` (gitignored except `.gitkeep`) and exposed at `/<UPLOADS_DIR>/...` where `UPLOADS_DIR` defaults to `uploads`:

```js
app.use(`/${env.uploadsDir}`, express.static(path.resolve(process.cwd(), env.uploadsDir)));
```

| Category | Folder | Served Path | Notes |
|----------|--------|-------------|-------|
| Static UI images | `backend/src/assets` | `/api/assets/*` | Versioned in git; rename with kebab-case recommended |
| User uploads | `backend/uploads` | `/uploads/*` (default) | Gitignored; size limited by `MAX_UPLOAD_SIZE_MB` |

### Current Filenames (Audit)
```
`aipoweredtashmanageschedule.png` (typo)
`aipoweredtask.png`
`attendeceMonitor.png`
`cta banner.png`
`discussion room.png`
`hero illustration.png`
`learntrack.png`
`logo.png`
`mainLogo.png`
`mode-dark.png`
`mode-light.png`
`resource vault.png`
`Resource.png`
`smartdashboardcard.png`
`snippets.png`
`solutiondb.png`
`tech stack.png`
```

### Recommended Normalized Renames (Deferred)
| Current | Suggested | Reason |
|---------|-----------|--------|
hero illustration.png | hero-illustration.png | Spaces → hyphens |
resource vault.png | resource-vault.png | Consistency |
discussion room.png | discussion-room.png | Consistency |
cta banner.png | cta-banner.png | Consistency |
attendeceMonitor.png | attendance-monitor.png | Spelling + style |
aipoweredtashmanageschedule.png | ai-powered-task-manage-schedule.png | Typos + readability |
aipoweredtask.png | ai-powered-task.png | Readability |
Resource.png | resource-placeholder.png | Clarify purpose & case |
smartdashboardcard.png | smart-dashboard-card.png | Readability |
solutiondb.png | solution-db.png | Add hyphen |
tech stack.png | tech-stack.png | Spaces → hyphens |
mainLogo.png | main-logo.png | Consistency |

Because images are binary and renaming impacts existing references, this is staged as a deferred clean-up task (no functional issue currently). All references already resolve correctly.

### Verification Script
Use `node scripts/verify-assets.js` to list all `/api/assets/` references in the frontend and flag any missing files.

### Uploads Behavior
- Resource file uploads go through `POST /api/uploads/file` (multer) → store under `backend/uploads`.
- Responses include a relative path (e.g., `/uploads/<hash>.png`) saved in resource records.
- Clean-up or pruning not yet implemented; consider later adding a scheduled job to remove orphaned files.

---
Last updated: Pre-Phase 3 polishing completion.
