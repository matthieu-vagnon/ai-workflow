# Master Rules

## Project-Specific Rules

Find the project-specific master rules here → `project.md`.

## Before Writing Code

Before writing or modifying code that uses any external library:

1. **First**, resolve the library with _Context7 MCP_ to get the up-to-date documentation;
2. **Only** if Context7 returns no results or insufficient info, fall back to _Exa MCP_ as a secondary source.

> **Important:** ALWAYS prefer Context7 documentation over training data as the source of truth, especially for critical features (security, billing, authentication, payments, etc.).

## While Writing Code

### Code Conventions

- ALWAYS group all imports in a single block at the top of the file, with no blank lines between them;
- ALWAYS organize the code into blocs with each bloc representing a distinct logic. Each bloc is separated with a line jump (example below).

> **Example (React):**
>
> ```tsx
> export function UserProfile({ userId }: UserProfileProps) {
>   const { data: user, isLoading } = useUser(userId);
>   const { mutate: updateUser } = useUpdateUser();
>
>   const displayName = user?.name ?? "Anonymous";
>   const initials = displayName.slice(0, 2).toUpperCase();
>
>   const handleSave = (values: UserFormValues) => {
>     updateUser({ id: userId, ...values });
>   };
>
>   if (isLoading) return <Skeleton />;
>
>   return (
>     <Card>
>       <Avatar initials={initials} />
>       <UserForm defaultValues={user} onSubmit={handleSave} />
>     </Card>
>   );
> }
> ```
>
> **Example (FastAPI):**
>
> ```python
> @router.get("/users/{user_id}")
> async def get_user(user_id: UUID, db: Session = Depends(get_db)) -> UserResponse:
>     """Retrieve a user by ID."""
>     user = await db.get(User, user_id)
>
>     if not user:
>         raise HTTPException(status_code=404, detail="User not found")
>
>     return UserResponse.model_validate(user)
> ```

### Documentation & Logging

- Write TSDoc/docstrings ONLY for **exported** functions, classes, types, and interfaces;
- NEVER add comments on trivial logic (hook, constant declaration, etc.);
- NEVER add logs unless requested;
- ALWAYS comment complex logic (RegEx, etc.);
- Generic code (style variables, UI components, etc.) should ALWAYS be reusable.

## After Writing Code

ALWAYS check the following after modifying the codebase. Iterate until complete:

- [ ] Generic code is reusable
- [ ] No code was duplicated
- [ ] No logs were added without prior consent
- [ ] Code is properly spaced into logical blocks
