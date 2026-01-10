# Functional Requirements

## Authentication & Profile
- Registration: email/phone + OTP; accept ToS/Privacy; link guardian if minor.
- Login/Logout: secure sessions, device management (list/revoke devices), remember-me.
- Password/OTP Recovery: request code, verify, reset.
- Profile Management: view/update display name, avatar, bio, location consent, notification prefs.
- Account Deletion/Deactivation: soft-delete with data retention policy; reactivation flow.

## Student
- Discoverability toggle and schedule visibility toggle.
- Subscribe to academies and app usage (trial, paid tiers, tickets).
- View assignments (class-based, newly provided, searchable).
- Download assignments for offline (SQLite) and sync when online.
- Schedule assignments (date/time), visible to friends/classmates if enabled.
- Attempt assignments: solo or multiplayer (turn-based), with hints, effects, and emoji reactions.
- Track assignment status: uncompleted, completed, submitted.
- Submit assignments (sync local data to cloud submissions).
- Social: friend requests, approvals, view friends' schedules (if allowed).
 - Profile: view own profile; edit profile fields permitted by role/policy.

### Game Mechanics (Reading Focus)
- Paragraph gating: must complete required interactions for each paragraph/sentence (definitions, illustrations, fill-in-the-blanks, rearrangement) before advancing.
- Clues and feedback: contextual hints; particle effects for success/error; sound/animation feedback.
- Emotional engagement: themed mascots (e.g., encourager for success, zombie for failure) to reinforce motivation.
- Points & achievements: earn points for progress, streaks, and accuracy; unlock achievements and guardian-configured rewards.
- Solo vs multiplayer: in multiplayer, turns strictly control who can answer; others can react with emojis.

## Guardian/Parent
- Link/manage student profiles.
- Assign rewards and encouragement text tied to milestones.
- View progress, schedules, and submission outcomes.
- Manage subscription/payments.
 - Profile: view/edit own guardian profile; manage linked students.

## Tutor/Lecturer
- Create and manage academies and classes/modules.
- Create assignments: text, paragraphs, terms (nouns/figures) with definitions, illustrations, fill-in-the-blanks, rearrangement tasks.
- Specify tools/assets needed per assignment (illustrations, audio, PDFs).
- See student schedules/commitments (with consent/visibility rules).
 - Manage multiplayer rooms: lobby, admittance, designate host/master, start/stop session, handle player lifecycle events (join/leave/disconnect/reconnect).
- Review submissions, grade, and provide feedback.
 - Profile: view/edit tutor profile; manage academy affiliations.

## Academy Admin/Owner
- Manage tutors, classes, enrollment, visibility, and academy branding.

## System Admin
- Manage platform settings, moderation, analytics, and billing integrity.

## Cross-Cutting
- Notifications (schedules, invites, rewards, submissions, grades).
- Search across assignments/classes/academies.
- Privacy controls (discoverability, schedule visibility, friend-only).
- Offline-first with conflict resolution.
 - Audit trails for sensitive updates (roles, enrollments, schedules, grades).

## CRUD Baseline (Entity Operations)
All core entities support consistent CRUD operations, subject to role-based permissions and visibility/privacy rules:

- Users/Profiles
	- Create: registration (Student/Guardian/Tutor); Admin can provision roles.
	- Read: self may view full; others see limited fields per privacy.
	- Update: self-edit allowed fields; Admin can update roles/status.
	- Delete/Deactivate: self soft-delete; Admin can suspend/restore.

- Students
	- Create: register student or guardian-link flow; Admin bulk import.
	- Read: list/browse students (Admin/Academy Admin); classmates see minimal per visibility.
	- Update: student edits profile; Admin/Academy Admin can update enrollment.
	- Delete: soft-delete; remove from enrollments; retain submissions per policy.

- Guardians
	- Create: register guardian and link students (consent required).
	- Read/Update/Delete: same pattern as Students with guardian-specific fields.

- Academies
	- Create: Tutor/Owner.
	- Read: public listing; details per membership.
	- Update/Delete: Owner/Admin; deletion requires no active classes or archived.

- Classes/Modules
	- Create: Tutor/Academy Admin.
	- Read: enrolled users; catalog may be public.
	- Update/Delete: Tutor/Admin; deletion gated by assignment archival.

- Enrollments
	- Create: invite/join workflows.
	- Read: class roster (Tutor/Admin); student sees own enrollment.
	- Update/Delete: role changes; unenroll with audit.

- Friendships
	- Create: send request.
	- Read: list friends, pending, blocked.
	- Update: accept/decline/block.
	- Delete: unfriend/unblock.

- Assignments
	- Create: Tutor; includes content blocks and tools.
	- Read: enrolled students; searchable; newly provided view.
	- Update: Tutor edits; versioning recommended.
	- Delete: archive-only if attempts exist; hard-delete if none.

- Assignment Tools/Assets
	- Full CRUD with ownership checks; assets can be reused across assignments.

- Schedules
	- Create: student schedules per assignment; visibility: PRIVATE|FRIENDS|CLASS.
	- Read: visible to friends/classmates per setting; tutors see aggregates/consented details.
	- Update/Delete: student controls own schedule; audit changes.

- Attempts & Submissions
	- Attempts: create on start; read/update state locally and sync; delete only if no submission.
	- Submissions: create-on-submit; immutable content; tutors can annotate/grade.

- Multiplayer Rooms & Player State
	- Create: tutor/host; join/leave by eligible students.
	- Read: room lobby, player list, turns, reactions.
	- Update/Delete: host/admin close room; handle disconnects gracefully.

- Rewards
	- Guardian CRUD on rewards tied to conditions; student can read when earned.

- Subscriptions/Tickets/Payments
	- Create: purchase; Read: balances/history; Update: renew/cancel; Delete: not typical, use status.

- Notifications/Devices
	- Devices: register/unregister; Notifications: list, mark read, preferences.
