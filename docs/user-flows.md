# Cathedral — User Flow Journeys

User journeys per role. Roles are defined in
[`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma) (`UserRole`):
`SUPER_ADMIN`, `ADMIN`, `FINANCE`, `DEPARTMENT_LEADER`, `VIEWER`.

Tenancy: `SUPER_ADMIN` operates platform-wide (`churchId = null`); every other
role is scoped to one church. RBAC is enforced by
[`roles.guard.ts`](../apps/api/src/common/guards/roles.guard.ts) (super admin
bypasses all role gates) and by route `roles` in
[`apps/web/src/features/dashboard/nav.ts`](../apps/web/src/features/dashboard/nav.ts).

---

## Onboarding (how anyone gets in)

```mermaid
flowchart TD
  Start([Person needs access]) --> How{How created?}
  How -->|Admin creates directly| Temp[Account made with temp password]
  Temp --> Email1[Receives email w/ temp password]
  Email1 --> Login1[Logs in]
  Login1 --> Force[mustChangePassword: set new password]
  Force --> Dash

  How -->|Admin sends invite| Token[Invite token, 72h TTL, hashed]
  Token --> Email2[Receives /invite/accept?token=...]
  Email2 --> Accept[Sets name + password, accepts]
  Accept --> Dash([Lands on /dashboard for their role])
```

Notes:
- Only `ADMIN` (within own church) and `SUPER_ADMIN` (any church) can create/invite.
- Only `SUPER_ADMIN` can invite another `SUPER_ADMIN`.
- Accept-invite + validate-token endpoints are public; everything else needs auth.

---

## SUPER_ADMIN — platform operator

```mermaid
flowchart TD
  L[Login] --> D[/dashboard — context: All churches/]
  D --> Churches[/dashboard/churches: create / edit / delete churches/]
  D --> PUsers[/dashboard/platform/users: all users across tenants/]
  D --> Invite[Invite any role incl. SUPER_ADMIN to any church]
  D --> Any[Bypass RBAC → any church-scoped view: members, giving, reports]
  Churches --> Onboard[Stand up a new church + its first ADMIN]
```

Entry points: Platform section of the sidebar (only role that sees it).

---

## ADMIN — church administrator

```mermaid
flowchart TD
  L[Login] --> D[/dashboard — context: own church/]
  D --> Members[/dashboard/members: create, view, edit/]
  D --> Depts[/dashboard/departments: manage/]
  D --> Att[/dashboard/attendance/]
  D --> Giving[/dashboard/giving/]
  D --> Reports[/dashboard/reports/]
  D --> Invites[/dashboard/invites: invite non-super roles to this church/]
  D --> Settings[/dashboard/settings/]
  Invites --> Onboard[New staff/volunteer onboards via invite flow]
```

Full control of one church; cannot see other churches or platform pages.

---

## FINANCE — finance team

```mermaid
flowchart TD
  L[Login] --> D[/dashboard — own church/]
  D --> Members[/dashboard/members: view/]
  D --> Giving[/dashboard/giving: manage funds, contributions, reconcile/]
  D --> Reports[/dashboard/reports: financial reports/]
  D --> Settings[/dashboard/settings: own account/]
```

No departments, no invites, no attendance management.

---

## DEPARTMENT_LEADER — department leader

```mermaid
flowchart TD
  L[Login] --> D[/dashboard — own church/]
  D --> Members[/dashboard/members: view/]
  D --> Depts[/dashboard/departments: manage own department/]
  D --> Att[/dashboard/attendance: check-in / rolls/]
  D --> Settings[/dashboard/settings/]
```

No giving, no reports, no invites.

---

## VIEWER — read-only

```mermaid
flowchart TD
  L[Login] --> D[/dashboard — own church/]
  D --> Members[/dashboard/members: read-only/]
  D --> Att[/dashboard/attendance: read-only/]
  D --> Giving[/dashboard/giving: read-only/]
  D --> Settings[/dashboard/settings: own account only/]
```

Sees data, changes nothing except own password.

---

### Capability matrix

| Capability | SUPER_ADMIN | ADMIN | FINANCE | DEPT_LEADER | VIEWER |
|---|---|---|---|---|---|
| Manage churches | ✓ | – | – | – | – |
| Platform users | ✓ | – | – | – | – |
| Create / invite users | ✓ (any) | ✓ (non-super) | – | – | – |
| Members | ✓ all | ✓ own | view | view | view |
| Departments | ✓ | ✓ | – | ✓ | – |
| Giving / finance | ✓ | ✓ | ✓ | – | view |
| Attendance | ✓ | ✓ | – | ✓ | view |
| Reports | ✓ | ✓ | ✓ | – | – |
| Tenant scope | platform | 1 church | 1 church | 1 church | 1 church |
