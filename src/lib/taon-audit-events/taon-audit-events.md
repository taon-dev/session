Example use

```ts
audit.log({
  type: 'ROLE_ASSIGNED',
  actorUserId: admin.id,
  targetType: 'User',
  targetId: String(user.id),
  data: {
    role: 'project-admin',
  },
});
```
