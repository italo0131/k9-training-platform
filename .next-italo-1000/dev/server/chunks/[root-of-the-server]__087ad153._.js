module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
function resolveDatasourceUrl() {
    const rawUrl = String(process.env.DATABASE_URL || "").trim();
    if (!rawUrl) return undefined;
    const explicitDevUrl = String(process.env.DATABASE_URL_DEV || "").trim();
    if (explicitDevUrl && ("TURBOPACK compile-time value", "development") !== "production") {
        return explicitDevUrl;
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const parsed = new URL(rawUrl);
        if (parsed.hostname === "db") {
            parsed.hostname = String(process.env.DATABASE_HOST_FALLBACK || "localhost").trim() || "localhost";
            return parsed.toString();
        }
    } catch  {
        return rawUrl;
    }
    return rawUrl;
}
const datasourceUrl = resolveDatasourceUrl();
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"](datasourceUrl ? {
    datasources: {
        db: {
            url: datasourceUrl
        }
    }
} : undefined);
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
}),
"[project]/src/lib/verification.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createVerificationCode",
    ()=>createVerificationCode,
    "generateCode",
    ()=>generateCode,
    "verifyCode",
    ()=>verifyCode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function createVerificationCode(userId, type) {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationCode.create({
        data: {
            userId,
            type,
            code,
            expiresAt
        }
    });
    return code;
}
async function verifyCode(userId, type, code) {
    const record = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationCode.findFirst({
        where: {
            userId,
            type,
            code,
            expiresAt: {
                gte: new Date()
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    if (!record) return false;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].verificationCode.delete({
        where: {
            id: record.id
        }
    });
    return true;
}
}),
"[project]/src/lib/security.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getClientIp",
    ()=>getClientIp,
    "rejectIfCrossOrigin",
    ()=>rejectIfCrossOrigin,
    "rejectIfRateLimited",
    ()=>rejectIfRateLimited,
    "takeRateLimit",
    ()=>takeRateLimit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const globalStore = globalThis;
function getRateLimitStore() {
    if (!globalStore.__k9RateLimitStore) {
        globalStore.__k9RateLimitStore = new Map();
    }
    return globalStore.__k9RateLimitStore;
}
function takeRateLimit(key, limit, windowMs) {
    const now = Date.now();
    const store = getRateLimitStore();
    const current = store.get(key);
    if (!current || current.resetAt <= now) {
        store.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return {
            allowed: true,
            remaining: Math.max(0, limit - 1),
            resetAt: now + windowMs
        };
    }
    if (current.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: current.resetAt
        };
    }
    current.count += 1;
    store.set(key, current);
    return {
        allowed: true,
        remaining: Math.max(0, limit - current.count),
        resetAt: current.resetAt
    };
}
function getClientIp(req) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "unknown";
    }
    return req.headers.get("x-real-ip") || "unknown";
}
function normalizeOrigin(origin) {
    try {
        const url = new URL(origin);
        const hostname = url.hostname === "127.0.0.1" || url.hostname === "[::1]" ? "localhost" : url.hostname;
        const isDefaultPort = url.protocol === "http:" && (url.port === "" || url.port === "80") || url.protocol === "https:" && (url.port === "" || url.port === "443");
        const port = isDefaultPort ? "" : `:${url.port}`;
        return `${url.protocol}//${hostname}${port}`;
    } catch  {
        return origin.trim().toLowerCase();
    }
}
function getAllowedOrigins(req) {
    const allowed = new Set();
    const requestUrl = new URL(req.url);
    allowed.add(normalizeOrigin(`${requestUrl.protocol}//${requestUrl.host}`));
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const forwardedHost = req.headers.get("x-forwarded-host");
    if (forwardedProto && forwardedHost) {
        allowed.add(normalizeOrigin(`${forwardedProto}://${forwardedHost}`));
    }
    const host = req.headers.get("host");
    if (host) {
        const protocol = forwardedProto || requestUrl.protocol.replace(":", "");
        allowed.add(normalizeOrigin(`${protocol}://${host}`));
    }
    const nextAuthUrl = String(process.env.NEXTAUTH_URL || "").trim();
    if (nextAuthUrl) {
        allowed.add(normalizeOrigin(nextAuthUrl));
    }
    const explicitAllowedOrigins = String(process.env.ALLOWED_ORIGINS || "").split(",").map((item)=>item.trim()).filter(Boolean);
    for (const origin of explicitAllowedOrigins){
        allowed.add(normalizeOrigin(origin));
    }
    return allowed;
}
function rejectIfRateLimited(req, scope, limit, windowMs, message) {
    const ip = getClientIp(req);
    const result = takeRateLimit(`${scope}:${ip}`, limit, windowMs);
    if (result.allowed) {
        return null;
    }
    const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        message
    }, {
        status: 429,
        headers: {
            "Retry-After": String(retryAfter)
        }
    });
}
function rejectIfCrossOrigin(req) {
    const origin = req.headers.get("origin");
    if (!origin) return null;
    const normalizedOrigin = normalizeOrigin(origin);
    const allowedOrigins = getAllowedOrigins(req);
    if (allowedOrigins.has(normalizedOrigin)) {
        return null;
    }
    console.warn("[security] blocked origin", {
        origin: normalizedOrigin,
        allowedOrigins: Array.from(allowedOrigins)
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        message: "Origem invalida"
    }, {
        status: 403
    });
}
}),
"[project]/src/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$bcrypt__$5b$external$5d$__$28$bcrypt$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcrypt$29$__ = __turbopack_context__.i("[externals]/bcrypt [external] (bcrypt, cjs, [project]/node_modules/bcrypt)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$verification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/verification.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
async function verifyPassword(stored, input) {
    if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
        return {
            valid: await __TURBOPACK__imported__module__$5b$externals$5d2f$bcrypt__$5b$external$5d$__$28$bcrypt$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$bcrypt$29$__["default"].compare(input, stored),
            needsRehash: false
        };
    }
    if (stored.startsWith("scrypt:")) {
        const [, salt, hash] = stored.split(":");
        const derivedInput = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(input, salt, 64);
        return {
            valid: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["timingSafeEqual"])(Buffer.from(hash, "hex"), derivedInput),
            needsRehash: false
        };
    }
    const sha = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])("sha256").update(input).digest("hex");
    if (stored === sha) return {
        valid: true,
        needsRehash: true
    };
    return {
        valid: stored === input,
        needsRehash: stored === input
    };
}
function hashPassword(password) {
    const salt = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomBytes"])(16).toString("hex");
    const derived = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["scryptSync"])(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${derived}`;
}
function isDatabaseUnavailableError(error) {
    if (!error || typeof error !== "object") return false;
    const candidate = error;
    if (candidate.code === "P1001") return true;
    if (candidate.name === "PrismaClientInitializationError") return true;
    return String(candidate.message || "").includes("Can't reach database server");
}
function isSchemaMismatchError(error) {
    if (!error || typeof error !== "object") return false;
    const candidate = error;
    if (candidate.code === "P2022") return true;
    return String(candidate.message || "").includes("does not exist in the current database");
}
const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Senha",
                    type: "password"
                }
            },
            async authorize (credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null;
                    const email = normalizeEmail(credentials.email);
                    const loginRateLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["takeRateLimit"])(`auth:login:${email}`, 10, 10 * 60 * 1000);
                    if (!loginRateLimit.allowed) {
                        throw new Error("TOO_MANY_ATTEMPTS");
                    }
                    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                        where: {
                            email
                        }
                    });
                    if (!user) return null;
                    const passwordCheck = await verifyPassword(user.password, credentials.password);
                    if (!passwordCheck.valid) return null;
                    if (user.status === "SUSPENDED") {
                        throw new Error("ACCOUNT_SUSPENDED");
                    }
                    if (passwordCheck.needsRehash) {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                password: hashPassword(credentials.password)
                            }
                        });
                    }
                    if (user.twoFactorEnabled) {
                        const providedCode = credentials.twoFactorCode;
                        if (!providedCode) {
                            const code = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$verification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createVerificationCode"])(user.id, "2fa");
                            console.log(`[2fa] ${user.email} code=${code}`);
                            throw new Error("2FA_REQUIRED");
                        }
                        const valid2fa = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$verification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyCode"])(user.id, "2fa", providedCode);
                        if (!valid2fa) {
                            throw new Error("2FA_INVALID");
                        }
                    }
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        plan: user.plan,
                        planStatus: user.planStatus
                    };
                } catch (error) {
                    if (isSchemaMismatchError(error)) {
                        throw new Error("AUTH_SCHEMA_OUTDATED");
                    }
                    if (isDatabaseUnavailableError(error)) {
                        throw new Error("AUTH_DATABASE_UNAVAILABLE");
                    }
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.role = user.role;
                token.plan = user.plan;
                token.planStatus = user.planStatus;
            }
            if (token.sub) {
                const dbUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        id: token.sub
                    }
                });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.plan = dbUser.plan;
                    token.planStatus = dbUser.planStatus;
                    token.emailVerifiedAt = dbUser.emailVerifiedAt?.toISOString() || null;
                    token.twoFactorEnabled = dbUser.twoFactorEnabled;
                    token.status = dbUser.status;
                }
            }
            return token;
        },
        async session ({ session, token }) {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.plan = token.plan;
                session.user.planStatus = token.planStatus;
                session.user.emailVerifiedAt = token.emailVerifiedAt;
                session.user.status = token.status;
                session.user.twoFactorEnabled = !!token.twoFactorEnabled;
            }
            return session;
        }
    }
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__087ad153._.js.map