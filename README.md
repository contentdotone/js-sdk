# js-sdk

Zero-dependency TypeScript SDK for the [Zesty.io](https://www.zesty.io/) API. Single-file drop-in — copy `zesty-sdk.ts` into your project or install from npm.

---

## What is this?

`js-sdk` wraps every Zesty.io API surface in a typed, ergonomic client:

- **Accounts API** — instances, users, roles, teams, domains, tokens, invites, audit logs
- **Instance content API** — models, fields, items, publishings, views, head tags, settings, redirects, languages
- **Media Manager API** — bins, file search
- **Media Storage API** — file uploads (multipart FormData)
- **Metrics API** — request and bandwidth statistics

All requests use native `fetch`. No runtime dependencies. Works in Node 18+, Bun, Deno, and modern browsers.

---

## Quick start

```ts
import createZestySdk from "./zesty-sdk";

const zesty = createZestySdk({
  authToken: "your-app-sid-token",
  instanceZuid: "8-xyz-abc",  // optional: set a default instance
});

// List instances
const instances = await zesty.accounts.listInstances();

// List content models (uses the configured default instanceZuid)
const models = await zesty.content.models.list();

// Fetch a single content item — modelZuid, itemZuid (instanceZuid optional last)
const item = await zesty.content.items.get("7-model", "6-item");

// Publish it
await zesty.content.items.publish("7-model", "6-item", { version: 3 });
```

---

## Install

**Option A — npm**

```bash
npm install js-sdk
```

**Option B — single-file drop-in**

Copy `zesty-sdk.ts` directly into your project. It has no runtime dependencies and compiles with any TypeScript 5+ setup.

---

## Configuration reference

```ts
createZestySdk(config: ZestyConfig)
```

| Field | Type | Required | Description |
|---|---|---|---|
| `authToken` | `string` | No* | Session token (`APP_SID` / `DEV_APP_SID`). Required unless using `sessionToken`. |
| `sessionToken` | `string` | No* | Alias for `authToken`. Either field works. |
| `instanceZuid` | `string` | No | Default instance ZUID — used when instance-scoped methods are called without an explicit ZUID argument. |
| `proxyBaseUrl` | `string` | No | Override base URL for all requests. Point at a Next.js `/api` proxy to avoid CORS in browser apps. |
| `mediaManagerUrl` | `string` | No | Override `https://media-manager.api.zesty.io` (default). |
| `mediaStorageUrl` | `string` | No | Override `https://media-storage.api.zesty.io` (default). |
| `metricsUrl` | `string` | No | Override `https://metrics.zesty.io` (default). |

\* One of `authToken` or `sessionToken` must be provided for authenticated endpoints. The SDK will also read the auth token from the `Authorization` request header or from `APP_SID`/`DEV_APP_SID` browser cookies as a fallback (browser environments only).

---

## Full API reference

All methods return `Promise<T>` and throw `ZestyApiError` on non-2xx responses.

### `auth`

```ts
// Verify a session token — returns UserInfo
zesty.auth.verify(token?: string)
// → GET https://auth.api.zesty.io/verify

// Build a Google SSO redirect URL
zesty.auth.googleLoginUrl(redirectUrl?: string): string

// Build a Google SSO logout URL
zesty.auth.googleLogoutUrl(redirectUrl?: string): string
```

### `users`

```ts
zesty.users.getSelf()
// → GET /v1/users/me

zesty.users.getUser(userZuid: string)
// → GET /v1/users/{userZuid}

zesty.users.updateUser(userZuid: string, payload: Partial<UserPayload>)
// → PUT /v1/users/{userZuid}
```

### `accounts`

```ts
zesty.accounts.listInstances()
// → GET /v1/instances

zesty.accounts.getInstance(instanceZuid?: string)
// → GET /v1/instances/{instanceZuid}

zesty.accounts.getInstanceUsers(instanceZuid?: string)
// → GET /v1/instances/{instanceZuid}/users/roles
```

### `roles`

```ts
zesty.roles.list(instanceZuid?: string)
// → GET /v1/instances/{instanceZuid}/roles

zesty.roles.create(payload: CreateRolePayload)
// → POST /v1/roles

zesty.roles.update(roleZuid: string, payload: UpdateRolePayload)
// → PUT /v1/roles/{roleZuid}

zesty.roles.delete(roleZuid: string)
// → DELETE /v1/roles/{roleZuid}

zesty.roles.addUser(roleZuid: string, userZuid: string)
// → POST /v1/roles/{roleZuid}/users

zesty.roles.removeUser(roleZuid: string, userZuid: string)
// → DELETE /v1/roles/{roleZuid}/users/{userZuid}

zesty.roles.granular.list(roleZuid: string)
// → GET /v1/roles/{roleZuid}/granularRoles

zesty.roles.granular.create(roleZuid: string, payload: GranularRolePayload)
// → POST /v1/roles/{roleZuid}/granularRoles

zesty.roles.granular.batchUpdate(roleZuid: string, payload: GranularRolePayload[])
// → PUT /v1/roles/{roleZuid}/granularRoles

zesty.roles.granular.delete(roleZuid: string, resourceZuid: string)
// → DELETE /v1/roles/{roleZuid}/granularRoles/{resourceZuid}
```

### `teams`

```ts
zesty.teams.list()
// → GET /v1/teams

zesty.teams.create(payload: { name: string; description?: string })
// → POST /v1/teams

zesty.teams.update(teamZuid: string, payload: { name?: string; description?: string })
// → PUT /v1/teams/{teamZuid}

zesty.teams.delete(teamZuid: string)
// → DELETE /v1/teams/{teamZuid}

zesty.teams.listUsers(teamZuid: string)
// → GET /v1/teams/{teamZuid}/users

zesty.teams.removeUser(teamZuid: string, userZuid: string)
// → DELETE /v1/teams/{teamZuid}/users/{userZuid}

zesty.teams.listInstances(teamZuid: string)
// → GET /v1/teams/{teamZuid}/instances

zesty.teams.addToInstance(instanceZuid: string, teamZuid: string, roleZuid: string)
// → POST /v1/instances/{instanceZuid}/teams

zesty.teams.removeFromInstance(instanceZuid: string, teamZuid: string)
// → DELETE /v1/instances/{instanceZuid}/teams/{teamZuid}
```

### `invites`

```ts
// accessLevel: 1=Owner, 2=Admin, 3=Developer, 4=Publisher/SEO, 5=Contributor
zesty.invites.send(payload: { invitee_email: string; entityZUID: string; accessLevel: 1|2|3|4|5 })
// → POST /v1/invites

zesty.invites.sendToTeam(teamZuid: string, payload: { email: string })
// → POST /v1/teams/{teamZuid}/invites
```

### `domains`

```ts
zesty.domains.list(instanceZuid?: string)
// → GET /v1/instances/{instanceZuid}/domains

zesty.domains.create(instanceZuid: string, payload: { domain: string; branch?: string })
// → POST /v1/instances/{instanceZuid}/domains

zesty.domains.delete(instanceZuid: string, domainZuid: string)
// → DELETE /v1/instances/{instanceZuid}/domains/{domainZuid}
```

### `tokens`

```ts
zesty.tokens.list(instanceZuid?: string)
// → GET /v1/instances/{instanceZuid}/tokens

zesty.tokens.create(instanceZuid: string, payload: { name: string; role?: string })
// → POST /v1/instances/{instanceZuid}/tokens

zesty.tokens.delete(instanceZuid: string, tokenZuid: string)
// → DELETE /v1/instances/{instanceZuid}/tokens/{tokenZuid}
```

### `webhooks`

```ts
zesty.webhooks.list(instanceZuid?: string)
// → GET /v1/web/hooks  (instance API)

zesty.webhooks.create(instanceZuid: string, payload: WebhookPayload)
// → POST /v1/web/hooks

zesty.webhooks.delete(instanceZuid: string, hookZuid: string)
// → DELETE /v1/web/hooks/{hookZuid}
```

### `audits`

```ts
zesty.audits.list(instanceZuid?: string, params?: { limit?: number; order?: string; dir?: string })
// → GET /v1/instances/{instanceZuid}/audits

// Note: web-agent also uses a comment-scoped variant:
zesty.audits.listComments(instanceZuid: string, resourceZuid: string)
// → GET /v1/instances/{instanceZuid}/comments?resource={resourceZuid}

zesty.audits.createComment(instanceZuid: string, payload: { resourceZUID: string; content: string; scopeTo?: string })
// → POST /v1/comments
```

### `content.models`

```ts
// instanceZuid is always the optional last parameter; omit it when the SDK
// was configured with a default instanceZuid at creation time.

zesty.content.models.list(instanceZuid?: string)
// → GET /v1/content/models

zesty.content.models.get(modelZuid: string, instanceZuid?: string)
// → GET /v1/content/models/{modelZuid}

zesty.content.models.create(data: { name: string; label: string; type: "templateset" | "dataset" | "pageset" }, instanceZuid?: string)
// → POST /v1/content/models
```

### `content.fields`

```ts
zesty.content.fields.list(modelZuid: string, instanceZuid?: string)
// → GET /v1/content/models/{modelZuid}/fields

zesty.content.fields.create(modelZuid: string, payload: FieldPayload, instanceZuid?: string)
// → POST /v1/content/models/{modelZuid}/fields
// payload: { contentModelZUID, name, label, datatype, required, sort, settings: { list, defaultValue } }

zesty.content.fields.delete(modelZuid: string, fieldZuid: string, instanceZuid?: string)
// → DELETE /v1/content/models/{modelZuid}/fields/{fieldZuid}
```

### `content.items`

```ts
zesty.content.items.list(modelZuid: string, opts?: { limit?: number; page?: number; lang?: string }, instanceZuid?: string)
// → GET /v1/content/models/{modelZuid}/items

zesty.content.items.get(modelZuid: string, itemZuid: string, instanceZuid?: string)
// → GET /v1/content/models/{modelZuid}/items/{itemZuid}

zesty.content.items.create(modelZuid: string, payload: ContentItemPayload, instanceZuid?: string)
// → POST /v1/content/models/{modelZuid}/items
// payload: { data: {...}, web: { pathPart, ...webFields }, meta: { langID, contentModelZUID } }

zesty.content.items.update(modelZuid: string, itemZuid: string, data: { data?: Record<string, unknown>; web?: Partial<ContentItemWeb>; meta?: Partial<ContentItemMeta> }, instanceZuid?: string)
// → PUT /v1/content/models/{modelZuid}/items/{itemZuid}

zesty.content.items.patch(modelZuid: string, itemZuid: string, data: { data?: Record<string, unknown>; web?: Partial<ContentItemWeb>; meta?: Partial<ContentItemMeta> }, instanceZuid?: string)
// → PATCH /v1/content/models/{modelZuid}/items/{itemZuid}

zesty.content.items.publish(modelZuid: string, itemZuid: string, opts: { version: number; publishesAt?: string; unpublishAt?: string }, instanceZuid?: string)
// → POST /v1/content/models/{modelZuid}/items/{itemZuid}/publishings

zesty.content.items.search(query: string, opts?: { limit?: number }, instanceZuid?: string)
// → GET /v1/search/items?q={query}&limit={limit}
```

### `content.views`

```ts
zesty.content.views.list(instanceZuid?: string)
// → GET /v1/web/views

zesty.content.views.get(instanceZuid: string, viewZuid: string)
// → GET /v1/web/views/{viewZuid}

zesty.content.views.create(instanceZuid: string, payload: { code: string; fileName: string; type?: string })
// → POST /v1/web/views  (type defaults to "ajax-json")

zesty.content.views.update(instanceZuid: string, viewZuid: string, payload: { code: string })
// → PUT /v1/web/views/{viewZuid}

zesty.content.views.publish(instanceZuid: string, viewZuid: string, version: number, purgeCache?: boolean)
// → POST /v1/web/views/{viewZuid}/versions/{version}?purge_cache={purgeCache}
```

### `content.headTags`

```ts
zesty.content.headTags.list(instanceZuid?: string)
// → GET /v1/web/headtags

zesty.content.headTags.create(instanceZuid: string, payload: HeadTagPayload)
// → POST /v1/web/headtags
// payload: { resourceZUID, type, custom: true, attributes: { ..., custom: "true" }, sort }

zesty.content.headTags.delete(instanceZuid: string, headTagZuid: string)
// → DELETE /v1/web/headtags/{headTagZuid}
```

### `content.languages`

```ts
zesty.content.languages.list(instanceZuid?: string)
// → GET /v1/env/langs
```

### `content.settings`

```ts
zesty.content.settings.list(instanceZuid?: string)
// → GET /v1/env/settings
```

### `content.redirects`

```ts
zesty.content.redirects.list(instanceZuid?: string)
// → GET /v1/web/redirects

zesty.content.redirects.create(instanceZuid: string, payload: { from: string; to: string; code?: number })
// → POST /v1/web/redirects

zesty.content.redirects.delete(instanceZuid: string, redirectZuid: string)
// → DELETE /v1/web/redirects/{redirectZuid}
```

### `metrics`

```ts
zesty.metrics.requests(instanceZuid: string, params?: MetricsParams)
// → GET https://metrics.zesty.io/requests  (with instanceZuid + date range params)

zesty.metrics.bandwidth(instanceZuid: string, params?: MetricsParams)
// → GET https://metrics.zesty.io/bandwidth
```

### `media`

```ts
zesty.media.bins.list(instanceId: string | number)
// → GET https://media-manager.api.zesty.io/site/{instanceId}/bins
// Note: instanceId is the numeric ID, NOT the ZUID

zesty.media.bins.searchFiles(binZuid: string, term: string)
// → GET https://media-manager.api.zesty.io/search/files?bins={binZuid}&term={term}

zesty.media.upload(payload: MediaUploadPayload)
// → POST https://media-storage.api.zesty.io/upload/gcp/{bucketName}
// Returns array — first element has { id, url, filename }
```

---

## Error handling

All non-2xx responses throw `ZestyApiError`:

```ts
import createZestySdk, { ZestyApiError } from "./zesty-sdk";

try {
  await zesty.content.items.get(modelZuid, itemZuid);
} catch (err) {
  if (err instanceof ZestyApiError) {
    console.error(err.status);   // HTTP status code (e.g. 404)
    console.error(err.method);   // "GET"
    console.error(err.url);      // full URL that was called
    console.error(err.body);     // raw response body text
    console.error(err.message);  // "GET https://... → 404"
  }
}
```

---

## Proxy mode

In browser environments, direct calls to `*.api.zesty.io` are blocked by CORS. Use `proxyBaseUrl` to route through a server-side proxy (e.g. a Next.js API route):

```ts
// client.ts
const zesty = createZestySdk({
  authToken: getAuthToken(),
  proxyBaseUrl: "",  // empty string → relative URLs, goes through same-origin proxy
});
```

Then wire up a catch-all route in Next.js:

```ts
// app/api/[...path]/route.ts
export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const url = `https://accounts.api.zesty.io/v1/${params.path.join("/")}`;
  const res = await fetch(url, {
    headers: { Authorization: req.headers.get("Authorization") ?? "" },
  });
  return new Response(await res.text(), { status: res.status });
}
```

When `proxyBaseUrl` is set, the SDK builds relative URLs so all requests go through your proxy — zero CORS issues.

---

## Media uploads

`media.upload` accepts `File`, `Blob`, `ArrayBuffer`, or `Uint8Array`:

```ts
// Browser — from a file input
const file = inputEl.files[0];
const [uploaded] = await zesty.media.upload({
  bucketName: "zesty-dev-media",
  binZuid: "1-abc",
  userZuid: "5-xyz",
  groupId: "0",
  file,
  title: "My image",   // optional
});
console.log(uploaded.url);   // CDN URL of the uploaded file

// Node.js — from a Buffer
import { readFileSync } from "fs";
const buf = readFileSync("./image.png");
await zesty.media.upload({
  bucketName: "zesty-dev-media",
  binZuid: "1-abc",
  userZuid: "5-xyz",
  groupId: "0",
  file: new Blob([buf], { type: "image/png" }),
});
```

The response is an **array** — always read `result[0]` for the uploaded file metadata.

---

## AI consumer guide

This section is written for LLMs consuming this SDK in agentic workflows.

### Initializing the client

Always call `createZestySdk(config)` once and reuse the returned object. Do not create a new client per request.

```ts
const zesty = createZestySdk({ authToken: token, instanceZuid: defaultInstance });
```

### Instance ZUID vs numeric instance ID

- Most methods take `instanceZuid` — a ZUID string like `"8-abc-def"`.
- `media.bins.list` takes the **numeric** instance ID (e.g. `12345`), available at `instance.ID` from `accounts.getInstance()`.
- Do not pass a ZUID to `media.bins.list`.

### Publish body shape

The Zesty publish endpoint expects:
```json
{ "publish": true, "version": 3, "publishAt": "now", "unpublishAt": "never" }
```
The SDK handles this — just pass `{ version }`. `publishAt` defaults to `"now"` and `unpublishAt` to `"never"`.

### Content item shape

Items from `content.items.get` have this shape:
```ts
{
  meta: { ZUIDZUID: string; langID: number; version: number; ... },
  web:  { metaTitle?: string; pathPart?: string; ... },
  data: Record<string, unknown>   // model-specific fields
}
```
The user-visible title is `item.web.metaTitle`. Content fields are under `item.data`.

### Field datatypes

Common values for `content.models.fields.create` → `datatype`:
`text`, `textarea`, `wysiwyg_advanced`, `number`, `date`, `datetime`, `images`, `one_to_one`, `one_to_many`, `yes_no`, `sort`, `color`, `link`, `internal_link`, `uuid`

### Model types

`content.models.create` → `type` must be one of: `templateset` (page with template), `pageset` (page list), `dataset` (headless data).

### Head tag `custom` field

When creating a head tag, both the root object and the nested `attributes` object must include `custom: true` / `custom: "true"` respectively. This is a Zesty quirk.

### Error recovery

On `ZestyApiError` with `status === 401`, re-authenticate and retry once. On `status === 429`, back off and retry. On `status >= 500`, retry up to 3 times with exponential backoff.

### View publish `purge_cache`

Pass `purgeCache: false` when publishing view versions during bulk operations to avoid hammering the CDN purge queue. Set `purgeCache: true` (the default) only for user-initiated single publishes.

---

## Use it in your stack

### Vanilla JS via cdnjs

Once published to npm, `js-sdk` is mirrored on cdnjs at:
- UMD (global): `https://cdnjs.cloudflare.com/ajax/libs/js-sdk/0.1.0/zesty-sdk.min.js`
- ESM: `https://cdnjs.cloudflare.com/ajax/libs/js-sdk/0.1.0/zesty-sdk.mjs`

The UMD build exposes a global `ZestySdk` object with all named exports.

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-sdk/0.1.0/zesty-sdk.min.js"></script>
</head>
<body>
<script>
  // readCookie + browser SSO session → no authToken needed on authenticated pages
  const sdk = ZestySdk.createZestyVanilla({ instanceZuid: "8-abc-xyz" });

  sdk.content.models.list().then((models) => {
    models.forEach((m) => console.log(m.name));
  });

  // Or pass an explicit token (PTK-... API token)
  const sdk2 = ZestySdk.createZestyVanilla({ authToken: "PTK-my-token" });
</script>
</body>
</html>
```

---

### ES modules via cdnjs

```html
<script type="module">
  import { createZestySdk } from "https://cdnjs.cloudflare.com/ajax/libs/js-sdk/0.1.0/zesty-sdk.mjs";

  const sdk = createZestySdk({ authToken: "PTK-my-token", instanceZuid: "8-abc" });
  const instances = await sdk.accounts.listInstances();
  console.log(instances);
</script>
```

---

### Node.js (CommonJS)

```js
const { createZestyNode } = require("js-sdk");

const sdk = createZestyNode({ authToken: process.env.ZESTY_TOKEN });

sdk.content.models.list().then((models) => console.log(models));
```

---

### Node.js (ESM)

```js
import { createZestyNode } from "js-sdk";

const sdk = createZestyNode({ authToken: process.env.ZESTY_TOKEN });
const instances = await sdk.accounts.listInstances();
```

---

### TypeScript

Full intellisense out of the box — no extra `@types` package needed.

```ts
import createZestySdk, { type ZestySdk, type ContentModel, ZestyApiError } from "js-sdk";

const sdk: ZestySdk = createZestySdk({
  authToken: process.env.ZESTY_TOKEN,
  instanceZuid: "8-abc-xyz",
});

// All content methods have instanceZuid as optional last param — omit when SDK is pre-configured
// sdk.content.models.list() → Promise<ContentModel[]>
const models: ContentModel[] = await sdk.content.models.list();

// Error type is exported for catch blocks
try {
  await sdk.content.items.get("8-abc", "7-model", "6-item");
} catch (err) {
  if (err instanceof ZestyApiError) {
    console.error(err.status, err.url);
  }
}
```

---

### Next.js (App Router)

**Step 1 — Add the proxy routes** (copy these once per project):

```ts
// src/app/api/v1/[...path]/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("APP_SID")?.value ?? cookieStore.get("DEV_APP_SID")?.value ?? "";
  const url = `https://accounts.api.zesty.io/v1/${params.path.join("/")}`;
  const search = req.nextUrl.search;
  const res = await fetch(`${url}${search}`, {
    method: req.method,
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
```

```ts
// src/app/api/instance/[instanceZuid]/v1/[...path]/route.ts
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest, { params }: { params: { instanceZuid: string; path: string[] } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("APP_SID")?.value ?? cookieStore.get("DEV_APP_SID")?.value ?? "";
  const url = `https://${params.instanceZuid}.api.zesty.io/v1/${params.path.join("/")}`;
  const search = req.nextUrl.search;
  const res = await fetch(`${url}${search}`, {
    method: req.method,
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}
export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
```

**Step 2 — Use in a Server Component / Route Handler:**

```ts
// src/app/dashboard/page.tsx  (Server Component)
import { createZestyNext } from "js-sdk";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("APP_SID")?.value;

  const sdk = createZestyNext({ authToken: token });
  const instances = await sdk.accounts.listInstances();

  return <ul>{instances.map((i) => <li key={i.ZUIDZUID}>{i.name}</li>)}</ul>;
}
```

**Step 3 — Use in a Client Component with React context:**

```tsx
// src/app/providers.tsx  ("use client")
"use client";
import React from "react";
import { createZestyReact } from "js-sdk";

export const { ZestyProvider, useZesty } = createZestyReact(React, {
  instanceZuid: process.env.NEXT_PUBLIC_INSTANCE_ZUID,
});
```

```tsx
// src/app/layout.tsx
import { ZestyProvider } from "./providers";
export default function RootLayout({ children }) {
  return <html><body><ZestyProvider>{children}</ZestyProvider></body></html>;
}
```

```tsx
// src/components/ModelList.tsx  ("use client")
"use client";
import { useZesty } from "../app/providers";
import { useEffect, useState } from "react";

export function ModelList() {
  const sdk = useZesty();
  const [models, setModels] = useState([]);
  useEffect(() => { sdk.content.models.list().then(setModels); }, [sdk]);
  return <ul>{models.map((m) => <li key={m.ZUIDZUID}>{m.name}</li>)}</ul>;
}
```

---

### React

```tsx
// src/sdk.ts
import React from "react";
import { createZestyReact } from "js-sdk";

export const { ZestyProvider, useZesty } = createZestyReact(React, {
  authToken: process.env.REACT_APP_ZESTY_TOKEN,
  instanceZuid: process.env.REACT_APP_INSTANCE_ZUID,
});
```

```tsx
// src/index.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import { ZestyProvider } from "./sdk";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ZestyProvider><App /></ZestyProvider>
);
```

```tsx
// src/components/ModelList.tsx
import { useZesty } from "../sdk";
import { useEffect, useState } from "react";

export function ModelList() {
  const sdk = useZesty();
  const [models, setModels] = useState([]);
  useEffect(() => { sdk.content.models.list().then(setModels); }, [sdk]);
  return <ul>{models.map((m) => <li key={m.ZUIDZUID}>{m.name}</li>)}</ul>;
}
```

---

### Vue 3

```ts
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createZestyVuePlugin } from "js-sdk";

const app = createApp(App);
app.use(createZestyVuePlugin({
  authToken: import.meta.env.VITE_ZESTY_TOKEN,
  instanceZuid: import.meta.env.VITE_INSTANCE_ZUID,
}));
app.mount("#app");
```

```vue
<!-- src/components/ModelList.vue -->
<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { zestyKey, type ZestySdk } from "js-sdk";

const sdk = inject(zestyKey) as ZestySdk;
const models = ref([]);
onMounted(async () => { models.value = await sdk.content.models.list(); });
</script>
<template>
  <ul><li v-for="m in models" :key="m.ZUIDZUID">{{ m.name }}</li></ul>
</template>
```

---

### Cloudflare Workers

```ts
// worker.ts
import createZestySdk from "js-sdk";

export default {
  async fetch(request: Request, env: { ZESTY_TOKEN: string; INSTANCE_ZUID: string }) {
    const sdk = createZestySdk({
      authToken: env.ZESTY_TOKEN,
      instanceZuid: env.INSTANCE_ZUID,
      fetch: globalThis.fetch,   // Workers provide a compliant fetch
    });

    const models = await sdk.content.models.list();
    return new Response(JSON.stringify(models), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

---

### Deno / Bun

The SDK uses only native `fetch` and `FormData` — it runs unchanged in Deno and Bun.

```ts
// Deno
import createZestySdk from "npm:js-sdk";
const sdk = createZestySdk({ authToken: Deno.env.get("ZESTY_TOKEN") });
const instances = await sdk.accounts.listInstances();

// Bun
import createZestySdk from "js-sdk";
const sdk = createZestySdk({ authToken: process.env.ZESTY_TOKEN });
const instances = await sdk.accounts.listInstances();
```

---

## License

MIT © Content.One
