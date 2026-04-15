// zesty-sdk.ts
var ZestyApiError = class extends Error {
  constructor(message, status, method, url, body = null) {
    super(message);
    this.status = status;
    this.method = method;
    this.url = url;
    this.body = body;
    this.name = "ZestyApiError";
  }
};
function createZestySdk(config = {}) {
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
    fetch: configFetch
  } = config;
  const _fetch = configFetch ?? globalThis.fetch;
  function accountsUrl(path) {
    const base = accountsBaseUrlOverride ?? accountsBaseUrl;
    return `${base}${path}`;
  }
  function instanceUrl(instanceZuid, path) {
    if (contentBaseUrlOverride) {
      const base = contentBaseUrlOverride.replace("{instanceZuid}", instanceZuid);
      return `${base}${path}`;
    }
    return `https://${instanceZuid}.api.zesty.io/v1${path}`;
  }
  function mediaManagerUrl(path) {
    const base = mediaBaseUrlOverride ?? mediaManagerBaseUrl;
    return `${base}${path}`;
  }
  function mediaStorageUrl(path) {
    return `${mediaStorageBaseUrl}${path}`;
  }
  function resolveAuth(explicitToken) {
    if (explicitToken) return `Bearer ${explicitToken}`;
    if (configAuthToken) return `Bearer ${configAuthToken}`;
    if (configSessionToken) return `Bearer ${configSessionToken}`;
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)(?:APP_SID|DEV_APP_SID)=([^;]+)/);
      if (match) return `Bearer ${match[1]}`;
    }
    return null;
  }
  async function request(method, url, opts = {}) {
    const { query, body, formData, authToken: explicitToken } = opts;
    let fullUrl = url;
    if (query) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v != null) params.set(k, String(v));
      }
      const qs = params.toString();
      if (qs) fullUrl += (url.includes("?") ? "&" : "?") + qs;
    }
    const headers = {};
    const auth2 = resolveAuth(explicitToken);
    if (auth2) headers["Authorization"] = auth2;
    let fetchBody;
    if (formData) {
      fetchBody = formData;
    } else if (body !== void 0) {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }
    let res;
    try {
      res = await _fetch(fullUrl, { method, headers, body: fetchBody, cache: "no-store" });
    } catch (e) {
      const err = new ZestyApiError(
        `Network error: ${String(e)}`,
        0,
        method,
        fullUrl
      );
      onError?.(err);
      throw err;
    }
    const text = await res.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = { error: text };
    }
    if (!res.ok) {
      const p = parsed;
      const message = (typeof p?.error === "string" ? p.error : null) ?? (typeof p?.message === "string" ? p.message : null) ?? `HTTP ${res.status}`;
      const err = new ZestyApiError(message, res.status, method, fullUrl, parsed);
      onError?.(err);
      throw err;
    }
    if (parsed && typeof parsed === "object" && "data" in parsed) {
      return parsed.data;
    }
    return parsed;
  }
  function resolveInstance(provided) {
    const z = provided ?? configInstanceZuid;
    if (!z) throw new Error("instanceZuid is required \u2014 pass it as an argument or set it in config");
    return z;
  }
  const auth = {
    /**
     * Verify an APP_SID token. Returns the user object if valid.
     * POST https://auth.api.zesty.io/verify
     */
    async verify(token) {
      return request("POST", `${authBaseUrl}/verify`, { authToken: token });
    },
    /** Returns the Google SSO redirect URL. Navigate the browser to this URL. */
    googleLoginUrl() {
      return `${authBaseUrl}/google/login`;
    },
    /** Returns the GitHub SSO redirect URL. */
    githubLoginUrl() {
      return `${authBaseUrl}/github/login`;
    },
    /** Returns the Microsoft (Azure) SSO redirect URL. */
    microsoftLoginUrl() {
      return `${authBaseUrl}/azure/login`;
    }
  };
  const users = {
    /**
     * Get the currently authenticated user.
     * GET /users/self
     */
    async getCurrent() {
      return request("GET", accountsUrl("/users/self"));
    },
    /**
     * Get a specific user by ZUID.
     * GET /users/{userZuid}
     */
    async get(userZuid) {
      return request("GET", accountsUrl(`/users/${userZuid}`));
    },
    /**
     * Update a user's profile.
     * PUT /users/{userZuid}
     */
    async update(userZuid, data) {
      return request("PUT", accountsUrl(`/users/${userZuid}`), { body: data });
    },
    /**
     * List all email addresses for a user.
     * GET /users/{userZuid}/emails
     */
    async listEmails(userZuid) {
      return request("GET", accountsUrl(`/users/${userZuid}/emails`));
    },
    /**
     * Add an email address to a user.
     * POST /users/{userZuid}/emails
     */
    async addEmail(userZuid, email) {
      return request("POST", accountsUrl(`/users/${userZuid}/emails`), { body: { email } });
    },
    /**
     * Delete an email address from a user.
     * DELETE /users/{userZuid}/emails/{email}
     */
    async deleteEmail(userZuid, email) {
      return request("DELETE", accountsUrl(`/users/${userZuid}/emails/${encodeURIComponent(email)}`));
    },
    /**
     * Update a user's password.
     * PUT /users/{userZuid}/password
     */
    async updatePassword(userZuid, oldPassword, newPassword) {
      return request("PUT", accountsUrl(`/users/${userZuid}/password`), {
        body: { oldPassword, newPassword }
      });
    }
  };
  const accounts = {
    /**
     * List all instances the authenticated user has access to.
     * GET /instances
     */
    async listInstances() {
      return request("GET", accountsUrl("/instances"));
    },
    /**
     * Get a single instance by ZUID.
     * GET /instances/{instanceZuid}
     */
    async getInstance(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}`));
    },
    /**
     * Update instance metadata (name, etc.).
     * PUT /instances/{instanceZuid}
     */
    async updateInstance(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PUT", accountsUrl(`/instances/${z}`), { body: data });
    },
    /**
     * Permanently delete an instance. Use with extreme caution.
     * DELETE /instances/{instanceZuid}
     */
    async deleteInstance(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}`));
    },
    /**
     * List all users with roles on an instance.
     * GET /instances/{instanceZuid}/users/roles
     */
    async listUsers(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/users/roles`));
    },
    /**
     * List all apps installed on an instance.
     * GET /instances/{instanceZuid}/apps
     */
    async listApps(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/apps`));
    },
    /**
     * Install an app on an instance.
     * POST /instances/{instanceZuid}/apps/{appZuid}
     */
    async installApp(appZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", accountsUrl(`/instances/${z}/apps/${appZuid}`));
    },
    /**
     * Uninstall an app from an instance.
     * DELETE /instances/{instanceZuid}/apps/{appZuid}
     */
    async uninstallApp(appZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}/apps/${appZuid}`));
    }
  };
  const roles = {
    /**
     * List all roles for an instance.
     * GET /instances/{instanceZuid}/roles
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/roles`));
    },
    /**
     * Create a new custom role.
     * POST /roles
     */
    async create(data) {
      return request("POST", accountsUrl("/roles"), { body: data });
    },
    /**
     * Update an existing role.
     * PUT /roles/{roleZuid}
     */
    async update(roleZuid, data) {
      return request("PUT", accountsUrl(`/roles/${roleZuid}`), { body: data });
    },
    /**
     * Delete a custom role.
     * DELETE /roles/{roleZuid}
     */
    async delete(roleZuid) {
      return request("DELETE", accountsUrl(`/roles/${roleZuid}`));
    },
    /**
     * Get granular permission rules for a role.
     * GET /roles/{roleZuid}/granularRoles
     */
    async getGranular(roleZuid) {
      return request("GET", accountsUrl(`/roles/${roleZuid}/granularRoles`));
    },
    /**
     * Create a granular permission rule.
     * POST /roles/{roleZuid}/granularRoles
     */
    async createGranular(roleZuid, data) {
      return request("POST", accountsUrl(`/roles/${roleZuid}/granularRoles`), { body: data });
    },
    /**
     * Batch update granular permissions.
     * PUT /roles/{roleZuid}/granularRoles
     */
    async updateGranular(roleZuid, data) {
      return request("PUT", accountsUrl(`/roles/${roleZuid}/granularRoles`), { body: data });
    },
    /**
     * Delete a granular permission rule.
     * DELETE /roles/{roleZuid}/granularRoles/{resourceZuid}
     */
    async deleteGranular(roleZuid, resourceZuid) {
      return request("DELETE", accountsUrl(`/roles/${roleZuid}/granularRoles/${resourceZuid}`));
    },
    /**
     * List users in a role.
     * GET /roles/{roleZuid}/users
     */
    async listUsers(roleZuid) {
      return request("GET", accountsUrl(`/roles/${roleZuid}/users`));
    },
    /**
     * Add a user to a role (grants instance access).
     * POST /roles/{roleZuid}/users
     */
    async addUser(roleZuid, userZuid) {
      return request("POST", accountsUrl(`/roles/${roleZuid}/users`), { body: { userZUID: userZuid } });
    },
    /**
     * Remove a user from a role (revokes instance access).
     * DELETE /roles/{roleZuid}/users/{userZuid}
     */
    async removeUser(roleZuid, userZuid) {
      return request("DELETE", accountsUrl(`/roles/${roleZuid}/users/${userZuid}`));
    }
  };
  const teams = {
    /**
     * List all teams in the organization.
     * GET /teams
     */
    async list() {
      return request("GET", accountsUrl("/teams"));
    },
    /**
     * Create a new team.
     * POST /teams
     */
    async create(data) {
      return request("POST", accountsUrl("/teams"), { body: data });
    },
    /**
     * Get a specific team.
     * GET /teams/{teamZuid}
     */
    async get(teamZuid) {
      return request("GET", accountsUrl(`/teams/${teamZuid}`));
    },
    /**
     * Update a team.
     * PUT /teams/{teamZuid}
     */
    async update(teamZuid, data) {
      return request("PUT", accountsUrl(`/teams/${teamZuid}`), { body: data });
    },
    /**
     * Delete a team.
     * DELETE /teams/{teamZuid}
     */
    async delete(teamZuid) {
      return request("DELETE", accountsUrl(`/teams/${teamZuid}`));
    },
    /**
     * List members of a team.
     * GET /teams/{teamZuid}/users
     */
    async listMembers(teamZuid) {
      return request("GET", accountsUrl(`/teams/${teamZuid}/users`));
    },
    /**
     * Invite a user to a team.
     * POST /teams/{teamZuid}/invites
     */
    async inviteMember(teamZuid, data) {
      return request("POST", accountsUrl(`/teams/${teamZuid}/invites`), { body: data });
    },
    /**
     * Remove a user from a team.
     * DELETE /teams/{teamZuid}/users/{userZuid}
     */
    async removeMember(teamZuid, userZuid) {
      return request("DELETE", accountsUrl(`/teams/${teamZuid}/users/${userZuid}`));
    },
    /**
     * List instances a team has access to.
     * GET /teams/{teamZuid}/instances
     */
    async listInstances(teamZuid) {
      return request("GET", accountsUrl(`/teams/${teamZuid}/instances`));
    },
    /**
     * Add a team to an instance with a specific role.
     * POST /instances/{instanceZuid}/teams
     */
    async addToInstance(instanceZuid, teamZuid, roleZuid) {
      return request("POST", accountsUrl(`/instances/${instanceZuid}/teams`), {
        body: { teamZUID: teamZuid, roleZUID: roleZuid }
      });
    },
    /**
     * Remove a team from an instance.
     * DELETE /instances/{instanceZuid}/teams/{teamZuid}
     */
    async removeFromInstance(instanceZuid, teamZuid) {
      return request("DELETE", accountsUrl(`/instances/${instanceZuid}/teams/${teamZuid}`));
    },
    /**
     * List teams on an instance.
     * GET /instances/{instanceZuid}/teams
     */
    async listOnInstance(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/teams`));
    }
  };
  const invites = {
    /**
     * Invite a user to an instance.
     * POST /invites
     *
     * @param inviteeName - Display name
     * @param inviteeEmail - Email address
     * @param entityZUID - Instance ZUID the invite is for
     * @param accessLevel - Integer 1–5 (1=Contributor, 2=Publisher, 3=Developer, 4=SEO, 5=Admin)
     */
    async create(inviteeName, inviteeEmail, entityZUID, accessLevel) {
      return request("POST", accountsUrl("/invites"), {
        body: { inviteeName, inviteeEmail, entityZUID, accessLevel }
      });
    }
  };
  const domains = {
    /**
     * List all domains for an instance.
     * GET /instances/{instanceZuid}/domains
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/domains`));
    },
    /**
     * Add a domain to an instance.
     * POST /instances/{instanceZuid}/domains
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", accountsUrl(`/instances/${z}/domains`), { body: data });
    },
    /**
     * Remove a domain from an instance.
     * DELETE /instances/{instanceZuid}/domains/{domainZuid}
     */
    async delete(domainZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}/domains/${domainZuid}`));
    }
  };
  const tokens = {
    /**
     * List all API tokens for an instance.
     * GET /instances/{instanceZuid}/tokens
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/tokens`));
    },
    /**
     * Create a new API token.
     * POST /instances/{instanceZuid}/tokens
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", accountsUrl(`/instances/${z}/tokens`), { body: data });
    },
    /**
     * Delete an API token.
     * DELETE /instances/{instanceZuid}/tokens/{tokenZuid}
     */
    async delete(tokenZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", accountsUrl(`/instances/${z}/tokens/${tokenZuid}`));
    }
  };
  const webhooks = {
    /**
     * List all webhooks for an instance.
     * GET {instanceZuid}.api.zesty.io/v1/web/hooks
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/web/hooks"));
    },
    /**
     * Create a webhook.
     * POST {instanceZuid}.api.zesty.io/v1/web/hooks
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, "/web/hooks"), { body: data });
    },
    /**
     * Update a webhook.
     * PUT {instanceZuid}.api.zesty.io/v1/web/hooks/{hookZuid}
     */
    async update(hookZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PUT", instanceUrl(z, `/web/hooks/${hookZuid}`), { body: data });
    },
    /**
     * Delete a webhook.
     * DELETE {instanceZuid}.api.zesty.io/v1/web/hooks/{hookZuid}
     */
    async delete(hookZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/web/hooks/${hookZuid}`));
    }
  };
  const audits = {
    /**
     * List audit log entries for an instance.
     * GET /instances/{instanceZuid}/audits
     */
    async list(opts = {}, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", accountsUrl(`/instances/${z}/audits`), {
        query: opts
      });
    }
  };
  const contentModels = {
    /**
     * List all content models.
     * GET /content/models
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/content/models"));
    },
    /**
     * Get a content model.
     * GET /content/models/{modelZuid}
     */
    async get(modelZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, `/content/models/${modelZuid}`));
    },
    /**
     * Create a new content model.
     * POST /content/models
     *
     * type: "templateset" (page), "pageset" (collection), "dataset" (headless block)
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, "/content/models"), { body: data });
    },
    /**
     * Update a content model.
     * PATCH /content/models/{modelZuid}
     */
    async update(modelZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PATCH", instanceUrl(z, `/content/models/${modelZuid}`), { body: data });
    },
    /**
     * Delete a content model.
     * DELETE /content/models/{modelZuid}
     */
    async delete(modelZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/content/models/${modelZuid}`));
    }
  };
  const contentFields = {
    /**
     * List all fields for a content model.
     * GET /content/models/{modelZuid}/fields
     */
    async list(modelZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, `/content/models/${modelZuid}/fields`));
    },
    /**
     * Get a single field.
     * GET /content/models/{modelZuid}/fields/{fieldZuid}
     */
    async get(modelZuid, fieldZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, `/content/models/${modelZuid}/fields/${fieldZuid}`));
    },
    /**
     * Create a field on a content model.
     * POST /content/models/{modelZuid}/fields
     *
     * datatype: text | textarea | wysiwyg_basic | wysiwyg_advanced | markdown |
     *           images | files | date | datetime | number | yes_no | dropdown |
     *           one_to_one | one_to_many | internal_link | link
     */
    async create(modelZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      const wysiwygTypes = ["wysiwyg_basic", "wysiwyg_advanced"];
      const body = {
        contentModelZUID: modelZuid,
        ...data,
        settings: {
          list: !wysiwygTypes.includes(data.datatype),
          defaultValue: null,
          ...data.settings ?? {}
        }
      };
      return request("POST", instanceUrl(z, `/content/models/${modelZuid}/fields`), { body });
    },
    /**
     * Update a field.
     * PATCH /content/models/{modelZuid}/fields/{fieldZuid}
     */
    async update(modelZuid, fieldZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PATCH", instanceUrl(z, `/content/models/${modelZuid}/fields/${fieldZuid}`), { body: data });
    },
    /**
     * Delete a field.
     * DELETE /content/models/{modelZuid}/fields/{fieldZuid}
     */
    async delete(modelZuid, fieldZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/content/models/${modelZuid}/fields/${fieldZuid}`));
    }
  };
  const contentItems = {
    /**
     * List items for a content model.
     * GET /content/models/{modelZuid}/items
     */
    async list(modelZuid, opts = {}, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, `/content/models/${modelZuid}/items`), {
        query: opts
      });
    },
    /**
     * Get a single content item.
     * GET /content/models/{modelZuid}/items/{itemZuid}
     */
    async get(modelZuid, itemZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`));
    },
    /**
     * Create a new content item.
     * POST /content/models/{modelZuid}/items
     *
     * The `web` object controls SEO metadata and URL path.
     * `meta.langID` defaults to 1 (English).
     */
    async create(modelZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      const body = {
        data: data.data,
        web: { canonicalTagMode: 1, ...data.web },
        meta: { langID: 1, contentModelZUID: modelZuid, ...data.meta }
      };
      return request("POST", instanceUrl(z, `/content/models/${modelZuid}/items`), { body });
    },
    /**
     * Update a content item (replaces data fields).
     * PUT /content/models/{modelZuid}/items/{itemZuid}
     */
    async update(modelZuid, itemZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PUT", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`), { body: data });
    },
    /**
     * Patch a content item (partial update).
     * PATCH /content/models/{modelZuid}/items/{itemZuid}
     */
    async patch(modelZuid, itemZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PATCH", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`), { body: data });
    },
    /**
     * Delete a content item.
     * DELETE /content/models/{modelZuid}/items/{itemZuid}
     */
    async delete(modelZuid, itemZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}`));
    },
    /**
     * Publish a content item version.
     * POST /content/models/{modelZuid}/items/{itemZuid}/publishings
     *
     * Pass the version number from the item's meta.version.
     */
    async publish(modelZuid, itemZuid, opts = { version: 1 }, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, `/content/models/${modelZuid}/items/${itemZuid}/publishings`), {
        body: {
          version: opts.version,
          publishes_at: opts.publishesAt ?? (/* @__PURE__ */ new Date()).toISOString(),
          unpublish_at: opts.unpublishAt ?? null
        }
      });
    },
    /**
     * Full-text search across content items.
     * GET /search/items?q={query}&limit={limit}
     */
    async search(query, opts = {}, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/search/items"), {
        query: { q: query, limit: opts.limit ?? 100 }
      });
    }
  };
  const contentViews = {
    /**
     * List all code views/templates.
     * GET /web/views
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/web/views"));
    },
    /**
     * Get a single view.
     * GET /web/views/{viewZuid}
     */
    async get(viewZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, `/web/views/${viewZuid}`));
    },
    /**
     * Create a new view/template.
     * POST /web/views
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, "/web/views"), {
        body: { type: "ajax-json", ...data }
      });
    },
    /**
     * Update a view's code.
     * PUT /web/views/{viewZuid}
     */
    async update(viewZuid, code, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PUT", instanceUrl(z, `/web/views/${viewZuid}`), { body: { code } });
    },
    /**
     * Publish a view version so it goes live on WebEngine.
     * POST /web/views/{viewZuid}/versions/{version}?purge_cache=false
     */
    async publish(viewZuid, version, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, `/web/views/${viewZuid}/versions/${version}?purge_cache=false`));
    }
  };
  const contentHeadTags = {
    /**
     * List all head tags.
     * GET /web/headtags
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/web/headtags"));
    },
    /**
     * Create a head tag.
     * POST /web/headtags
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, "/web/headtags"), {
        body: {
          custom: true,
          sort: 0,
          ...data,
          attributes: { ...data.attributes, custom: "true" }
        }
      });
    },
    /**
     * Delete a head tag.
     * DELETE /web/headtags/{headtagZuid}
     */
    async delete(headtagZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/web/headtags/${headtagZuid}`));
    }
  };
  const contentLanguages = {
    /**
     * List active locales/languages for an instance.
     * GET /env/langs
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/env/langs"));
    }
  };
  const contentSettings = {
    /**
     * List all instance settings.
     * GET /env/settings
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/env/settings"));
    },
    /**
     * Update a single instance setting.
     * PUT /env/settings/{settingZuid}
     */
    async update(settingZuid, data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("PUT", instanceUrl(z, `/env/settings/${settingZuid}`), { body: data });
    }
  };
  const contentRedirects = {
    /**
     * List all redirects for an instance.
     * GET /web/redirects
     */
    async list(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", instanceUrl(z, "/web/redirects"));
    },
    /**
     * Create a redirect.
     * POST /web/redirects
     */
    async create(data, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("POST", instanceUrl(z, "/web/redirects"), { body: data });
    },
    /**
     * Delete a redirect.
     * DELETE /web/redirects/{redirectZuid}
     */
    async delete(redirectZuid, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("DELETE", instanceUrl(z, `/web/redirects/${redirectZuid}`));
    }
  };
  const content = {
    models: contentModels,
    fields: contentFields,
    items: contentItems,
    views: contentViews,
    headTags: contentHeadTags,
    languages: contentLanguages,
    settings: contentSettings,
    redirects: contentRedirects
  };
  const metrics = {
    /**
     * Get usage statistics for an instance.
     * GET metrics.zesty.io/v1/metrics/usage/{instanceZuid}
     */
    async getUsage(opts = {}, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", `${metricsBaseUrl}/v1/metrics/usage/${z}`, {
        query: opts
      });
    },
    /**
     * Get CDN request counts.
     * GET metrics.zesty.io/v1/metrics/requests/{instanceZuid}
     */
    async getRequests(opts = {}, instanceZuid) {
      const z = resolveInstance(instanceZuid);
      return request("GET", `${metricsBaseUrl}/v1/metrics/requests/${z}`, {
        query: opts
      });
    }
  };
  const mediaBins = {
    /**
     * List all media bins for an instance.
     * <!-- http: GET https://media-manager.api.zesty.io/site/{numericInstanceId}/bins -->
     *
     * @param numericInstanceId - Instance.ID (numeric), not the ZUID.
     *   Call accounts.getInstance(instanceZuid) to get Instance.ID.
     */
    async list(numericInstanceId) {
      return request("GET", mediaManagerUrl(`/site/${numericInstanceId}/bins`));
    },
    /**
     * Get a single media bin by its ZUID.
     * <!-- http: GET https://media-manager.api.zesty.io/bin/{binId} -->
     */
    async get(binId) {
      const bins = await request("GET", mediaManagerUrl(`/bin/${binId}`));
      return Array.isArray(bins) ? bins[0] : bins;
    },
    /**
     * Convenience: resolve the default bin for an instance without needing the numeric ID.
     * <!-- http: GET /instances/{instanceZuid} + /site/{numericId}/bins -->
     *
     * Internally calls accounts.getInstance() to resolve the numeric ID, then lists bins.
     * Returns the bin with `default: true`, or the first bin if none is flagged.
     *
     * @param instanceZuid - Instance ZUID (uses SDK default if omitted).
     */
    async getDefault(instanceZuid) {
      const z = resolveInstance(instanceZuid);
      const instance = await accounts.getInstance(z);
      const numericId = instance.ID;
      if (!numericId) throw new Error(`Instance ${z} has no numeric ID`);
      const bins = await mediaBins.list(numericId);
      if (!bins.length) throw new Error(`No media bins found for instance ${z}`);
      return bins.find((b) => b.default) ?? bins[0];
    },
    // ── Deprecated aliases (moved to media.files.*) ────────────────────────
    /** @deprecated Use media.files.search() instead. */
    async search(binZuid, term, opts = {}) {
      return mediaFiles.search(binZuid, term, opts);
    },
    /** @deprecated Use media.files.list() instead. */
    async listFiles(numericInstanceId, groupId) {
      return mediaFiles.list(numericInstanceId, groupId);
    },
    /** @deprecated Use media.files.update() instead. */
    async updateFile(fileId, data) {
      return mediaFiles.update(fileId, data);
    },
    /** @deprecated Use media.files.delete() instead. */
    async deleteFile(fileId) {
      return mediaFiles.delete(fileId);
    }
  };
  const mediaGroups = {
    /**
     * List groups (subfolders) within a bin.
     * <!-- http: GET https://media-manager.api.zesty.io/bin/{binId}/groups -->
     */
    async list(binId) {
      return request("GET", mediaManagerUrl(`/bin/${binId}/groups`));
    }
  };
  const mediaFiles = {
    /**
     * Get a single media file by its ZUID.
     * <!-- http: GET https://media-manager.api.zesty.io/file/{fileZuid} -->
     */
    async get(fileZuid) {
      return request("GET", mediaManagerUrl(`/file/${fileZuid}`));
    },
    /**
     * Search media files by term (filename / title).
     * <!-- http: GET https://media-manager.api.zesty.io/search/files?bins={binZuid}&term={term} -->
     */
    async search(binZuid, term, opts = {}) {
      return request("GET", mediaManagerUrl("/search/files"), {
        query: { bins: binZuid, term, limit: opts.limit }
      });
    },
    /**
     * List files in a group/bin.
     * <!-- http: GET https://media-manager.api.zesty.io/site/{numericInstanceId}/groups/{groupId}/files -->
     */
    async list(numericInstanceId, groupId) {
      return request("GET", mediaManagerUrl(`/site/${numericInstanceId}/groups/${groupId}/files`));
    },
    /**
     * Update a media file's metadata.
     * <!-- http: PATCH https://media-manager.api.zesty.io/media/{fileId} -->
     */
    async update(fileId, data) {
      return request("PATCH", mediaManagerUrl(`/media/${fileId}`), { body: data });
    },
    /**
     * Delete a media file.
     * <!-- http: DELETE https://media-manager.api.zesty.io/media/{fileId} -->
     */
    async delete(fileId) {
      return request("DELETE", mediaManagerUrl(`/media/${fileId}`));
    }
  };
  const media = {
    bins: mediaBins,
    groups: mediaGroups,
    files: mediaFiles,
    /**
     * Upload a file to the Zesty Media Storage API.
     *
     * The SDK fetches the target bin to resolve its GCP `storage_name`, then
     * POSTs multipart form data to the media-storage upload endpoint.
     * This matches the upload flow used by web-agent.
     *
     * <!-- http: POST https://media-storage.api.zesty.io/upload/gcp/{storageName} -->
     *
     * @param file      - File, Blob, or ArrayBuffer to upload.
     * @param opts.binZuid   - ZUID of the target bin (from bin.id).
     * @param opts.userId    - ZUID of the uploading user (from auth.verify() or instance.createdByUserZUID).
     * @param opts.groupZuid - ZUID of a subfolder group (defaults to binZuid for root uploads).
     * @param opts.filename  - Filename for the upload (defaults to File.name or "upload").
     * @param opts.mimeType  - MIME type (defaults to "application/octet-stream").
     * @param opts.title     - Optional display title.
     *
     * @example
     * const bin = await sdk.media.bins.getDefault(instanceZuid);
     * const user = await sdk.auth.verify();
     * const uploaded = await sdk.media.upload(file, { binZuid: bin.id, userId: user.ZUID });
     * console.log(uploaded.url); // CDN URL
     */
    async upload(file, opts) {
      const { binZuid, userId, filename = "upload", mimeType = "application/octet-stream", title } = opts;
      const bin = await mediaBins.get(binZuid);
      const storageName = bin.storage_name;
      const groupZuid = opts.groupZuid ?? binZuid;
      let blob;
      if (file instanceof File || file instanceof Blob) {
        blob = file;
      } else {
        blob = new Blob([file], { type: mimeType });
      }
      const formData = new FormData();
      formData.append("bin_id", binZuid);
      formData.append("user_id", userId);
      formData.append("group_id", groupZuid);
      if (title) formData.append("title", title);
      formData.append("file", blob, file instanceof File ? file.name : filename);
      const result = await request(
        "POST",
        mediaStorageUrl(`/upload/gcp/${storageName}`),
        { formData }
      );
      return Array.isArray(result) ? result[0] : result;
    }
  };
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
    media
  };
}
var zesty_sdk_default = createZestySdk;
function readCookie(name) {
  if (typeof document === "undefined") return void 0;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : void 0;
}
function createZestyVanilla(config = {}) {
  const token = config.authToken ?? config.sessionToken ?? readCookie("APP_SID") ?? readCookie("DEV_APP_SID");
  return createZestySdk({ ...config, authToken: token });
}
function createZestyNode(config) {
  if (!config.authToken) {
    throw new Error(
      "[js-sdk] createZestyNode requires an explicit authToken. Pass { authToken: process.env.ZESTY_TOKEN } or similar."
    );
  }
  return createZestySdk(config);
}
function createZestyNext(config = {}) {
  const token = config.authToken ?? config.sessionToken ?? readCookie("APP_SID") ?? readCookie("DEV_APP_SID");
  return createZestySdk({
    accountsBaseUrlOverride: "/api/v1",
    contentBaseUrlOverride: "/api/instance/{instanceZuid}/v1",
    mediaBaseUrlOverride: "/api/media",
    ...config,
    authToken: token
  });
}
var zestyKey = /* @__PURE__ */ Symbol("zesty-sdk");
function createZestyVuePlugin(config) {
  const sdk = createZestySdk(config);
  return {
    install(app) {
      app.provide(zestyKey, sdk);
    }
  };
}
function createZestyReact(React, config) {
  const sdk = createZestySdk(config);
  const ZestyContext = React.createContext(null);
  function ZestyProvider(props) {
    return React.createElement(ZestyContext.Provider, { value: sdk }, props.children);
  }
  function useZesty() {
    const ctx = React.useContext(ZestyContext);
    if (!ctx) {
      throw new Error("[js-sdk] useZesty must be called inside a <ZestyProvider>.");
    }
    return ctx;
  }
  return { ZestyProvider, useZesty };
}
export {
  ZestyApiError,
  createZestyNext,
  createZestyNode,
  createZestyReact,
  createZestySdk,
  createZestyVanilla,
  createZestyVuePlugin,
  zesty_sdk_default as default,
  zestyKey
};
//# sourceMappingURL=zesty-sdk.mjs.map