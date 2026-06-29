# Cathedral — ER Diagram

Source: `apps/api/prisma/schema.prisma` (PostgreSQL).

```mermaid
erDiagram
    Church ||--o{ Department : has
    Church ||--o{ User : has
    Church ||--o{ UserInvite : has

    Church {
        string id PK
        string name
        string slug UK
        string address
        string phone
        string email
        bool isActive
        datetime createdAt
        datetime updatedAt
    }
    Department {
        string id PK
        string name
        string description
        string churchId FK
        datetime createdAt
        datetime updatedAt
    }
    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        UserRole role
        UserStatus status
        bool mustChangePassword
        string churchId FK
        datetime createdAt
        datetime updatedAt
    }
    UserInvite {
        string id PK
        string email
        UserRole role
        string tokenHash
        datetime expiresAt
        bool used
        string churchId FK
        datetime createdAt
    }
```

**Enums**
- `UserRole`: SUPER_ADMIN, ADMIN, FINANCE, DEPARTMENT_LEADER, VIEWER
- `UserStatus`: ACTIVE, PENDING

**Notes**
- `User.churchId` and `UserInvite.churchId` are nullable (SUPER_ADMIN has no church).
- `Department` is unique per `(churchId, name)`.
- All church relations cascade on delete.
