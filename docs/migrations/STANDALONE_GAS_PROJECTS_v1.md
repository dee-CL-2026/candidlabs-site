# Standalone GAS Projects Audit v1.0

> Generated 2026-02-25.
> Purpose: Identify any GAS projects that exist online but are NOT tracked in the local filesystem/git.

---

## Method

### What we CAN verify (filesystem + git)

30 unique scriptIds were extracted from `.clasp.json` files across the `candid-labs` repo (all branches, `origin/main` being the superset). Every scriptId maps to a specific Google Apps Script project in the cloud.

### What we CANNOT verify yet

Whether additional GAS projects exist online under the `candidmixers.com` / `candidlabs.com` Google Workspace accounts that are NOT represented by any `.clasp.json` in the repos.

**This is a real risk.** Google Apps Script projects can be:
- Bound to a Google Sheet/Doc/Form (never cloned via clasp)
- Created in the Apps Script web IDE and never pushed to git
- Shared with the account by other users

---

## Apps Script API Status

### Local credentials check

```
~/.clasprc.json — NOT FOUND
~/.clasp.json   — NOT FOUND
```

**CLASP is not authenticated.** No API access to list remote projects.

### Setup Steps to Enable Remote Project Listing

```bash
# Step 1: Install clasp globally
npm install -g @google/clasp

# Step 2: Enable the Apps Script API
# Visit: https://script.google.com/home/usersettings
# Toggle "Google Apps Script API" to ON

# Step 3: Authenticate clasp
clasp login
# This opens a browser for Google OAuth consent
# Authenticate with the candidmixers.com account that owns the projects

# Step 4: List all projects
clasp list
# Output format: project-name – scriptId – last-modified

# Step 5: Export the list for comparison
clasp list > /tmp/clasp_projects.txt

# Step 6: Compare against known scriptIds
# The 30 scriptIds from GAS_INVENTORY_v2.md should all appear.
# Any ADDITIONAL entries = standalone projects not in git.
```

---

## Filesystem Scan Results

### Locations searched (exhaustive)

| Location | .gs files | .js GAS files | .clasp.json | appsscript.json |
|----------|-----------|---------------|-------------|-----------------|
| `/Users/dieterwerwath/1.Vault/01_PROJECTS/Candid/Repos/candid-labs/` | 21 | ~260 | 30 | 31 |
| `/Users/dieterwerwath/1.Vault/01_PROJECTS/Candid/Repos/candid-labs-tiered/` | 0 | 8 | 0 | 1 |
| `/Users/dieterwerwath/1.Vault/01_PROJECTS/Candid/Repos/candidlabs-site/` | 0 | 0 (Workers JS) | 0 | 0 |
| `/Users/dieterwerwath/1.Vault/98_QUARANTINE/` | 21 + 21 (2 backup sets) | ~260 + ~260 | 30 + 30 | 31 + 31 |
| `/Users/dieterwerwath/Desktop/` | 0 | 0 | 0 | 0 |
| `/Users/dieterwerwath/Documents/` | 0 | 0 | 0 | 0 |
| `/Users/dieterwerwath/Downloads/` | 0 | 0 | 0 | 0 |
| Other home directories | 0 | 0 | 0 | 0 |

### Backup copies in quarantine

Two identical mirror sets dated 2026-02-19:
- `98_QUARANTINE/legacy_experiments/repos_20260219/candid-labs/` — full copy
- `98_QUARANTINE/legacy_experiments/deprecated_05_REPOS_20260219/candid-labs/` — full copy

These contain the same 30 .clasp.json scriptIds and the same code files. No unique projects found in quarantine.

---

## Known ScriptId → Filesystem Mapping

All 30 scriptIds map to filesystem directories. No orphans from filesystem side.

| scriptId (prefix) | Filesystem path | Git-tracked | Has code |
|-------------------|----------------|-------------|----------|
| `1SY3f8dK...` | PLATFORM/candid-labs-core-os | Yes (main) | Yes (14 files) |
| `1BNRlOSu...` | PLATFORM/candid-labs-loan-tracker | Yes (main) | Yes (25 files) |
| `1adKj1SN...` | PLATFORM/candid-labs-platform | Yes (main) | Yes (8 files) |
| `1OJcQdB_...` | PLATFORM/candid-labs-production-master | Yes (main) | Yes (41 files) |
| `1i6M0pLz...` | PLATFORM/candid-labs-sales-master | Yes (main) | Yes (44 files) |
| `1D-55fwq...` | PLATFORM/candid-labs-sales-tool | Yes (main) | Yes (21 files) |
| `1qhYC88q...` | PLATFORM/candid-os-script-discovery-engine | Yes (main) | Yes (4 files) |
| `1qO29v3N...` | PLATFORM/key-account-agreement-generator | Yes (main) | Yes (25 files) |
| `1N5HsPBz...` | QUARANTINE/surgical-strike | Yes (main) | Yes (22 files) |
| `1G7fHdoP...` | LEGACY/loan-tracker | Yes (main) | Yes (14 files) |
| `12E0GgPF...` | LEGACY/production-master | Yes (main) | Yes (13 files) |
| `11xr4-Q4...` | LEGACY/sales-master | Yes (main) | Yes (23 files) |
| `109eEZrg...` | LEGACY/sales-tool | Yes (main) | Yes (4 files) |
| `1rMFYRgf...` | LEGACY/_archived_shims/os-script-directory | Yes (main) | Yes (1 file) |
| `1Vix6cjK...` | STAGING/candid-data-legacy | Yes (main) | Yes (1 file) |
| `1mRIoHqz...` | STAGING/candid-legacy | Yes (main) | Yes (7 files) |
| `1xeUttQf...` | STAGING/candid-scripts-archive | Yes (main) | Yes (3 files) |
| `1CM6P_Zx...` | STAGING/contacts-util | Yes (main) | Yes (2 files) |
| `1x5psvVD...` | STAGING/envision | Yes (main) | Yes (2 files) |
| `19I5TAa7...` | STAGING/fingers-crossed | Yes (main) | Yes (7 files) |
| `1B1dx3CO...` | STAGING/gd-projects | Yes (main) | Yes (1 file) |
| `1ZsVskfZ...` | STAGING/google-drive-functions | Yes (main) | Yes (4 files) |
| `1C3wtEgS...` | STAGING/my-own-stuff | Yes (main) | Yes (6 files) |
| `144KOAER...` | STAGING/nap-test | Yes (main) | Yes (1 file) |
| `1DPS3yk8...` | STAGING/personal-scripts-master | Yes (main) | Yes (13 files) |
| `1RRLpRCX...` | STAGING/satellite-discovery | Yes (main) | Yes (2 files) |
| `14HIyxZp...` | STAGING/untitled-v1 | Yes (main) | Yes (1 file) |
| `14CdGxG3...` | STAGING/untitled-v2 | Yes (main) | Yes (1 file) |
| `1vY2SMzj...` | STAGING/untitled-v3 | Yes (main) | Yes (1 file) |
| `16Oei1qK...` | legacy_decommissioner | Yes (main) | Yes (1 file) |

**Result: 30/30 scriptIds accounted for. Zero filesystem orphans.**

---

## Potential Untracked Projects (Hypothetical)

These categories of GAS projects would NOT appear in the filesystem scan:

1. **Sheet-bound scripts** — Apps Script projects embedded in Google Sheets/Docs/Forms. These are only visible via the Apps Script API or by opening the parent document. They would not have been `clasp pull`-ed.

2. **Shared-with-me projects** — GAS projects owned by other users but shared with the candidmixers.com account.

3. **Organization-deployed scripts** — Add-ons or scripts deployed at the Google Workspace org level.

4. **Deleted-from-repo but still live** — If a clasp project was ever pushed then its `.clasp.json` removed from git, the online project would still exist but be invisible locally.

**To close this gap, run `clasp list` as described above.**

---

## Verdict

| Finding | Status |
|---------|--------|
| All 30 scriptIds map to filesystem + git | CONFIRMED |
| All 30 projects have real source code | CONFIRMED |
| No orphan GAS files outside `candid-labs` repo | CONFIRMED |
| Quarantine copies are mirrors (no unique code) | CONFIRMED |
| No GAS files in Desktop/Documents/Downloads | CONFIRMED |
| No GAS files in non-Candid projects | CONFIRMED |
| Complete list of online GAS projects | **UNVERIFIABLE** without `clasp list` |
| Sheet-bound scripts accounted for | **UNVERIFIABLE** without Apps Script API |

**Next action required:** Run `clasp login` + `clasp list` with the candidmixers.com account to close the audit.
