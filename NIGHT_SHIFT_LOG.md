# Night Shift Log — Run #3 (Sprint 2)

**Date**: 2026-05-16
**Branch**: `night-shift/sprint-2-20260516`
**Mode**: NIGHT_SHIFT_MODE=true (mock + local only)

## Budget
- Max stories: 7
- Max time/story: 30 min
- Max retries: 3

## Stories

- [ ] S2-01 Transition use cases (check-in / start-service / complete / no-show / mark-deposit-paid)
- [ ] S2-02 ListBookingsForDate query
- [ ] S2-03 RealtimeBroadcaster port + mock + wire
- [ ] S2-04 WalkInBookingUseCase
- [ ] S2-05 Dashboard day-view grid + walk-in form skeleton
- [ ] S2-06 Full lifecycle integration test
- [ ] S2-07 Report + PENDING_HUMAN refresh

## Skipped (need PH-001 Supabase)
- US-F2-002 backed by real Postgres → mock InMemoryBookingRepository only
- US-F3-002 real Supabase Realtime → MockRealtimeBroadcaster only
