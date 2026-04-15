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
interface ZestyConfig {
    /** PTK-... bearer token */
    authToken?: string;
    /** Session token (APP_SID) — alternative to authToken */
    sessionToken?: string;
    /** Default instance ZUID for content-api calls */
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
declare class ZestyApiError extends Error {
    readonly status: number;
    readonly method: string;
    readonly url: string;
    readonly body: unknown;
    constructor(message: string, status: number, method: string, url: string, body?: unknown);
}
interface Instance {
    ZUID: string;
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
interface User {
    ZUID: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: number;
    createdAt?: string;
    updatedAt?: string;
}
interface Role {
    ZUID: string;
    name: string;
    description?: string;
    instanceZUID?: string;
    static?: boolean;
    systemRole?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
interface GranularRole {
    ZUID?: string;
    resourceZUID: string;
    roleZUID: string;
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    publish?: boolean;
    grant?: boolean;
}
interface Team {
    ZUID: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}
interface TeamMember {
    ZUID: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}
interface Invite {
    ZUID?: string;
    inviteeName: string;
    inviteeEmail: string;
    entityZUID: string;
    accessLevel: number;
    createdAt?: string;
}
interface Domain {
    ZUID: string;
    domain: string;
    branch?: string;
    createdAt?: string;
    updatedAt?: string;
}
interface Token {
    ZUID: string;
    name: string;
    token?: string;
    roleZUID?: string;
    roleName?: string;
    expiresAt?: string;
    createdAt?: string;
}
interface Webhook {
    ZUID: string;
    method: string;
    url: string;
    eventAction?: number;
    contentType?: string;
    payload?: string;
    createdAt?: string;
    updatedAt?: string;
}
interface AuditLog {
    ZUID?: string;
    action?: string;
    meta?: Record<string, unknown>;
    affectedZUID?: string;
    createdAt?: string;
    createdByUserZUID?: string;
}
interface ContentModel {
    ZUID: string;
    name: string;
    label?: string;
    type: "templateset" | "pageset" | "dataset" | "external";
    createdAt?: string;
    updatedAt?: string;
}
interface ContentField {
    ZUID: string;
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
interface ContentItemMeta {
    ZUID: string;
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
interface ContentItemWeb {
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
interface ContentItem {
    meta: ContentItemMeta;
    web: ContentItemWeb;
    data: Record<string, unknown>;
    publishAt?: string | null;
    siblings?: ContentItem[];
}
interface ContentView {
    ZUID: string;
    fileName: string;
    code?: string;
    type?: string;
    status?: string;
    version?: number;
    model_ZUID?: string;
    contentModelZUID?: string;
    createdAt?: string;
    updatedAt?: string;
}
interface HeadTag {
    ZUID: string;
    resourceZUID: string;
    type: string;
    attributes: Record<string, string>;
    sort?: number;
    custom?: boolean;
}
interface InstanceSetting {
    ZUID: string;
    key: string;
    keyFriendly?: string;
    value: string | boolean;
    category?: string;
    dataType?: string;
    options?: string;
    tips?: string;
}
/** Top-level media container per instance. Each instance has at least one bin. */
interface MediaBin {
    /** ZUID for this bin, e.g. "1-14f97646-ksjch7". Pass this as binZuid to media.upload(). */
    id: string;
    name: string;
    /** Numeric instance ID as a string (matches Instance.ID). */
    site_id: string;
    eco_id: string | null;
    storage_driver: string;
    /** GCP bucket name — used internally by media.upload() to build the upload URL. */
    storage_name: string;
    storage_base_url: string;
    cdn_driver: string;
    /** CDN base URL for all files in this bin, e.g. "https://82ngtwrd.media.zestyio.com". */
    cdn_base_url: string;
    default: boolean;
    created_at: string;
    deleted_at: string | null;
    deleted_from_storage_at: string | null;
}
/** Subfolder within a bin. Group ZUID can be passed as groupZuid to media.upload(). */
interface MediaGroup {
    id: string;
    name?: string;
    bin_id?: string;
    group_id?: string;
    created_at?: string;
    updated_at?: string;
}
interface MediaFile {
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
interface Locale {
    ID?: number;
    code: string;
    name?: string;
    default?: boolean;
    active?: boolean;
    createdAt?: string;
}
interface UsageReport {
    TotalGBs?: number;
    TotalRequests?: number;
    MediaConsumption?: {
        TotalGBs?: number;
        TotalRequests?: number;
    };
    [key: string]: unknown;
}
interface ContentRedirect {
    ZUID?: string;
    from: string;
    to: string;
    code?: number;
    createdAt?: string;
    updatedAt?: string;
}
type ZestySdk = ReturnType<typeof createZestySdk>;
declare function createZestySdk(config?: ZestyConfig): {
    auth: {
        /**
         * Verify an APP_SID token. Returns the user object if valid.
         * POST https://auth.api.zesty.io/verify
         */
        verify(token?: string): Promise<User>;
        /** Returns the Google SSO redirect URL. Navigate the browser to this URL. */
        googleLoginUrl(): string;
        /** Returns the GitHub SSO redirect URL. */
        githubLoginUrl(): string;
        /** Returns the Microsoft (Azure) SSO redirect URL. */
        microsoftLoginUrl(): string;
    };
    users: {
        /**
         * Get the currently authenticated user.
         * GET /users/self
         */
        getCurrent(): Promise<User>;
        /**
         * Get a specific user by ZUID.
         * GET /users/{userZuid}
         */
        get(userZuid: string): Promise<User>;
        /**
         * Update a user's profile.
         * PUT /users/{userZuid}
         */
        update(userZuid: string, data: Partial<User>): Promise<User>;
        /**
         * List all email addresses for a user.
         * GET /users/{userZuid}/emails
         */
        listEmails(userZuid: string): Promise<{
            email: string;
        }[]>;
        /**
         * Add an email address to a user.
         * POST /users/{userZuid}/emails
         */
        addEmail(userZuid: string, email: string): Promise<unknown>;
        /**
         * Delete an email address from a user.
         * DELETE /users/{userZuid}/emails/{email}
         */
        deleteEmail(userZuid: string, email: string): Promise<unknown>;
        /**
         * Update a user's password.
         * PUT /users/{userZuid}/password
         */
        updatePassword(userZuid: string, oldPassword: string, newPassword: string): Promise<unknown>;
    };
    accounts: {
        /**
         * List all instances the authenticated user has access to.
         * GET /instances
         */
        listInstances(): Promise<Instance[]>;
        /**
         * Get a single instance by ZUID.
         * GET /instances/{instanceZuid}
         */
        getInstance(instanceZuid?: string): Promise<Instance>;
        /**
         * Update instance metadata (name, etc.).
         * PUT /instances/{instanceZuid}
         */
        updateInstance(data: Partial<Instance>, instanceZuid?: string): Promise<Instance>;
        /**
         * Permanently delete an instance. Use with extreme caution.
         * DELETE /instances/{instanceZuid}
         */
        deleteInstance(instanceZuid?: string): Promise<unknown>;
        /**
         * List all users with roles on an instance.
         * GET /instances/{instanceZuid}/users/roles
         */
        listUsers(instanceZuid?: string): Promise<User[]>;
        /**
         * List all apps installed on an instance.
         * GET /instances/{instanceZuid}/apps
         */
        listApps(instanceZuid?: string): Promise<unknown[]>;
        /**
         * Install an app on an instance.
         * POST /instances/{instanceZuid}/apps/{appZuid}
         */
        installApp(appZuid: string, instanceZuid?: string): Promise<unknown>;
        /**
         * Uninstall an app from an instance.
         * DELETE /instances/{instanceZuid}/apps/{appZuid}
         */
        uninstallApp(appZuid: string, instanceZuid?: string): Promise<unknown>;
    };
    roles: {
        /**
         * List all roles for an instance.
         * GET /instances/{instanceZuid}/roles
         */
        list(instanceZuid?: string): Promise<Role[]>;
        /**
         * Create a new custom role.
         * POST /roles
         */
        create(data: {
            name: string;
            description?: string;
            instanceZUID: string;
            systemRole?: boolean;
        }): Promise<Role>;
        /**
         * Update an existing role.
         * PUT /roles/{roleZuid}
         */
        update(roleZuid: string, data: Partial<Role>): Promise<Role>;
        /**
         * Delete a custom role.
         * DELETE /roles/{roleZuid}
         */
        delete(roleZuid: string): Promise<unknown>;
        /**
         * Get granular permission rules for a role.
         * GET /roles/{roleZuid}/granularRoles
         */
        getGranular(roleZuid: string): Promise<GranularRole[]>;
        /**
         * Create a granular permission rule.
         * POST /roles/{roleZuid}/granularRoles
         */
        createGranular(roleZuid: string, data: Omit<GranularRole, "ZUID">): Promise<GranularRole>;
        /**
         * Batch update granular permissions.
         * PUT /roles/{roleZuid}/granularRoles
         */
        updateGranular(roleZuid: string, data: GranularRole[]): Promise<GranularRole[]>;
        /**
         * Delete a granular permission rule.
         * DELETE /roles/{roleZuid}/granularRoles/{resourceZuid}
         */
        deleteGranular(roleZuid: string, resourceZuid: string): Promise<unknown>;
        /**
         * List users in a role.
         * GET /roles/{roleZuid}/users
         */
        listUsers(roleZuid: string): Promise<User[]>;
        /**
         * Add a user to a role (grants instance access).
         * POST /roles/{roleZuid}/users
         */
        addUser(roleZuid: string, userZuid: string): Promise<unknown>;
        /**
         * Remove a user from a role (revokes instance access).
         * DELETE /roles/{roleZuid}/users/{userZuid}
         */
        removeUser(roleZuid: string, userZuid: string): Promise<unknown>;
    };
    teams: {
        /**
         * List all teams in the organization.
         * GET /teams
         */
        list(): Promise<Team[]>;
        /**
         * Create a new team.
         * POST /teams
         */
        create(data: {
            name: string;
            description?: string;
        }): Promise<Team>;
        /**
         * Get a specific team.
         * GET /teams/{teamZuid}
         */
        get(teamZuid: string): Promise<Team>;
        /**
         * Update a team.
         * PUT /teams/{teamZuid}
         */
        update(teamZuid: string, data: Partial<Team>): Promise<Team>;
        /**
         * Delete a team.
         * DELETE /teams/{teamZuid}
         */
        delete(teamZuid: string): Promise<unknown>;
        /**
         * List members of a team.
         * GET /teams/{teamZuid}/users
         */
        listMembers(teamZuid: string): Promise<TeamMember[]>;
        /**
         * Invite a user to a team.
         * POST /teams/{teamZuid}/invites
         */
        inviteMember(teamZuid: string, data: {
            inviteeName: string;
            inviteeEmail: string;
        }): Promise<unknown>;
        /**
         * Remove a user from a team.
         * DELETE /teams/{teamZuid}/users/{userZuid}
         */
        removeMember(teamZuid: string, userZuid: string): Promise<unknown>;
        /**
         * List instances a team has access to.
         * GET /teams/{teamZuid}/instances
         */
        listInstances(teamZuid: string): Promise<Instance[]>;
        /**
         * Add a team to an instance with a specific role.
         * POST /instances/{instanceZuid}/teams
         */
        addToInstance(instanceZuid: string, teamZuid: string, roleZuid: string): Promise<unknown>;
        /**
         * Remove a team from an instance.
         * DELETE /instances/{instanceZuid}/teams/{teamZuid}
         */
        removeFromInstance(instanceZuid: string, teamZuid: string): Promise<unknown>;
        /**
         * List teams on an instance.
         * GET /instances/{instanceZuid}/teams
         */
        listOnInstance(instanceZuid?: string): Promise<Team[]>;
    };
    invites: {
        /**
         * Invite a user to an instance.
         * POST /invites
         *
         * @param inviteeName - Display name
         * @param inviteeEmail - Email address
         * @param entityZUID - Instance ZUID the invite is for
         * @param accessLevel - Integer 1–5 (1=Contributor, 2=Publisher, 3=Developer, 4=SEO, 5=Admin)
         */
        create(inviteeName: string, inviteeEmail: string, entityZUID: string, accessLevel: 1 | 2 | 3 | 4 | 5): Promise<Invite>;
    };
    domains: {
        /**
         * List all domains for an instance.
         * GET /instances/{instanceZuid}/domains
         */
        list(instanceZuid?: string): Promise<Domain[]>;
        /**
         * Add a domain to an instance.
         * POST /instances/{instanceZuid}/domains
         */
        create(data: {
            domain: string;
            branch?: string;
        }, instanceZuid?: string): Promise<Domain>;
        /**
         * Remove a domain from an instance.
         * DELETE /instances/{instanceZuid}/domains/{domainZuid}
         */
        delete(domainZuid: string, instanceZuid?: string): Promise<unknown>;
    };
    tokens: {
        /**
         * List all API tokens for an instance.
         * GET /instances/{instanceZuid}/tokens
         */
        list(instanceZuid?: string): Promise<Token[]>;
        /**
         * Create a new API token.
         * POST /instances/{instanceZuid}/tokens
         */
        create(data: {
            name: string;
            roleZUID?: string;
            expiresAt?: string;
        }, instanceZuid?: string): Promise<Token>;
        /**
         * Delete an API token.
         * DELETE /instances/{instanceZuid}/tokens/{tokenZuid}
         */
        delete(tokenZuid: string, instanceZuid?: string): Promise<unknown>;
    };
    webhooks: {
        /**
         * List all webhooks for an instance.
         * GET {instanceZuid}.api.zesty.io/v1/web/hooks
         */
        list(instanceZuid?: string): Promise<Webhook[]>;
        /**
         * Create a webhook.
         * POST {instanceZuid}.api.zesty.io/v1/web/hooks
         */
        create(data: {
            method: string;
            url: string;
            eventAction?: number;
            contentType?: string;
            payload?: string;
        }, instanceZuid?: string): Promise<Webhook>;
        /**
         * Update a webhook.
         * PUT {instanceZuid}.api.zesty.io/v1/web/hooks/{hookZuid}
         */
        update(hookZuid: string, data: Partial<Webhook>, instanceZuid?: string): Promise<Webhook>;
        /**
         * Delete a webhook.
         * DELETE {instanceZuid}.api.zesty.io/v1/web/hooks/{hookZuid}
         */
        delete(hookZuid: string, instanceZuid?: string): Promise<unknown>;
    };
    audits: {
        /**
         * List audit log entries for an instance.
         * GET /instances/{instanceZuid}/audits
         */
        list(opts?: {
            limit?: number;
            start?: number;
            affectedZUID?: string;
            action?: string;
        }, instanceZuid?: string): Promise<AuditLog[]>;
    };
    content: {
        models: {
            /**
             * List all content models.
             * GET /content/models
             */
            list(instanceZuid?: string): Promise<ContentModel[]>;
            /**
             * Get a content model.
             * GET /content/models/{modelZuid}
             */
            get(modelZuid: string, instanceZuid?: string): Promise<ContentModel>;
            /**
             * Create a new content model.
             * POST /content/models
             *
             * type: "templateset" (page), "pageset" (collection), "dataset" (headless block)
             */
            create(data: {
                name: string;
                label: string;
                type: "templateset" | "pageset" | "dataset";
            }, instanceZuid?: string): Promise<ContentModel>;
            /**
             * Update a content model.
             * PATCH /content/models/{modelZuid}
             */
            update(modelZuid: string, data: Partial<ContentModel>, instanceZuid?: string): Promise<ContentModel>;
            /**
             * Delete a content model.
             * DELETE /content/models/{modelZuid}
             */
            delete(modelZuid: string, instanceZuid?: string): Promise<unknown>;
        };
        fields: {
            /**
             * List all fields for a content model.
             * GET /content/models/{modelZuid}/fields
             */
            list(modelZuid: string, instanceZuid?: string): Promise<ContentField[]>;
            /**
             * Get a single field.
             * GET /content/models/{modelZuid}/fields/{fieldZuid}
             */
            get(modelZuid: string, fieldZuid: string, instanceZuid?: string): Promise<ContentField>;
            /**
             * Create a field on a content model.
             * POST /content/models/{modelZuid}/fields
             *
             * datatype: text | textarea | wysiwyg_basic | wysiwyg_advanced | markdown |
             *           images | files | date | datetime | number | yes_no | dropdown |
             *           one_to_one | one_to_many | internal_link | link
             */
            create(modelZuid: string, data: Omit<ContentField, "ZUID"> & {
                contentModelZUID?: string;
            }, instanceZuid?: string): Promise<ContentField>;
            /**
             * Update a field.
             * PATCH /content/models/{modelZuid}/fields/{fieldZuid}
             */
            update(modelZuid: string, fieldZuid: string, data: Partial<ContentField>, instanceZuid?: string): Promise<ContentField>;
            /**
             * Delete a field.
             * DELETE /content/models/{modelZuid}/fields/{fieldZuid}
             */
            delete(modelZuid: string, fieldZuid: string, instanceZuid?: string): Promise<unknown>;
        };
        items: {
            /**
             * List items for a content model.
             * GET /content/models/{modelZuid}/items
             */
            list(modelZuid: string, opts?: {
                limit?: number;
                page?: number;
                lang?: string;
            }, instanceZuid?: string): Promise<ContentItem[]>;
            /**
             * Get a single content item.
             * GET /content/models/{modelZuid}/items/{itemZuid}
             */
            get(modelZuid: string, itemZuid: string, instanceZuid?: string): Promise<ContentItem>;
            /**
             * Create a new content item.
             * POST /content/models/{modelZuid}/items
             *
             * The `web` object controls SEO metadata and URL path.
             * `meta.langID` defaults to 1 (English).
             */
            create(modelZuid: string, data: {
                data: Record<string, unknown>;
                web?: Partial<ContentItemWeb> & {
                    pathPart?: string;
                };
                meta?: {
                    langID?: number;
                    contentModelZUID?: string;
                };
            }, instanceZuid?: string): Promise<ContentItem>;
            /**
             * Update a content item (replaces data fields).
             * PUT /content/models/{modelZuid}/items/{itemZuid}
             */
            update(modelZuid: string, itemZuid: string, data: {
                data?: Record<string, unknown>;
                web?: Partial<ContentItemWeb>;
                meta?: Partial<ContentItemMeta>;
            }, instanceZuid?: string): Promise<ContentItem>;
            /**
             * Patch a content item (partial update).
             * PATCH /content/models/{modelZuid}/items/{itemZuid}
             */
            patch(modelZuid: string, itemZuid: string, data: {
                data?: Record<string, unknown>;
                web?: Partial<ContentItemWeb>;
                meta?: Partial<ContentItemMeta>;
            }, instanceZuid?: string): Promise<ContentItem>;
            /**
             * Delete a content item.
             * DELETE /content/models/{modelZuid}/items/{itemZuid}
             */
            delete(modelZuid: string, itemZuid: string, instanceZuid?: string): Promise<unknown>;
            /**
             * Publish a content item version.
             * POST /content/models/{modelZuid}/items/{itemZuid}/publishings
             *
             * Pass the version number from the item's meta.version.
             */
            publish(modelZuid: string, itemZuid: string, opts?: {
                version: number;
                publishesAt?: string;
                unpublishAt?: string;
            }, instanceZuid?: string): Promise<unknown>;
            /**
             * Full-text search across content items.
             * GET /search/items?q={query}&limit={limit}
             */
            search(query: string, opts?: {
                limit?: number;
            }, instanceZuid?: string): Promise<ContentItem[]>;
        };
        views: {
            /**
             * List all code views/templates.
             * GET /web/views
             */
            list(instanceZuid?: string): Promise<ContentView[]>;
            /**
             * Get a single view.
             * GET /web/views/{viewZuid}
             */
            get(viewZuid: string, instanceZuid?: string): Promise<ContentView>;
            /**
             * Create a new view/template.
             * POST /web/views
             */
            create(data: {
                fileName: string;
                code: string;
                type?: string;
            }, instanceZuid?: string): Promise<ContentView>;
            /**
             * Update a view's code.
             * PUT /web/views/{viewZuid}
             */
            update(viewZuid: string, code: string, instanceZuid?: string): Promise<ContentView>;
            /**
             * Publish a view version so it goes live on WebEngine.
             * POST /web/views/{viewZuid}/versions/{version}?purge_cache=false
             */
            publish(viewZuid: string, version: number, instanceZuid?: string): Promise<unknown>;
        };
        headTags: {
            /**
             * List all head tags.
             * GET /web/headtags
             */
            list(instanceZuid?: string): Promise<HeadTag[]>;
            /**
             * Create a head tag.
             * POST /web/headtags
             */
            create(data: {
                resourceZUID: string;
                type: string;
                attributes: Record<string, string>;
                sort?: number;
            }, instanceZuid?: string): Promise<HeadTag>;
            /**
             * Delete a head tag.
             * DELETE /web/headtags/{headtagZuid}
             */
            delete(headtagZuid: string, instanceZuid?: string): Promise<unknown>;
        };
        languages: {
            /**
             * List active locales/languages for an instance.
             * GET /env/langs
             */
            list(instanceZuid?: string): Promise<Locale[]>;
        };
        settings: {
            /**
             * List all instance settings.
             * GET /env/settings
             */
            list(instanceZuid?: string): Promise<InstanceSetting[]>;
            /**
             * Update a single instance setting.
             * PUT /env/settings/{settingZuid}
             */
            update(settingZuid: string, data: Partial<InstanceSetting>, instanceZuid?: string): Promise<InstanceSetting>;
        };
        redirects: {
            /**
             * List all redirects for an instance.
             * GET /web/redirects
             */
            list(instanceZuid?: string): Promise<ContentRedirect[]>;
            /**
             * Create a redirect.
             * POST /web/redirects
             */
            create(data: {
                from: string;
                to: string;
                code?: number;
            }, instanceZuid?: string): Promise<ContentRedirect>;
            /**
             * Delete a redirect.
             * DELETE /web/redirects/{redirectZuid}
             */
            delete(redirectZuid: string, instanceZuid?: string): Promise<unknown>;
        };
    };
    metrics: {
        /**
         * Get usage statistics for an instance.
         * GET metrics.zesty.io/v1/metrics/usage/{instanceZuid}
         */
        getUsage(opts?: {
            dateStart?: string;
            dateEnd?: string;
            granularity?: string;
        }, instanceZuid?: string): Promise<UsageReport>;
        /**
         * Get CDN request counts.
         * GET metrics.zesty.io/v1/metrics/requests/{instanceZuid}
         */
        getRequests(opts?: {
            dateStart?: string;
            dateEnd?: string;
        }, instanceZuid?: string): Promise<UsageReport>;
    };
    media: {
        bins: {
            /**
             * List all media bins for an instance.
             * <!-- http: GET https://media-manager.api.zesty.io/site/{numericInstanceId}/bins -->
             *
             * @param numericInstanceId - Instance.ID (numeric), not the ZUID.
             *   Call accounts.getInstance(instanceZuid) to get Instance.ID.
             */
            list(numericInstanceId: number | string): Promise<MediaBin[]>;
            /**
             * Get a single media bin by its ZUID.
             * <!-- http: GET https://media-manager.api.zesty.io/bin/{binId} -->
             */
            get(binId: string): Promise<MediaBin>;
            /**
             * Convenience: resolve the default bin for an instance without needing the numeric ID.
             * <!-- http: GET /instances/{instanceZuid} + /site/{numericId}/bins -->
             *
             * Internally calls accounts.getInstance() to resolve the numeric ID, then lists bins.
             * Returns the bin with `default: true`, or the first bin if none is flagged.
             *
             * @param instanceZuid - Instance ZUID (uses SDK default if omitted).
             */
            getDefault(instanceZuid?: string): Promise<MediaBin>;
            /** @deprecated Use media.files.search() instead. */
            search(binZuid: string, term: string, opts?: {
                limit?: number;
            }): Promise<MediaFile[]>;
            /** @deprecated Use media.files.list() instead. */
            listFiles(numericInstanceId: number | string, groupId: string): Promise<MediaFile[]>;
            /** @deprecated Use media.files.update() instead. */
            updateFile(fileId: string, data: {
                title?: string;
                filename?: string;
            }): Promise<MediaFile>;
            /** @deprecated Use media.files.delete() instead. */
            deleteFile(fileId: string): Promise<unknown>;
        };
        groups: {
            /**
             * List groups (subfolders) within a bin.
             * <!-- http: GET https://media-manager.api.zesty.io/bin/{binId}/groups -->
             */
            list(binId: string): Promise<MediaGroup[]>;
        };
        files: {
            /**
             * Get a single media file by its ZUID.
             * <!-- http: GET https://media-manager.api.zesty.io/file/{fileZuid} -->
             */
            get(fileZuid: string): Promise<MediaFile>;
            /**
             * Search media files by term (filename / title).
             * <!-- http: GET https://media-manager.api.zesty.io/search/files?bins={binZuid}&term={term} -->
             */
            search(binZuid: string, term: string, opts?: {
                limit?: number;
            }): Promise<MediaFile[]>;
            /**
             * List files in a group/bin.
             * <!-- http: GET https://media-manager.api.zesty.io/site/{numericInstanceId}/groups/{groupId}/files -->
             */
            list(numericInstanceId: number | string, groupId: string): Promise<MediaFile[]>;
            /**
             * Update a media file's metadata.
             * <!-- http: PATCH https://media-manager.api.zesty.io/media/{fileId} -->
             */
            update(fileId: string, data: {
                title?: string;
                filename?: string;
            }): Promise<MediaFile>;
            /**
             * Delete a media file.
             * <!-- http: DELETE https://media-manager.api.zesty.io/media/{fileId} -->
             */
            delete(fileId: string): Promise<unknown>;
        };
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
        upload(file: File | Blob | ArrayBuffer, opts: {
            binZuid: string;
            userId: string;
            groupZuid?: string;
            filename?: string;
            mimeType?: string;
            title?: string;
        }): Promise<MediaFile>;
    };
};

/**
 * createZestyVanilla — browser-friendly adapter.
 *
 * Automatically reads the APP_SID or DEV_APP_SID session cookie so consumers
 * using a vanilla <script> tag don't need to wire up auth manually.
 *
 * Usage (after loading zesty-sdk.min.js via <script>):
 *   const sdk = ZestySdk.createZestyVanilla({ instanceZuid: "8-abc" });
 *   const models = await sdk.content.models.list();
 *
 * @param config - Partial ZestyConfig. authToken defaults to cookie value.
 */
declare function createZestyVanilla(config?: Omit<ZestyConfig, "authToken"> & {
    authToken?: string;
}): ZestySdk;
/**
 * createZestyNode — server-friendly adapter.
 *
 * Requires an explicit authToken — throws synchronously at init time if none
 * is provided, since there is no cookie jar or browser context to fall back on.
 * Works in Node 18+ with native fetch.
 *
 * Usage:
 *   import { createZestyNode } from "js-sdk";
 *   const sdk = createZestyNode({ authToken: process.env.ZESTY_TOKEN });
 *
 * @param config - ZestyConfig. authToken is required.
 * @throws {Error} if no authToken is provided.
 */
declare function createZestyNode(config: Omit<ZestyConfig, "authToken"> & {
    authToken: string;
}): ZestySdk;
/**
 * createZestyNext — Next.js App Router adapter.
 *
 * Pre-wires all three base URL overrides to the conventional proxy paths used
 * in Content.One Next.js apps. The caller still has to implement the three
 * catch-all API routes (see README), but the SDK is ready to use them
 * without any further config.
 *
 * Defaults (all overridable via config):
 *   accountsBaseUrlOverride  → "/api/v1"
 *   contentBaseUrlOverride   → "/api/instance/{instanceZuid}/v1"
 *   mediaBaseUrlOverride     → "/api/media"
 *
 * Usage in a Next.js Server Component or Route Handler:
 *   import { createZestyNext } from "js-sdk";
 *   const sdk = createZestyNext({ authToken: cookies().get("APP_SID")?.value });
 *
 * Usage in a Client Component:
 *   const sdk = createZestyNext({ instanceZuid: "8-abc" }); // reads cookie
 *
 * @param config - Partial ZestyConfig with optional proxy overrides.
 */
declare function createZestyNext(config?: Omit<ZestyConfig, "authToken"> & {
    authToken?: string;
}): ZestySdk;
/**
 * zestyKey — Vue injection key.
 * Use with Vue's provide/inject: inject(zestyKey) returns the ZestySdk.
 *
 *   import { zestyKey } from "js-sdk";
 *   const sdk = inject(zestyKey)!;
 */
declare const zestyKey: unique symbol;
/** Minimal subset of a Vue 3 App needed for the plugin install step. */
interface VueApp {
    provide(key: symbol, value: unknown): void;
}
/**
 * createZestyVuePlugin — Vue 3 plugin factory.
 *
 * Returns an object with an `install` method compatible with Vue 3's Plugin
 * interface. Call `app.use(createZestyVuePlugin(config))` once in main.ts,
 * then `inject(zestyKey)` in any component to get the SDK.
 *
 * Usage (main.ts):
 *   import { createApp } from "vue";
 *   import { createZestyVuePlugin, zestyKey } from "js-sdk";
 *   const app = createApp(App);
 *   app.use(createZestyVuePlugin({ authToken: import.meta.env.VITE_ZESTY_TOKEN }));
 *   app.mount("#app");
 *
 * Usage (component):
 *   import { inject } from "vue";
 *   import { zestyKey } from "js-sdk";
 *   const sdk = inject(zestyKey)!; // typed as ZestySdk
 *
 * @param config - ZestyConfig passed straight through to createZestySdk.
 */
declare function createZestyVuePlugin(config: ZestyConfig): {
    install(app: VueApp): void;
};
/** Minimal React interface needed by createZestyReact — no React dep required. */
interface ReactLike {
    createContext<T>(defaultValue: T): any;
    useContext(ctx: any): any;
    createElement(type: any, props?: any, ...children: any[]): any;
}
/** Return type of createZestyReact — typed component + hook. */
interface ZestyReactBindings {
    /** Wrap your app (or subtree) in ZestyProvider to make the SDK available. */
    ZestyProvider: (props: {
        children: any;
    }) => any;
    /** Call inside any component to get the ZestySdk instance. */
    useZesty: () => ZestySdk;
}
/**
 * createZestyReact — React context + hook factory.
 *
 * Pass your React import as the first argument so the adapter can create a
 * context without React being a hard dependency of js-sdk.
 *
 * Usage:
 *   import React from "react";
 *   import { createZestyReact } from "js-sdk";
 *
 *   const { ZestyProvider, useZesty } = createZestyReact(React, {
 *     authToken: process.env.NEXT_PUBLIC_ZESTY_TOKEN,
 *     instanceZuid: "8-abc",
 *   });
 *
 *   // In your root component:
 *   export default function App({ children }) {
 *     return <ZestyProvider>{children}</ZestyProvider>;
 *   }
 *
 *   // In any descendant:
 *   function MyComponent() {
 *     const sdk = useZesty();
 *     ...
 *   }
 *
 * @param React  - Your React import (or compatible interface).
 * @param config - ZestyConfig passed to createZestySdk.
 */
declare function createZestyReact(React: ReactLike, config: ZestyConfig): ZestyReactBindings;

export { type AuditLog, type ContentField, type ContentItem, type ContentItemMeta, type ContentItemWeb, type ContentModel, type ContentRedirect, type ContentView, type Domain, type GranularRole, type HeadTag, type Instance, type InstanceSetting, type Invite, type Locale, type MediaBin, type MediaFile, type MediaGroup, type Role, type Team, type TeamMember, type Token, type UsageReport, type User, type Webhook, ZestyApiError, type ZestyConfig, type ZestyReactBindings, type ZestySdk, createZestyNext, createZestyNode, createZestyReact, createZestySdk, createZestyVanilla, createZestyVuePlugin, createZestySdk as default, zestyKey };
