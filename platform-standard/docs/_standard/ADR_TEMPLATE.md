# ADR Template

> Use this template for all Architectural Decision Records. Copy this file to `DECISIONS/ADR-NNNN-slug.md` and fill in each section.

---

```markdown
# ADR-NNNN: <Title>

## Status

<Proposed | Accepted | Deprecated | Superseded by ADR-NNNN> — <DATE>

## Context

What is the issue or situation that motivates this decision? Include relevant
background, constraints, and forces at play. State facts, not opinions.

## Decision

What is the change that is being proposed or has been agreed upon? Be specific
about what will be created, modified, or removed.

## Consequences

### Positive

- What becomes easier or better as a result of this decision?

### Negative

- What becomes harder or worse? What new risks are introduced?

### Mitigation

- How will the negative consequences be addressed?

## Version Impact

Does this decision require a version bump?

- [ ] Standard version bump (MAJOR | MINOR | PATCH) — reason:
- [ ] Implementation version bump — reason:
- [ ] No version impact
```

---

## Filing Rules

1. Number ADRs sequentially: `ADR-0001`, `ADR-0002`, etc.
2. Use kebab-case slugs: `ADR-0001-initial-architecture.md`.
3. ADRs are **append-only**. Never edit an accepted ADR. To change a decision, create a new ADR that supersedes the old one.
4. Mark superseded ADRs with: `Superseded by ADR-NNNN — <DATE>`.
5. Every implementation must have at least `ADR-0001` documenting the initial architecture decision.
