# Pull Request

## Sumamry
<!-- 1-3 bullet points: what + why -->

## Linked issue / story
- Story: US-XXX
- Refs: SRS / ADR

## Type
- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] chore

## Pre-merge checklist
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes (coverage ≥ 80% for changed business logic)
- [ ] No `console.log` in production code
- [ ] No hardcoded secrets / API keys
- [ ] Multi-tenant: cross-tenant isolation tested (if touching RLS tables)
- [ ] Audit log added (if action critical: payment, booking state change)
- [ ] CHANGELOG.md updated (if user-facing change)

## Test plan
<!-- How to verify -->
