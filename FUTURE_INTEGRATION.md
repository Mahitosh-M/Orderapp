# Future ERP Integration

Initial architecture:

```text
Existing ERP project
        |
        | button/link
        v
Ordering App URL
```

The current app is intentionally separate and does not connect to the existing ERP/CRM Firebase project.

True cross-project SSO later requires:

1. ERP Firebase ID token.
2. Secure backend verification.
3. Firebase Admin SDK on the backend only.
4. Ordering-project custom token generation.
5. Ordering App sign-in with the custom token.

Do not pass authentication tokens in URL query parameters. Do not place authentication secrets in the frontend.
