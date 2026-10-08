# Session account linking and backoffice

## Verified-email linking

Set `TaonSessionProvider.linkSocialAccountEmail = true` in the application's
provider configuration to enable automatic linking. The default is `false`.
Emails are normalized using the existing identity repository.

An existing provider identity remains the primary sign-in key. For a new
social identity, a strictly verified provider email can resolve the User
through its password identity or another verified identity. The provider
still gets its own UserIdentity. Ambiguous emails belonging to multiple
existing Users are rejected rather than silently merging accounts.

For a social-first account, sign in using the existing provider and select
Email in the profile's Connect tab to set a password for its verified email.
Subsequent email/password logins use that same User. Unauthenticated signup
cannot set a password on an existing social account merely by knowing its
email.

## Profile username

The Change Username tab follows Change Password. Saving first checks
availability, and the server repeats the check and relies on the existing
unique username index to prevent concurrent duplicate updates. Usernames
are trimmed and must contain 1 to 255 characters.

## Session metadata and lifecycle

New sessions capture the initiating request's user agent, resolved client
IP, a browser/OS device label where recognizable, login time, last activity,
expiry, identity ID, and authentication provider.

Client IP resolution uses `req.ip` from Taon's runtime adapter, falling back
to the connection's remote address. Session code does not independently
trust forwarding headers. Configure the deployment's trusted proxy boundary
correctly; Express and the Cloudflare adapter remain responsible for that
boundary. Device labels and user agents are descriptive, not authentication
evidence.

Access tokens and refresh-token records reference the Session. Authenticated
requests update activity, refresh extends expiry, and logout revokes the
Session. Refresh cookies use `/` so logout receives them. Older tokens without
a session reference remain supported until expiry.

## Backoffice

The Sessions section lists unrevoked, unexpired sessions. Expanded rows and
the routed Session page use the same details component and preserve the
Admin outlet. Session APIs require a super user and return explicit safe
fields; token hashes and password hashes are not exposed.

The entity changes include nullable Session identity/provider columns, a
larger user-agent column, and a unique provider/provider-user-ID identity
index. Apply these through the application's normal Taon schema management
before deployment. Existing duplicate provider identities must be resolved
before applying the unique index. Older sessions are not backfilled with
request metadata that is no longer available.
