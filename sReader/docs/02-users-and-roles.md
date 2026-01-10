# Users and Roles

## Primary Users
- Student: Consumes assignments, plays game modes (solo/multiplayer), schedules work, manages visibility.
- Guardian/Parent: Assigns rewards/encouragement, monitors progress, manages student subscriptions.
- Tutor/Lecturer: Creates academies, classes/modules, assignments, tools, and multiplayer sessions; reviews submissions.
- Academy Owner/Admin: Manages academy settings, tutors, classes.
- System Admin: Oversees platform, moderation, billing, and operations.

## Secondary Stakeholders
- Payment Providers (Orange Money et al.).
- Content Providers (illustrations, asset libraries).

## Authentication/Identity
- Students, Guardians, Tutors authenticated with email/phone-based login.
- Roles: `STUDENT`, `GUARDIAN`, `TUTOR`, `ACADEMY_ADMIN`, `SYS_ADMIN` (role-per-user; guardians can manage linked students).
