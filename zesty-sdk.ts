/**
 * zesty-sdk.ts — Zero-dependency TypeScript client for the Zesty.io API
 *
 * Usage:
 *   import createZestySdk from "./zesty-sdk";
 *   const sdk = createZestySdk({ authToken: "PTK-..." });
 *   const instances = await sdk.accounts.listInstances();
 *
 * Works in: Node 18+, browsers, Cloudflare Workers, Next.js route handlers.
 * Zero runtime dependencies — uses native fetch and FormData.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

export interface ZestyConfig {
  /** PTK-... bearer token */
  authToken?: string;
  /** Session token (APP_SID) — alternative to authToken */
  sessionToken?: string;
  /** Default instance ZUIDZUID for content-api calls */
  instanceZuid?: string;
  /** default: https://accounts.api.zesty.io/v1 */
  accountsBaseUrl?: string;
  /** default: https://auth.api.zesty.io */
  authBaseUrl?: string;
  /** default: https://metrics.zesty.io */
  metricsBaseUrl?: string;
  /** default: https://media-manager.api.zesty.io */
  mediaManagerBaseUrl?: string;
  /** default: https://media-storage.api.zesty.io */
  mediaStorageBaseUrl?: string;
  /**
   * Proxy override for accounts API.
   * e.g. "/api/v1" routes through your Next.js proxy instead of accounts.api.zesty.io/v1.
   */
  accountsBaseUrlOverride?: string;
  /**
   * Proxy override for per-instance content API.
   * e.g. "/api/instance/{instanceZuid}/v1" — the literal string "{instanceZuid}" is
   * replaced at call time with the resolved instanceZuid.
   */
  contentBaseUrlOverride?: string;
  /**
   * Proxy override for media manager.
   */
  mediaBaseUrlOverride?: string;
  /** Called on every non-2xx response */
  onError?: (err: ZestyApiError) => void;
  /** Override the global fetch — useful for testing or Cloudflare Workers */
  fetch?: typeof fetch;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class ZestyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly method: string,
    public readonly url: string,
    public readonly body: unknown = null,
  ) {
    super(message);
    this.name = "ZestyApiError";
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Instance {
  ZUIDZUID: string;
  name: string;
  ID?: number;
  randomHashID?: string;
  previewDomain?: string;
  domain?: string;
  plan?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByUserZUID?: string;
}

export interface User {
  ZUIDZUID: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  ZUIDZUID: string;
  name: string;
  description?: string;
  instanceZUID?: string;
  static?: boolean;
  systemRole?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GranularRole {
  ZUIDZUID?: string;
  resourceZUID: string;
  roleZUID: string;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  publish?: boolean;
  grant?: boolean;
}

export interface Team {
  ZUIDZUID: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  ZUIDZUID: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface Invite {
  ZUIDZUID?: string;
  inviteeName: string;
  inviteeEmail: string;
  entityZUID: string;
  accessLevel: number; // 1–5 integer
  createdAt?: string;
}

export interface Domain {
  ZUIDZUID: string;
  domain: string;
  branch?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Token {
  ZUIDZUID: string;
  name: string;
  token?: string;
  roleZUID?: string;
  roleName?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface Webhook {
  ZUIDZUID: string;
  method: string;
  url: string;
  eventAction?: number;
  contentType?: string;
  payload?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  ZUIDZUID?: string;
  action?: string;
  meta?: Record<string, unknown>;
  affectedZUID?: string;
  createdAt?: string;
  createdByUserZUID?: string;
}

export interface ContentModel {
  ZUIDZUID: string;
  name: string;
  label?: string;
  type: "templateset" | "pageset" | "dataset" | "external";
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentField {
  ZUIDZUID: string;
  name: string;
  label: string;
  datatype: string;
  sort: number;
  required?: boolean;
  description?: string;
  settings?: {
    list?: boolean;
    defaultValue?: unknown;
    options?: string;
    [key: string]: unknown;
  };
}

export interface ContentItemMeta {
  ZUIDZUID: string;
  zid?: number;
  masterZUID?: string;
  contentModelZUID?: string;
  sort?: number;
  listed?: boolean;
  version?: number;
  langID?: number;
  createdAt?: string;
  updatedAt?: string;
  createdByUserZUID?: string;
}

export interface ContentItemWeb {
  version?: number;
  versionZUID?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  pathPart?: string;
  path?: string;
  parentZUID?: string;
  canonicalTagMode?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentItem {
  meta: ContentItemMeta;
  web: ContentItemWeb;
  data: Record<string, unknown>;
  publishAt?: string | null;
  siblings?: ContentItem[];
}

export interface ContentView {
  ZUIDZUID: string;
  fileName: string;
  code?: string;
  type?: string;
  status?: string;
  version?: number;
  model_ZUIDZUID?: string;
  contentModelZUID?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeadTag {
  ZUIDZUID: string;
  resourceZUID: string;
  type: string;
  attributes: Record<string, string>;
  sort?: number;
  custom?: boolean;
}

export interface InstanceSetting {
  ZUIDZUID: string;
  key: string;
  keyFriendly?: string;
  value: string | boolean;
  category?: string;
  dataType?: string;
  options?: string;
  tips?: string;
}

export interface MediaBin {
  id: string;
  name?: string;
  storage_name?: string;
  default?: boolean;
  site_id?: number;
}

export interface MediaFile {
  id: string;
  url?: string;
  filename?: string;
  title?: string;
  type?: string;
  size?: number;
  bin_id?: string;
  group_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MediaGroup {
  id: string;
  name?: string;
  bin_id?: string;
  group_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Locale {
  ID?: number;
  code: string;
  name?: string;
  default?: boolean;
  active?: boolean;
  createdAt?: string;
}

export interface UsageReport {
  TotalGBs?: number;
  TotalRequests?: number;
  MediaConsumption?: {
    TotalGBs?: number;
    TotalRequests?: number;
  };
  [key: string]: unknown;
}

export interface ContentRedirect {
  ZUIDZUID?: string;
  from: string;
  to: string;
  code?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── SDK result type ──────────────────────────────────────────────────────────

export type ZestySdk = ReturnType<typeof createZestySdk>;

// ─── Internal helpers ─────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  formData?: FormData;
  /** Override auth for this request */
  authToken?: string;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createZestySdk(config: ZestyConfig = {}) {
  const {
    authToken: configAuthToken,
    sessionToken: configSessionToken,
    instanceZuid: configInstanceZuid,
    accountsBaseUrl = "https://accounts.api.zesty.io/v1",
    authBaseUrl = "https://auth.api.zesty.io",
    metricsBaseUrl = "https://metrics.zesty.io",
    mediaManagerBaseUrl = "https://media-manager.api.zesty.io",
    mediaStorageBaseUrl = "https://media-storage.api.zesty.io",
    accountsBaseUrlOverride,
    contentBaseUrlOverride,
    mediaBaseUrlOverride,
    onError,
    fetch: configFetch,
  } = config;

  const _fetch: typeof fetch = configFetch ?? globalThis.fetch;

  // ── URL builders ────────────────────────────────────────────────────────────

  function accountsUrl(path: string): string {
    const base = accountsBaseUrlOverride ?? accountsBaseUrl;
    return `${base}${path}`;
  }

  function instanceUrl(instanceZuid: string, path: string): string {
    if (contentBaseUrlOverride) {
      const base = contentBaseUrlOverride.replace("{instanceZuid}", instanceZuid);
      return `${base}${path}`;
    }
    return `https://${instanceZuid}.api.zesty.io/v1${path}`;
  }

  function mediaManagerUrl(path: string): string {
    const base = mediaBaseUrlOverride ?? mediaManagerBaseUrl;
    return `${base}${path}`;
  }

  function mediaStorageUrl(path: string): string {
    return `${mediaStorageBaseUrl}${path}`;
  }

  // ── Auth resolution ──────────────────────────────────────────────────────────

  function resolveAuth(explicitToken?: string): string | null {
    if (explicitToken) return `Bearer ${explicitToken}`;
    if (configAuthToken) return `Bearer ${configAuthToken}`;
    if (configSessionToken) return `Bearer ${configSessionToken}`;
    // Browser cookie fallback
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)(?:APP_SID|DEV_APP_SID)=([^;]+)/);
      if (match) return `Bearer ${match[1]}`;
    }
    return null;
  }

  // ── Core request ─────────────────────────────────────────────────────────────

  async function request<T = unknown>(
    method: HttpMethod,
    url: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    const { query, body, formData, authToken: explicitToken } = opts;

    // Build URL with query params
    let fullUrl = url;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v != null) params.set(k, String(v));
      }
      const qs = params.toString();
      if (qs) fullUrl += (url.includes("?") ? "&" : "?") + qs;
    }

    const headers: Record<string, string> = {};
    const auth = resolveAuth(explicitToken);
    if (auth) headers["Authorization"] = auth;

    let fetchBody: BodyInit | undefined;
    if (formData) {
      // Let the browser/Node set the Content-Type with boundary
      fetchBody = formData;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }

    let res: Response;
    try {
      res = await _fetch(fullUrl, { method, headers, body: fetchBody, cache: "no-store" });
    } catch (e) {
      const err = new ZestyApiError(
        `Network error: ${String(e)}`,
        0,
        method,
        fullUrl,
      );
      onError?.(err);
      throw err;
    }

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { error: text };
    }

    if (!res.ok) {
      // Zesty error format: { _meta: ..., error: "string" } or { message: "string" }
      const p = parsed as Record<string, unknown> | null;
      const message =
        (typeof p?.error === "string" ? p.error : null) ??
        (typeof p?.message === "string" ? p.message : null) ??
        `HTTP ${res.status}`;
      const err = new ZestyApiError(message, res.status, method, fullUrl, parsed);
      onError?.(err);
      throw err;
    }

    // Unwrap Zesty envelope: { _meta: ..., data: T }
    if (parsed && typeof parsed === "object" && "data" in (parsed as object)) {
      return (parsed as { data: T }).data;
    }
    return parsed as T;
  }

  // ── Resolve instanceZuid ─────────────────────────────────────────────────────

  function resolveInstance(provided?: string): string {
    const z = provided ?? configInstanceZuid;
    if (!z) throw new Error("instanceZuid is required — pass it as an argument or set it in config");
    return z;
  }

  // ─── Namespaces ───────────────────────────────────────────────────────────────

  // ── auth ──────────────────────────────────────────────────────────────────────

  const auth = {
    /**
     * Verify an APP_SID token. Returns the user object if valid.
     * POST https://auth.api.zesty.io/verify
     */
    async verify(token?: string): Promise<User> {
      return request<User>("POST", `${authBaseUrl}/verify`, { authToken: token });
    },

    /** Returns the Google SSO redirect URL. Navigate the browser to this URL. */
    googleLoginUrl(): string {
      return `${authBaseUrl}/google/login`;
    },

    /** Returns the GitHub SSO redirect URL. */
    githubLoginUrl(): string {
      return `${authBaseUrl}/github/login`;
    },

    /** Returns the Microsoft (Azure) SSO redirect URL. */
    microsoftLoginUrl(): string {
      return `${authBaseUrl}/azure/login`;
    },
  };

  // ── users ─────────────────────────────────────────────────────────────────────

  const users = {
    /**
     * Get the currently authenticated user.
     * GET /users/self
     */
    async getCurrent(): Promise<User> {
      return request<User>("GET", accountsUrl("/users/self"));
    },

    /**
     * Get a specific user by ZUIDZUID.
     * GET /users/{userZuid}
     */
    async get(userZuid: string): Promise<User> {
      return request<User>("GET", accountsUrl(`/users/${userZuid}`));
    },

    /**
     * Update a user's profile.
     * PUT /users/{userZuid}
     */
    async update(userZuid: string, data: Partial<User>): Promise<User> {
      return request<User>("PUT", accountsUrl(`/users/${userZuid}`), { body: data });
    },

    /**
     * List all email addresses for a user.
     * GET /users/{userZuid}/emails
     */
    async listEmails(userZuid: string): Promise<{ email: string }[]> {
      return request<{ email: string }[]>("GET", accountsUrl(`/users/${userZuid}/emails`));
    },

    /**
     * Add an email address to a user.
     * POST /users/{userZuid}/emails
     */
    async addEmail(userZuid: string, email: string): Promise<unknown> {
      return request("POST", accountsUrl(`/users/${userZuid}/emails`), { body: { email } });
    },

    /**
     * Delete an email address from a user.
     * DELETE /users/{userZuid}/emails/{email}
     */
    async deleteEmail(userZuid: string, email: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/users/${userZuid}/emails/${encodeURIComponent(email)}`));
    },

    /**
     * Update a user's password.
     * PUT /users/{userZuid}/password
     */
    async updatePassword(userZuid: string, oldPassword: string, newPassword: string): Promise<unknown> {
      return request("PUT", accountsUrl(`/users/${userZuid}/password`), {
        body: { oldPassword, newPassword },
      });
    },
  };

  // ── accounts ─────────────────────────────────────────────────────────────────

  const accounts = {
    /**
     * List all instances the authenticated user has access to.
     * GET /instances
     */
    async listInstances(): Promise<Instance[]> {
      return request<Instance[]>("GET", accountsUrl("/instances"));
    },

    /**
     * Get a single instance by ZUIDZUID.
     * GET /instances/{instanceZuid}
     */
    async getInstance(instanceZuid?: string): Promise<Instance> {
      const z = resolveInstance(instanceZuid);
      return request<Instance>("GET", accountsUrl(`/instances/${z}`));
    },

    /**
     * Update instance metadata (name, etc.).
     * PUT /instances/{instanceZuid}
     */
    async updateInstance(data: Partial<Instance>, instanceZuid?: string): Promise<Instance> {
      const z = resolveInstance(instanceZuid);
      return request<Instance>("PUT", accountsUrl(`/instances/${z}`), { body: data });
    },

    /**
     * Permanently delete an instance. Use with extreme caution.
     * DELETE /instances/{instanceZuid}
     */
    async deleteInstance(instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}`));
    },

    /**
     * List all users with roles on an instance.
     * GET /instances/{instanceZuid}/users/roles
     */
    async listUsers(instanceZuid?: string): Promise<User[]> {
      const z = resolveInstance(instanceZuid);
      return request<User[]>("GET", accountsUrl(`/instances/${z}/users/roles`));
    },

    /**
     * List all apps installed on an instance.
     * GET /instances/{instanceZuid}/apps
     */
    async listApps(instanceZuid?: string): Promise<unknown[]> {
      const z = resolveInstance(instanceZuid);
      return request<unknown[]>("GET", accountsUrl(`/instances/${z}/apps`));
    },

    /**
     * Install an app on an instance.
     * POST /instances/{instanceZuid}/apps/{appZuid}
     */
    async installApp(appZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("POST", accountsUrl(`/instances/${z}/apps/${appZuid}`));
    },

    /**
     * Uninstall an app from an instance.
     * DELETE /instances/{instanceZuid}/apps/{appZuid}
     */
    async uninstallApp(appZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}/apps/${appZuid}`));
    },
  };

  // ── roles ─────────────────────────────────────────────────────────────────────

  const roles = {
    /**
     * List all roles for an instance.
     * GET /instances/{instanceZuid}/roles
     */
    async list(instanceZuid?: string): Promise<Role[]> {
      const z = resolveInstance(instanceZuid);
      return request<Role[]>("GET", accountsUrl(`/instances/${z}/roles`));
    },

    /**
     * Create a new custom role.
     * POST /roles
     */
    async create(data: { name: string; description?: string; instanceZUID: string; systemRole?: boolean }): Promise<Role> {
      return request<Role>("POST", accountsUrl("/roles"), { body: data });
    },

    /**
     * Update an existing role.
     * PUT /roles/{roleZuid}
     */
    async update(roleZuid: string, data: Partial<Role>): Promise<Role> {
      return request<Role>("PUT", accountsUrl(`/roles/${roleZuid}`), { body: data });
    },

    /**
     * Delete a custom role.
     * DELETE /roles/{roleZuid}
     */
    async delete(roleZuid: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/roles/${roleZuid}`));
    },

    /**
     * Get granular permission rules for a role.
     * GET /roles/{roleZuid}/granularRoles
     */
    async getGranular(roleZuid: string): Promise<GranularRole[]> {
      return request<GranularRole[]>("GET", accountsUrl(`/roles/${roleZuid}/granularRoles`));
    },

    /**
     * Create a granular permission rule.
     * POST /roles/{roleZuid}/granularRoles
     */
    async createGranular(roleZuid: string, data: Omit<GranularRole, "ZUIDZUID">): Promise<GranularRole> {
      return request<GranularRole>("POST", accountsUrl(`/roles/${roleZuid}/granularRoles`), { body: data });
    },

    /**
     * Batch update granular permissions.
     * PUT /roles/{roleZuid}/granularRoles
     */
    async updateGranular(roleZuid: string, data: GranularRole[]): Promise<GranularRole[]> {
      return request<GranularRole[]>("PUT", accountsUrl(`/roles/${roleZuid}/granularRoles`), { body: data });
    },

    /**
     * Delete a granular permission rule.
     * DELETE /roles/{roleZuid}/granularRoles/{resourceZuid}
     */
    async deleteGranular(roleZuid: string, resourceZuid: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/roles/${roleZuid}/granularRoles/${resourceZuid}`));
    },

    /**
     * List users in a role.
     * GET /roles/{roleZuid}/users
     */
    async listUsers(roleZuid: string): Promise<User[]> {
      return request<User[]>("GET", accountsUrl(`/roles/${roleZuid}/users`));
    },

    /**
     * Add a user to a role (grants instance access).
     * POST /roles/{roleZuid}/users
     */
    async addUser(roleZuid: string, userZuid: string): Promise<unknown> {
      return request("POST", accountsUrl(`/roles/${roleZuid}/users`), { body: { userZUID: userZuid } });
    },

    /**
     * Remove a user from a role (revokes instance access).
     * DELETE /roles/{roleZuid}/users/{userZuid}
     */
    async removeUser(roleZuid: string, userZuid: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/roles/${roleZuid}/users/${userZuid}`));
    },
  };

  // ── teams ─────────────────────────────────────────────────────────────────────

  const teams = {
    /**
     * List all teams in the organization.
     * GET /teams
     */
    async list(): Promise<Team[]> {
      return request<Team[]>("GET", accountsUrl("/teams"));
    },

    /**
     * Create a new team.
     * POST /teams
     */
    async create(data: { name: string; description?: string }): Promise<Team> {
      return request<Team>("POST", accountsUrl("/teams"), { body: data });
    },

    /**
     * Get a specific team.
     * GET /teams/{teamZuid}
     */
    async get(teamZuid: string): Promise<Team> {
      return request<Team>("GET", accountsUrl(`/teams/${teamZuid}`));
    },

    /**
     * Update a team.
     * PUT /teams/{teamZuid}
     */
    async update(teamZuid: string, data: Partial<Team>): Promise<Team> {
      return request<Team>("PUT", accountsUrl(`/teams/${teamZuid}`), { body: data });
    },

    /**
     * Delete a team.
     * DELETE /teams/{teamZuid}
     */
    async delete(teamZuid: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/teams/${teamZuid}`));
    },

    /**
     * List members of a team.
     * GET /teams/{teamZuid}/users
     */
    async listMembers(teamZuid: string): Promise<TeamMember[]> {
      return request<TeamMember[]>("GET", accountsUrl(`/teams/${teamZuid}/users`));
    },

    /**
     * Invite a user to a team.
     * POST /teams/{teamZuid}/invites
     */
    async inviteMember(teamZuid: string, data: { inviteeName: string; inviteeEmail: string }): Promise<unknown> {
      return request("POST", accountsUrl(`/teams/${teamZuid}/invites`), { body: data });
    },

    /**
     * Remove a user from a team.
     * DELETE /teams/{teamZuid}/users/{userZuid}
     */
    async removeMember(teamZuid: string, userZuid: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/teams/${teamZuid}/users/${userZuid}`));
    },

    /**
     * List instances a team has access to.
     * GET /teams/{teamZuid}/instances
     */
    async listInstances(teamZuid: string): Promise<Instance[]> {
      return request<Instance[]>("GET", accountsUrl(`/teams/${teamZuid}/instances`));
    },

    /**
     * Add a team to an instance with a specific role.
     * POST /instances/{instanceZuid}/teams
     */
    async addToInstance(instanceZuid: string, teamZuid: string, roleZuid: string): Promise<unknown> {
      return request("POST", accountsUrl(`/instances/${instanceZuid}/teams`), {
        body: { teamZUID: teamZuid, roleZUID: roleZuid },
      });
    },

    /**
     * Remove a team from an instance.
     * DELETE /instances/{instanceZuid}/teams/{teamZuid}
     */
    async removeFromInstance(instanceZuid: string, teamZuid: string): Promise<unknown> {
      return request("DELETE", accountsUrl(`/instances/${instanceZuid}/teams/${teamZuid}`));
    },

    /**
     * List teams on an instance.
     * GET /instances/{instanceZuid}/teams
     */
    async listOnInstance(instanceZuid?: string): Promise<Team[]> {
      const z = resolveInstance(instanceZuid);
      return request<Team[]>("GET", accountsUrl(`/instances/${z}/teams`));
    },
  };

  // ── invites ───────────────────────────────────────────────────────────────────

  const invites = {
    /**
     * Invite a user to an instance.
     * POST /invites
     *
     * @param inviteeName - Display name
     * @param inviteeEmail - Email address
     * @param entityZUID - Instance ZUIDZUID the invite is for
     * @param accessLevel - Integer 1–5 (1=Contributor, 2=Publisher, 3=Developer, 4=SEO, 5=Admin)
     */
    async create(
      inviteeName: string,
      inviteeEmail: string,
      entityZUID: string,
      accessLevel: 1 | 2 | 3 | 4 | 5,
    ): Promise<Invite> {
      return request<Invite>("POST", accountsUrl("/invites"), {
        body: { inviteeName, inviteeEmail, entityZUID, accessLevel },
      });
    },
  };

  // ── domains ───────────────────────────────────────────────────────────────────

  const domains = {
    /**
     * List all domains for an instance.
     * GET /instances/{instanceZuid}/domains
     */
    async list(instanceZuid?: string): Promise<Domain[]> {
      const z = resolveInstance(instanceZuid);
      return request<Domain[]>("GET", accountsUrl(`/instances/${z}/domains`));
    },

    /**
     * Add a domain to an instance.
     * POST /instances/{instanceZuid}/domains
     */
    async create(data: { domain: string; branch?: string }, instanceZuid?: string): Promise<Domain> {
      const z = resolveInstance(instanceZuid);
      return request<Domain>("POST", accountsUrl(`/instances/${z}/domains`), { body: data });
    },

    /**
     * Remove a domain from an instance.
     * DELETE /instances/{instanceZuid}/domains/{domainZuid}
     */
    async delete(domainZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}/domains/${domainZuid}`));
    },
  };

  // ── tokens ────────────────────────────────────────────────────────────────────

  const tokens = {
    /**
     * List all API tokens for an instance.
     * GET /instances/{instanceZuid}/tokens
     */
    async list(instanceZuid?: string): Promise<Token[]> {
      const z = resolveInstance(instanceZuid);
      return request<Token[]>("GET", accountsUrl(`/instances/${z}/tokens`));
    },

    /**
     * Create a new API token.
     * POST /instances/{instanceZuid}/tokens
     */
    async create(data: { name: string; roleZUID?: string; expiresAt?: string }, instanceZuid?: string): Promise<Token> {
      const z = resolveInstance(instanceZuid);
      return request<Token>("POST", accountsUrl(`/instances/${z}/tokens`), { body: data });
    },

    /**
     * Delete an API token.
     * DELETE /instances/{instanceZuid}/tokens/{tokenZuid}
     */
    async delete(tokenZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}/tokens/${tokenZuid}`));
    },
  };

  // ── webhooks ──────────────────────────────────────────────────────────────────

  const webhooks = {
    /**
     * List all webhooks for an instance.
     * GET {instanceZuid}.api.zesty.io/v1/web/hooks
     */
    async list(instanceZuid?: string): Promise<Webhook[]> {
      const z = resolveInstance(instanceZuid);
      return request<Webhook[]>("GET", instanceUrl(z, "/web/hooks"));
    },

    /**
     * Create a webhook.
     * POST {instanceZuid}.api.zesty.io/v1/web/hooks
     */
    async create(
      data: { method: string; url: string; eventAction?: number; contentType?: string; payload?: string },
      instanceZuid?: string,
    ): Promise<Webhook> {
      const z = resolveInstance(instanceZuid);
      return request<Webhook>("POST", instanceUrl(z, "/web/hooks"), { body: data });
    },

    /**
     * Update a webhook.
     * PUT {instanceZuid}.api.zesty.io/v1/web/hooks/{hookZuid}
     */
    async update(hookZuid: string, data: Partial<Webhook>, instanceZuid?: string): Promise<Webhook> {
      const z = resolveInstance(instanceZuid);
      return request<Webhook>("PUT", instanceUrl(z, `/web/hooks/${hookZuid}`), { body: data });
    },

    /**
     * Delete a webhook.
     * DELETE {instanceZuid}.api.zesty.io/v1/web/hooks/{hookZuid}
     */
    async delete(hookZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/web/hooks/${hookZuid}`));
    },
  };

  // ── audits ────────────────────────────────────────────────────────────────────

  const audits = {
    /**
     * List audit log entries for an instance.
     * GET /instances/{instanceZuid}/audits
     */
    async list(
      opts: { limit?: number; start?: number; affectedZUID?: string; action?: string } = {},
      instanceZuid?: string,
    ): Promise<AuditLog[]> {
      const z = resolveInstance(instanceZuid);
      return request<AuditLog[]>("GET", accountsUrl(`/instances/${z}/audits`), {
        query: opts as Record<string, string | number>,
      });
    },
  };

  // ── content namespace ─────────────────────────────────────────────────────────

  const contentModels = {
    /**
     * List all content models.
     * GET /content/models
     */
    async list(instanceZuid?: string): Promise<ContentModel[]> {
      const z = resolveInstance(instanceZuid);
      return request<ContentModel[]>("GET", instanceUrl(z, "/content/models"));
    },

    /**
     * Get a content model.
     * GET /content/models/{modelZuid}
     */
    async get(modelZuid: string, instanceZuid?: string): Promise<ContentModel> {
      const z = resolveInstance(instanceZuid);
      return request<ContentModel>("GET", instanceUrl(z, `/content/models/${modelZuid}`));
    },

    /**
     * Create a new content model.
     * POST /content/models
     *
     * type: "templateset" (page), "pageset" (collection), "dataset" (headless block)
     */
    async create(
      data: { name: string; label: string; type: "templateset" | "pageset" | "dataset" },
      instanceZuid?: string,
    ): Promise<ContentModel> {
      const z = resolveInstance(instanceZuid);
      return request<ContentModel>("POST", instanceUrl(z, "/content/models"), { body: data });
    },

    /**
     * Update a content model.
     * PATCH /content/models/{modelZuid}
     */
    async update(modelZuid: string, data: Partial<ContentModel>, instanceZuid?: string): Promise<ContentModel> {
      const z = resolveInstance(instanceZuid);
      return request<ContentModel>("PATCH", instanceUrl(z, `/content/models/${modelZuid}`), { body: data });
    },

    /**
     * Delete a content model.
     * DELETE /content/models/{modelZuid}
     */
    async delete(modelZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/content/models/${modelZuid}`));
    },
  };

  const contentFields = {
    /**
     * List all fields for a content model.
     * GET /content/models/{modelZuid}/fields
     */
    async list(modelZuid: string, instanceZuid?: string): Promise<ContentField[]> {
      const z = resolveInstance(instanceZuid);
      return request<ContentField[]>("GET", instanceUrl(z, `/content/models/${modelZuid}/fields`));
    },

    /**
     * Get a single field.
     * GET /content/models/{modelZuid}/fields/{fieldZuid}
     */
    async get(modelZuid: string, fieldZuid: string, instanceZuid?: string): Promise<ContentField> {
      const z = resolveInstance(instanceZuid);
      return request<ContentField>("GET", instanceUrl(z, `/content/models/${modelZuid}/fields/${fieldZuid}`));
    },

    /**
     * Create a field on a content model.
     * POST /content/models/{modelZuid}/fields
     *
     * datatype: text | textarea | wysiwyg_basic | wysiwyg_advanced | markdown |
     *           images | files | date | datetime | number | yes_no | dropdown |
     *           one_to_one | one_to_many | internal_link | link
     */
    async create(
      modelZuid: string,
      data: Omit<ContentField, "ZUIDZUID"> & { contentModelZUID?: string },
      instanceZuid?: string,
    ): Promise<ContentField> {
      const z = resolveInstance(instanceZuid);
      const wysiwygTypes = ["wysiwyg_basic", "wysiwyg_advanced"];
      const body = {
        contentModelZUID: modelZuid,
        ...data,
        settings: {
          list: !wysiwygTypes.includes(data.datatype),
          defaultValue: null,
          ...(data.settings ?? {}),
        },
      };
      return request<ContentField>("POST", instanceUrl(z, `/content/models/${modelZuid}/fields`), { body });
    },

    /**
     * Update a field.
     * PATCH /content/models/{modelZuid}/fields/{fieldZuid}
     */
    async update(modelZuid: string, fieldZuid: string, data: Partial<ContentField>, instanceZuid?: string): Promise<ContentField> {
      const z = resolveInstance(instanceZuid);
      return request<ContentField>("PATCH", instanceUrl(z, `/content/models/${modelZuid}/fields/${fieldZuid}`), { body: data });
    },

    /**
     * Delete a field.
     * DELETE /content/models/{modelZuid}/fields/{fieldZuid}
     */
    async delete(modelZuid: string, fieldZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/content/models/${modelZuid}/fields/${fieldZuid}`));
    },
  };

  const contentItems = {
    /**
     * List items for a content model.
     * GET /content/models/{modelZuid}/items
     */
    async list(
      modelZuid: string,
      opts: { limit?: number; page?: number; lang?: string } = {},
      instanceZuid?: string,
    ): Promise<ContentItem[]> {
      const z = resolveInstance(instanceZuid);
      return request<ContentItem[]>("GET", instanceUrl(z, `/content/models/${modelZuid}/items`), {
        query: opts as Record<string, string | number>,
      });
    },

    /**
     * Get a single content item.
     * GET /content/models/{modelZuid}/items/{itemZuid}
     */
    async get(modelZuid: string, itemZuid: string, instanceZuid?: string): Promise<ContentItem> {
      const z = resolveInstance(instanceZuid);
      return request<ContentItem>("GET", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`));
    },

    /**
     * Create a new content item.
     * POST /content/models/{modelZuid}/items
     *
     * The `web` object controls SEO metadata and URL path.
     * `meta.langID` defaults to 1 (English).
     */
    async create(
      modelZuid: string,
      data: {
        data: Record<string, unknown>;
        web?: Partial<ContentItemWeb> & { pathPart?: string };
        meta?: { langID?: number; contentModelZUID?: string };
      },
      instanceZuid?: string,
    ): Promise<ContentItem> {
      const z = resolveInstance(instanceZuid);
      const body = {
        data: data.data,
        web: { canonicalTagMode: 1, ...data.web },
        meta: { langID: 1, contentModelZUID: modelZuid, ...data.meta },
      };
      return request<ContentItem>("POST", instanceUrl(z, `/content/models/${modelZuid}/items`), { body });
    },

    /**
     * Update a content item (replaces data fields).
     * PUT /content/models/{modelZuid}/items/{itemZuid}
     */
    async update(
      modelZuid: string,
      itemZuid: string,
      data: { data?: Record<string, unknown>; web?: Partial<ContentItemWeb>; meta?: Partial<ContentItemMeta> },
      instanceZuid?: string,
    ): Promise<ContentItem> {
      const z = resolveInstance(instanceZuid);
      return request<ContentItem>("PUT", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`), { body: data });
    },

    /**
     * Patch a content item (partial update).
     * PATCH /content/models/{modelZuid}/items/{itemZuid}
     */
    async patch(
      modelZuid: string,
      itemZuid: string,
      data: { data?: Record<string, unknown>; web?: Partial<ContentItemWeb>; meta?: Partial<ContentItemMeta> },
      instanceZuid?: string,
    ): Promise<ContentItem> {
      const z = resolveInstance(instanceZuid);
      return request<ContentItem>("PATCH", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`), { body: data });
    },

    /**
     * Delete a content item.
     * DELETE /content/models/{modelZuid}/items/{itemZuid}
     */
    async delete(modelZuid: string, itemZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`));
    },

    /**
     * Publish a content item version.
     * POST /content/models/{modelZuid}/items/{itemZuid}/publishings
     *
     * Pass the version number from the item's meta.version.
     */
    async publish(
      modelZuid: string,
      itemZuid: string,
      opts: { version: number; publishesAt?: string; unpublishAt?: string } = { version: 1 },
      instanceZuid?: string,
    ): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}/publishings`), {
        body: {
          version: opts.version,
          publishes_at: opts.publishesAt ?? new Date().toISOString(),
          unpublish_at: opts.unpublishAt ?? null,
        },
      });
    },

    /**
     * Full-text search across content items.
     * GET /search/items?q={query}&limit={limit}
     */
    async search(
      query: string,
      opts: { limit?: number } = {},
      instanceZuid?: string,
    ): Promise<ContentItem[]> {
      const z = resolveInstance(instanceZuid);
      return request<ContentItem[]>("GET", instanceUrl(z, "/search/items"), {
        query: { q: query, limit: opts.limit ?? 100 },
      });
    },
  };

  const contentViews = {
    /**
     * List all code views/templates.
     * GET /web/views
     */
    async list(instanceZuid?: string): Promise<ContentView[]> {
      const z = resolveInstance(instanceZuid);
      return request<ContentView[]>("GET", instanceUrl(z, "/web/views"));
    },

    /**
     * Get a single view.
     * GET /web/views/{viewZuid}
     */
    async get(viewZuid: string, instanceZuid?: string): Promise<ContentView> {
      const z = resolveInstance(instanceZuid);
      return request<ContentView>("GET", instanceUrl(z, `/web/views/${viewZuid}`));
    },

    /**
     * Create a new view/template.
     * POST /web/views
     */
    async create(
      data: { fileName: string; code: string; type?: string },
      instanceZuid?: string,
    ): Promise<ContentView> {
      const z = resolveInstance(instanceZuid);
      return request<ContentView>("POST", instanceUrl(z, "/web/views"), {
        body: { type: "ajax-json", ...data },
      });
    },

    /**
     * Update a view's code.
     * PUT /web/views/{viewZuid}
     */
    async update(viewZuid: string, code: string, instanceZuid?: string): Promise<ContentView> {
      const z = resolveInstance(instanceZuid);
      return request<ContentView>("PUT", instanceUrl(z, `/web/views/${viewZuid}`), { body: { code } });
    },

    /**
     * Publish a view version so it goes live on WebEngine.
     * POST /web/views/{viewZuid}/versions/{version}?purge_cache=false
     */
    async publish(viewZuid: string, version: number, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, `/web/views/${viewZuid}/versions/${version}?purge_cache=false`));
    },
  };

  const contentHeadTags = {
    /**
     * List all head tags.
     * GET /web/headtags
     */
    async list(instanceZuid?: string): Promise<HeadTag[]> {
      const z = resolveInstance(instanceZuid);
      return request<HeadTag[]>("GET", instanceUrl(z, "/web/headtags"));
    },

    /**
     * Create a head tag.
     * POST /web/headtags
     */
    async create(
      data: { resourceZUID: string; type: string; attributes: Record<string, string>; sort?: number },
      instanceZuid?: string,
    ): Promise<HeadTag> {
      const z = resolveInstance(instanceZuid);
      return request<HeadTag>("POST", instanceUrl(z, "/web/headtags"), {
        body: {
          custom: true,
          sort: 0,
          ...data,
          attributes: { ...data.attributes, custom: "true" },
        },
      });
    },

    /**
     * Delete a head tag.
     * DELETE /web/headtags/{headtagZuid}
     */
    async delete(headtagZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/web/headtags/${headtagZuid}`));
    },
  };

  const contentLanguages = {
    /**
     * List active locales/languages for an instance.
     * GET /env/langs
     */
    async list(instanceZuid?: string): Promise<Locale[]> {
      const z = resolveInstance(instanceZuid);
      return request<Locale[]>("GET", instanceUrl(z, "/env/langs"));
    },
  };

  const contentSettings = {
    /**
     * List all instance settings.
     * GET /env/settings
     */
    async list(instanceZuid?: string): Promise<InstanceSetting[]> {
      const z = resolveInstance(instanceZuid);
      return request<InstanceSetting[]>("GET", instanceUrl(z, "/env/settings"));
    },

    /**
     * Update a single instance setting.
     * PUT /env/settings/{settingZuid}
     */
    async update(settingZuid: string, data: Partial<InstanceSetting>, instanceZuid?: string): Promise<InstanceSetting> {
      const z = resolveInstance(instanceZuid);
      return request<InstanceSetting>("PUT", instanceUrl(z, `/env/settings/${settingZuid}`), { body: data });
    },
  };

  const contentRedirects = {
    /**
     * List all redirects for an instance.
     * GET /web/redirects
     */
    async list(instanceZuid?: string): Promise<ContentRedirect[]> {
      const z = resolveInstance(instanceZuid);
      return request<ContentRedirect[]>("GET", instanceUrl(z, "/web/redirects"));
    },

    /**
     * Create a redirect.
     * POST /web/redirects
     */
    async create(
      data: { from: string; to: string; code?: number },
      instanceZuid?: string,
    ): Promise<ContentRedirect> {
      const z = resolveInstance(instanceZuid);
      return request<ContentRedirect>("POST", instanceUrl(z, "/web/redirects"), { body: data });
    },

    /**
     * Delete a redirect.
     * DELETE /web/redirects/{redirectZuid}
     */
    async delete(redirectZuid: string, instanceZuid?: string): Promise<unknown> {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/web/redirects/${redirectZuid}`));
    },
  };

  const content = {
    models: contentModels,
    fields: contentFields,
    items: contentItems,
    views: contentViews,
    headTags: contentHeadTags,
    languages: contentLanguages,
    settings: contentSettings,
    redirects: contentRedirects,
  };

  // ── metrics ───────────────────────────────────────────────────────────────────

  const metrics = {
    /**
     * Get usage statistics for an instance.
     * GET metrics.zesty.io/v1/metrics/usage/{instanceZuid}
     */
    async getUsage(
      opts: { dateStart?: string; dateEnd?: string; granularity?: string } = {},
      instanceZuid?: string,
    ): Promise<UsageReport> {
      const z = resolveInstance(instanceZuid);
      return request<UsageReport>("GET", `${metricsBaseUrl}/v1/metrics/usage/${z}`, {
        query: opts as Record<string, string>,
      });
    },

    /**
     * Get CDN request counts.
     * GET metrics.zesty.io/v1/metrics/requests/{instanceZuid}
     */
    async getRequests(
      opts: { dateStart?: string; dateEnd?: string } = {},
      instanceZuid?: string,
    ): Promise<UsageReport> {
      const z = resolveInstance(instanceZuid);
      return request<UsageReport>("GET", `${metricsBaseUrl}/v1/metrics/requests/${z}`, {
        query: opts as Record<string, string>,
      });
    },
  };

  // ── media ─────────────────────────────────────────────────────────────────────

  const mediaBins = {
    /**
     * List media bins for an instance.
     * GET https://media-manager.api.zesty.io/site/{instanceId}/bins
     *
     * Note: instanceId is the numeric ID, not the ZUIDZUID. Call accounts.getInstance()
     * to get it from Instance.ID.
     */
    async list(instanceId: number | string): Promise<MediaBin[]> {
      return request<MediaBin[]>("GET", mediaManagerUrl(`/site/${instanceId}/bins`));
    },

    /**
     * Search media files across bins.
     * GET https://media-manager.api.zesty.io/search/files?bins={binZuid}&term={term}
     */
    async search(
      binZuid: string,
      term: string,
      opts: { limit?: number } = {},
    ): Promise<MediaFile[]> {
      return request<MediaFile[]>("GET", mediaManagerUrl("/search/files"), {
        query: { bins: binZuid, term, limit: opts.limit },
      });
    },

    /**
     * List files in a media group/bin.
     * GET https://media-manager.api.zesty.io/site/{instanceId}/groups/{groupId}/files
     */
    async listFiles(instanceId: number | string, groupId: string): Promise<MediaFile[]> {
      return request<MediaFile[]>("GET", mediaManagerUrl(`/site/${instanceId}/groups/${groupId}/files`));
    },

    /**
     * Update a media file's metadata.
     * PATCH https://media-manager.api.zesty.io/media/{fileId}
     */
    async updateFile(fileId: string, data: { title?: string; filename?: string }): Promise<MediaFile> {
      return request<MediaFile>("PATCH", mediaManagerUrl(`/media/${fileId}`), { body: data });
    },

    /**
     * Delete a media file.
     * DELETE https://media-manager.api.zesty.io/media/{fileId}
     */
    async deleteFile(fileId: string): Promise<unknown> {
      return request("DELETE", mediaManagerUrl(`/media/${fileId}`));
    },
  };

  const media = {
    bins: mediaBins,

    /**
     * Upload a file to the Zesty Media Storage API.
     *
     * FormData fields (required by Zesty):
     *   bin_id   — ZUIDZUID of the media bin
     *   user_id  — ZUIDZUID of the user performing the upload
     *   group_id — ZUIDZUID of the group (same as bin_id for root uploads)
     *   file     — the file Blob with filename
     *   title    — (optional) display title
     *
     * @param bucketName  - storage_name from the bin (e.g. "my-instance-abc123")
     * @param file        - File | Blob | ArrayBuffer | Buffer
     * @param opts.binId  - media bin ZUIDZUID
     * @param opts.userId - uploading user ZUIDZUID
     * @param opts.groupId - group ZUIDZUID (defaults to binId)
     * @param opts.filename - filename for the upload
     * @param opts.mimeType - MIME type (default: "image/png")
     * @param opts.title   - display title (optional)
     */
    async upload(
      bucketName: string,
      file: File | Blob | ArrayBuffer,
      opts: {
        binId: string;
        userId: string;
        groupId?: string;
        filename?: string;
        mimeType?: string;
        title?: string;
      },
    ): Promise<MediaFile> {
      const { binId, userId, groupId = binId, filename = "upload", mimeType = "image/png", title } = opts;

      let blob: Blob;
      if (file instanceof File || file instanceof Blob) {
        blob = file;
      } else {
        blob = new Blob([file], { type: mimeType });
      }

      const formData = new FormData();
      formData.append("bin_id", binId);
      formData.append("user_id", userId);
      formData.append("group_id", groupId);
      if (title) formData.append("title", title);
      formData.append("file", blob, file instanceof File ? file.name : filename);

      const result = await request<MediaFile[] | MediaFile>(
        "POST",
        mediaStorageUrl(`/upload/gcp/${bucketName}`),
        { formData },
      );

      // Response is an array; return the first entry
      return Array.isArray(result) ? result[0] : result;
    },
  };

  // ─── Return SDK object ────────────────────────────────────────────────────────

  return {
    auth,
    users,
    accounts,
    roles,
    teams,
    invites,
    domains,
    tokens,
    webhooks,
    audits,
    content,
    metrics,
    media,
  };
}

export default createZestySdk;
