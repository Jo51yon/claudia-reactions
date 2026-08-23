# Changelog

Semantic versioning: MAJOR = a prop, exported type, or default behaviour changed in a way that
could break an existing consumer without any code change on their side. MINOR = additive only.
Consuming projects should pin to a tag (`#v1.0.0`), never `#main`.

## v1.0.0 — 2026-08-23

First release. `ClaudiaReactions` -- ported from SafeSpaces' real `content_reactions` table
and its actual `ContentReactions.tsx` (checked both before this): toggle-on-click, grouped
counts, an add-a-reaction picker.

Uses `entity_type`/`entity_id`, matching the same polymorphic convention already established
in `@jo51yon/claudia-comments` -- one consistent real naming across both packages, this one
following that one rather than each package inventing its own.

The real SafeSpaces default emoji set (heart/thumbs_up/clap/laugh/wow/sad/fire) ships as the
default -- real, proven choices, not invented -- fully overridable via `kinds`.

Schema (`claudia_reactions`) proven correct with real RLS tests before the UI was built,
including two real forge/hijack attempts, not just the happy path: a genuine session's attempt
to insert a reaction claiming a different user's id is refused (the actual policy-violation
error); a different user's attempt to delete someone else's reaction is confirmed to silently
affect zero rows by re-reading the row afterward, not just trusting the absence of an error.

**Known consumers at this tag:** none yet at release.
