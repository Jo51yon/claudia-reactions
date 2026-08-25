# Changelog

Semantic versioning: MAJOR = a prop, exported type, or default behaviour changed in a way that
could break an existing consumer without any code change on their side. MINOR = additive only.
Consuming projects should pin to a tag (`#v1.0.0`), never `#main`.

## v1.1.0 — 2026-08-24

Additive. `ClaudiaReaction.rating_value` (a real, non-optional `number | null` field, matching
the real database shape exactly -- always present in a real query result, null except when
`reaction_type` is 'star'). Found while checking SafeSpaces' real `blog_ratings` table:
its rating_type enum overlaps heavily with what this package already covers (thumbs_up, clap,
etc. are the same concept) -- only 'star' (a numeric average rating) is genuinely different in
kind. Rather than a redundant parallel table, this is one real, additive column;
@jo51yon/claudia-ratings is the real, new star-picker UI built on top of it.

Confirmed additive via check-breaking-exports.mjs, but honestly noted: a consumer manually
CONSTRUCTING a ClaudiaReaction object literal (not just reading one from a real query) will
need this new field too, since it is not marked optional -- deliberately, to match the real
data shape precisely rather than pretend the column might not be there.

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
