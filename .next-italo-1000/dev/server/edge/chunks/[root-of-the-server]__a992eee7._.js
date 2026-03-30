(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__a992eee7._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/role.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_ROLES",
    ()=>ADMIN_ROLES,
    "PRIMARY_PLATFORM_ROLES",
    ()=>PRIMARY_PLATFORM_ROLES,
    "STAFF_ROLES",
    ()=>STAFF_ROLES,
    "USER_ROLES",
    ()=>USER_ROLES,
    "USER_STATUSES",
    ()=>USER_STATUSES,
    "getRoleLabel",
    ()=>getRoleLabel,
    "getUserStatusLabel",
    ()=>getUserStatusLabel,
    "isActiveUserStatus",
    ()=>isActiveUserStatus,
    "isAdminRole",
    ()=>isAdminRole,
    "isApprovedProfessional",
    ()=>isApprovedProfessional,
    "isProfessionalRole",
    ()=>isProfessionalRole,
    "isRootRole",
    ()=>isRootRole,
    "isStaffRole",
    ()=>isStaffRole,
    "isTrainerRole",
    ()=>isTrainerRole,
    "isVetRole",
    ()=>isVetRole,
    "needsProfessionalApproval",
    ()=>needsProfessionalApproval
]);
const USER_ROLES = [
    "ADMIN",
    "ROOT",
    "SUPERADMIN",
    "TRAINER",
    "VET",
    "CLIENT"
];
const ADMIN_ROLES = [
    "ADMIN",
    "ROOT",
    "SUPERADMIN"
];
const STAFF_ROLES = [
    "ADMIN",
    "ROOT",
    "SUPERADMIN",
    "TRAINER",
    "VET"
];
const PRIMARY_PLATFORM_ROLES = [
    "ADMIN",
    "TRAINER",
    "VET",
    "CLIENT"
];
const USER_STATUSES = [
    "ACTIVE",
    "PENDING_APPROVAL",
    "SUSPENDED"
];
function isAdminRole(role) {
    const r = (role || "").toLowerCase();
    return r === "admin" || r === "root" || r === "superadmin";
}
function isRootRole(role) {
    const r = (role || "").toLowerCase();
    return r === "root";
}
function isTrainerRole(role) {
    const r = (role || "").toLowerCase();
    return r === "trainer";
}
function isVetRole(role) {
    const r = (role || "").toLowerCase();
    return r === "vet";
}
function isProfessionalRole(role) {
    return isTrainerRole(role) || isVetRole(role);
}
function isStaffRole(role) {
    const r = (role || "").toLowerCase();
    return isAdminRole(r) || r === "trainer" || r === "vet";
}
function isActiveUserStatus(status) {
    return String(status || "ACTIVE").toUpperCase() === "ACTIVE";
}
function needsProfessionalApproval(role, status) {
    return isProfessionalRole(role) && !isActiveUserStatus(status);
}
function isApprovedProfessional(role, status) {
    return isProfessionalRole(role) && isActiveUserStatus(status);
}
function getRoleLabel(role) {
    const r = String(role || "CLIENT").toUpperCase();
    if (r === "ROOT") return "Root";
    if (r === "SUPERADMIN") return "Superadmin";
    if (r === "ADMIN") return "Administrador";
    if (r === "TRAINER") return "Adestrador";
    if (r === "VET") return "Veterinario";
    return "Cliente";
}
function getUserStatusLabel(status, role) {
    const normalized = String(status || "ACTIVE").toUpperCase();
    if (normalized === "PENDING_APPROVAL" && isTrainerRole(role)) return "Adestrador em analise";
    if (normalized === "PENDING_APPROVAL" && isVetRole(role)) return "Veterinario em analise";
    if (normalized === "PENDING_APPROVAL") return "Em analise";
    if (normalized === "SUSPENDED") return "Suspenso";
    return "Ativo";
}
}),
"[project]/src/lib/platform.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACCOUNT_PLANS",
    ()=>ACCOUNT_PLANS,
    "ACCOUNT_PLAN_OPTIONS",
    ()=>ACCOUNT_PLAN_OPTIONS,
    "BLOG_POST_TYPES",
    ()=>BLOG_POST_TYPES,
    "CHANNEL_CONTENT_ACCESS",
    ()=>CHANNEL_CONTENT_ACCESS,
    "CHANNEL_CONTENT_CATEGORIES",
    ()=>CHANNEL_CONTENT_CATEGORIES,
    "CHANNEL_CONTENT_TYPES",
    ()=>CHANNEL_CONTENT_TYPES,
    "FORUM_POST_TYPES",
    ()=>FORUM_POST_TYPES,
    "FREE_PLAN_DOG_LIMIT",
    ()=>FREE_PLAN_DOG_LIMIT,
    "PAID_ACCOUNT_PLANS",
    ()=>PAID_ACCOUNT_PLANS,
    "REGISTERABLE_ROLES",
    ()=>REGISTERABLE_ROLES,
    "SCHEDULE_FORMATS",
    ()=>SCHEDULE_FORMATS,
    "TRAINING_DIFFICULTIES",
    ()=>TRAINING_DIFFICULTIES,
    "TRAINING_FOCUS_AREAS",
    ()=>TRAINING_FOCUS_AREAS,
    "getAccountPlanDescription",
    ()=>getAccountPlanDescription,
    "getAccountPlanLabel",
    ()=>getAccountPlanLabel,
    "getBlogPostTypeLabel",
    ()=>getBlogPostTypeLabel,
    "getChannelContentAccessLabel",
    ()=>getChannelContentAccessLabel,
    "getChannelContentCategoryLabel",
    ()=>getChannelContentCategoryLabel,
    "getChannelContentTypeLabel",
    ()=>getChannelContentTypeLabel,
    "getChannelSubscriptionStatusLabel",
    ()=>getChannelSubscriptionStatusLabel,
    "getDogLimit",
    ()=>getDogLimit,
    "getForumPostTypeLabel",
    ()=>getForumPostTypeLabel,
    "getPlanStatusLabel",
    ()=>getPlanStatusLabel,
    "getPlanUpgradeReason",
    ()=>getPlanUpgradeReason,
    "getRemainingDogSlots",
    ()=>getRemainingDogSlots,
    "getScheduleFormatLabel",
    ()=>getScheduleFormatLabel,
    "getTrainingDifficultyLabel",
    ()=>getTrainingDifficultyLabel,
    "getTrainingFocusLabel",
    ()=>getTrainingFocusLabel,
    "hasPremiumPlatformAccess",
    ()=>hasPremiumPlatformAccess,
    "isChannelSubscriptionActive",
    ()=>isChannelSubscriptionActive,
    "isChannelSubscriptionPending",
    ()=>isChannelSubscriptionPending,
    "isPaidPlan",
    ()=>isPaidPlan,
    "isPlanActiveStatus",
    ()=>isPlanActiveStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role.ts [middleware-edge] (ecmascript)");
;
const REGISTERABLE_ROLES = [
    "CLIENT",
    "TRAINER",
    "VET"
];
const ACCOUNT_PLANS = [
    "FREE",
    "STARTER",
    "PRO"
];
const PAID_ACCOUNT_PLANS = [
    "STARTER",
    "PRO"
];
const FREE_PLAN_DOG_LIMIT = 3;
const ACCOUNT_PLAN_OPTIONS = [
    {
        code: "FREE",
        name: "Free",
        priceLabel: "R$ 0",
        description: "Entrada leve para explorar a plataforma, estudar racas, ler dicas e organizar o basico da rotina.",
        perks: [
            "Ate 3 caes por conta",
            "Blog livre, racas e trilhas abertas",
            "Base da rotina, perfil e agenda enxuta",
            "Sem IA personalizada e sem canais premium"
        ]
    },
    {
        code: "STARTER",
        name: "Premium",
        priceLabel: "R$ 29,90/mes",
        description: "Plano principal do tutor para liberar cursos, IA, agenda completa e comunidade premium.",
        perks: [
            "Cursos, comparador e IA liberados",
            "Treinos, agenda e forum com prioridade",
            "Base ideal para assinar canais e estudar com constancia"
        ]
    }
];
const CHANNEL_CONTENT_TYPES = [
    "LESSON",
    "VIDEO",
    "CHECKLIST",
    "GUIDE",
    "LIVE_REPLAY"
];
const CHANNEL_CONTENT_CATEGORIES = [
    "TRILHA",
    "DICAS",
    "TECNICAS",
    "COMPORTAMENTO",
    "ROTINA",
    "SAUDE",
    "CONDICIONAMENTO"
];
const CHANNEL_CONTENT_ACCESS = [
    "FREE",
    "SUBSCRIBER"
];
const TRAINING_FOCUS_AREAS = [
    "OBEDIENCIA",
    "SOCIALIZACAO",
    "ANSIEDADE",
    "CONDUTA_EM_PASSEIO",
    "ENRIQUECIMENTO",
    "ESPORTES",
    "REABILITACAO_COMPORTAMENTAL"
];
const TRAINING_DIFFICULTIES = [
    "INICIANTE",
    "INTERMEDIARIO",
    "AVANCADO"
];
const SCHEDULE_FORMATS = [
    "PRESENTIAL",
    "ONLINE",
    "HYBRID"
];
const FORUM_POST_TYPES = [
    "POST",
    "DICA",
    "TECNICA",
    "COMPORTAMENTO",
    "EVENTO"
];
const BLOG_POST_TYPES = [
    "POST",
    "GUIA",
    "CASO_REAL",
    "REEL",
    "EVENTO"
];
function isPaidPlan(plan) {
    const value = String(plan || "FREE").toUpperCase();
    return value === "STARTER" || value === "PRO";
}
function isPlanActiveStatus(status) {
    const value = String(status || "ACTIVE").toUpperCase();
    return value === "ACTIVE";
}
function hasPremiumPlatformAccess(plan, role, planStatus, accountStatus) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isAdminRole"])(role)) return true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isApprovedProfessional"])(role, accountStatus)) return true;
    if (!isPaidPlan(plan)) return false;
    if (typeof planStatus === "undefined" || planStatus === null || planStatus === "") return true;
    return isPlanActiveStatus(planStatus);
}
function getDogLimit(plan, role, planStatus, accountStatus) {
    if (hasPremiumPlatformAccess(plan, role, planStatus, accountStatus)) return Number.POSITIVE_INFINITY;
    return FREE_PLAN_DOG_LIMIT;
}
function getRemainingDogSlots(currentDogs, plan, role, planStatus, accountStatus) {
    const limit = getDogLimit(plan, role, planStatus, accountStatus);
    if (!Number.isFinite(limit)) return Number.POSITIVE_INFINITY;
    return Math.max(0, limit - currentDogs);
}
function getPlanStatusLabel(status) {
    const value = String(status || "ACTIVE").toUpperCase();
    if (value === "CHECKOUT_PENDING") return "Checkout em andamento";
    if (value === "CHECKOUT_REQUIRED") return "Assinatura pendente";
    if (value === "PAST_DUE") return "Pagamento pendente";
    if (value === "CANCELED") return "Cancelado";
    return "Ativo";
}
function getAccountPlanLabel(plan) {
    const value = String(plan || "FREE").toUpperCase();
    if (value === "STARTER") return "Premium";
    if (value === "PRO") return "Profissional";
    return "Free";
}
function getAccountPlanDescription(plan) {
    const value = String(plan || "FREE").toUpperCase();
    if (value === "STARTER") return "Libera cursos, IA, agenda completa, forum premium e assinatura de canais para o tutor.";
    if (value === "PRO") return "Camada profissional para operar servicos, publicar conteudo e monetizar dentro da plataforma.";
    return "Acesso de entrada com blog, racas, trilhas abertas e ate 3 caes para comecar sem pressa.";
}
function getPlanUpgradeReason(reason) {
    const value = String(reason || "").toLowerCase();
    if (value.includes("/forum")) return "O forum social completo e os canais profissionais pedem Premium ou acesso profissional aprovado.";
    if (value.includes("/conteudos")) return "Os conteudos exclusivos dos profissionais fazem parte do Premium e da operacao profissional.";
    if (value.includes("/training")) return "A trilha completa de treino faz parte do Premium.";
    if (value.includes("/calendar")) return "A agenda completa faz parte do Premium e da operacao profissional.";
    return "Essa area faz parte do Premium ou do acesso profissional aprovado.";
}
function getScheduleFormatLabel(format) {
    const value = String(format || "PRESENTIAL").toUpperCase();
    if (value === "ONLINE") return "Online";
    if (value === "HYBRID") return "Hibrido";
    return "Presencial";
}
function getTrainingDifficultyLabel(difficulty) {
    const value = String(difficulty || "INICIANTE").toUpperCase();
    if (value === "INTERMEDIARIO") return "Intermediario";
    if (value === "AVANCADO") return "Avancado";
    return "Iniciante";
}
function getChannelContentTypeLabel(type) {
    const value = String(type || "LESSON").toUpperCase();
    if (value === "VIDEO") return "Video";
    if (value === "CHECKLIST") return "Checklist";
    if (value === "GUIDE") return "Guia";
    if (value === "LIVE_REPLAY") return "Replay";
    return "Aula";
}
function getChannelContentCategoryLabel(category) {
    const value = String(category || "TRILHA").toUpperCase();
    if (value === "DICAS") return "Dicas";
    if (value === "TECNICAS") return "Tecnicas";
    if (value === "COMPORTAMENTO") return "Comportamento";
    if (value === "ROTINA") return "Rotina";
    if (value === "SAUDE") return "Saude";
    if (value === "CONDICIONAMENTO") return "Condicionamento";
    return "Trilha";
}
function getChannelContentAccessLabel(access) {
    const value = String(access || "SUBSCRIBER").toUpperCase();
    if (value === "FREE") return "Livre";
    return "Assinantes";
}
function isChannelSubscriptionActive(status) {
    return String(status || "").toUpperCase() === "ACTIVE";
}
function isChannelSubscriptionPending(status) {
    const value = String(status || "").toUpperCase();
    return value === "PENDING_PAYMENT" || value === "CHECKOUT_PENDING";
}
function getChannelSubscriptionStatusLabel(status) {
    const value = String(status || "").toUpperCase();
    if (isChannelSubscriptionPending(value)) return "Checkout pendente";
    if (value === "CANCELED") return "Cancelada";
    return "Ativa";
}
function getTrainingFocusLabel(value) {
    return String(value || "OBEDIENCIA").toLowerCase().replace(/_/g, " ").replace(/^\w/, (char)=>char.toUpperCase());
}
function getForumPostTypeLabel(value) {
    const normalized = String(value || "POST").toUpperCase();
    if (normalized === "DICA") return "Dica";
    if (normalized === "TECNICA") return "Tecnica";
    if (normalized === "COMPORTAMENTO") return "Comportamento";
    if (normalized === "EVENTO") return "Evento";
    return "Post";
}
function getBlogPostTypeLabel(value) {
    const normalized = String(value || "POST").toUpperCase();
    if (normalized === "GUIA") return "Guia";
    if (normalized === "CASO_REAL") return "Caso real";
    if (normalized === "REEL") return "Reel";
    if (normalized === "EVENTO") return "Evento";
    return "Post";
}
}),
"[project]/src/lib/access.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAccessSnapshot",
    ()=>createAccessSnapshot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/platform.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role.ts [middleware-edge] (ecmascript)");
;
;
function createAccessSnapshot(seed = {}) {
    const userId = seed.userId || null;
    const isLoggedIn = !!userId;
    const role = String(seed.role || (isLoggedIn ? "CLIENT" : "GUEST")).toUpperCase();
    const plan = String(seed.plan || "FREE").toUpperCase();
    const planStatus = String(seed.planStatus || "ACTIVE").toUpperCase();
    const accountStatus = String(seed.status || (isLoggedIn ? "ACTIVE" : "GUEST")).toUpperCase();
    const emailVerified = !!seed.emailVerifiedAt;
    const isAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isAdminRole"])(role);
    const isRoot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isRootRole"])(role);
    const isStaff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isStaffRole"])(role);
    const isProfessional = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isProfessionalRole"])(role);
    const approvedProfessional = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isApprovedProfessional"])(role, accountStatus);
    const requiresProfessionalApproval = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["needsProfessionalApproval"])(role, accountStatus);
    const hasPaidPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isPaidPlan"])(plan);
    const hasActivePlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isPlanActiveStatus"])(planStatus);
    const hasPremiumAccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["hasPremiumPlatformAccess"])(plan, role, planStatus, accountStatus);
    return {
        userId,
        role,
        plan,
        planStatus,
        accountStatus,
        isLoggedIn,
        emailVerified,
        isAdmin,
        isRoot,
        isStaff,
        isProfessional,
        isApprovedProfessional: approvedProfessional,
        requiresProfessionalApproval,
        hasPaidPlan,
        hasActivePlan,
        hasPremiumAccess,
        checkoutRequired: planStatus === "CHECKOUT_REQUIRED",
        checkoutPending: planStatus === "CHECKOUT_PENDING",
        paymentPastDue: planStatus === "PAST_DUE",
        planCanceled: planStatus === "CANCELED",
        canCreatePaidChannel: isAdmin || approvedProfessional,
        canOfferPaidServices: isAdmin || approvedProfessional
    };
}
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/jwt/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$access$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/access.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/role.ts [middleware-edge] (ecmascript)");
;
;
;
;
const ADMIN_PATHS = [
    "/admin",
    "/api/admin"
];
const STAFF_PATHS = [
    "/forum/channels/new",
    "/conteudos/new",
    "/api/forum/channels",
    "/api/content"
];
const PREMIUM_PATHS = [
    "/forum",
    "/conteudos",
    "/training",
    "/calendar",
    "/racas/ia",
    "/racas/comparador",
    "/racas/radar"
];
const PROTECTED_PATHS = [
    "/billing",
    "/dashboard",
    "/financeiro",
    "/calendar",
    "/dogs",
    "/dogs/new",
    "/training",
    "/profile",
    "/blog/new",
    "/forum",
    "/forum/new",
    "/api/billing",
    "/api/dogs",
    "/api/training",
    "/api/schedule",
    "/api/profile",
    "/api/forum",
    "/api/content",
    "/api/subscription",
    "/api/verify"
];
const VERIFICATION_ALLOWED_PREFIXES = [
    "/dashboard",
    "/verify",
    "/api/verify",
    "/api/auth",
    "/logout",
    "/login",
    "/register"
];
const CONTENT_SECURITY_POLICY = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "connect-src 'self' https:"
].join("; ");
function matchesPrefix(path, prefixes) {
    return prefixes.some((prefix)=>path === prefix || path.startsWith(`${prefix}/`));
}
function applySecurityHeaders(response) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    return response;
}
async function middleware(req) {
    const url = req.nextUrl;
    const path = url.pathname;
    const requiresAuth = matchesPrefix(path, ADMIN_PATHS) || matchesPrefix(path, STAFF_PATHS) || matchesPrefix(path, PROTECTED_PATHS);
    if (!requiresAuth) {
        return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next());
    }
    const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$jwt$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getToken"])({
        req,
        secret: process.env.NEXTAUTH_SECRET
    });
    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", path);
        return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl));
    }
    if (token.status === "SUSPENDED") {
        const blockedUrl = new URL("/login", req.url);
        blockedUrl.searchParams.set("reason", "suspended");
        return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(blockedUrl));
    }
    if (matchesPrefix(path, ADMIN_PATHS) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isAdminRole"])(token.role)) {
        return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/dashboard", req.url)));
    }
    const access = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$access$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createAccessSnapshot"])({
        userId: token.sub,
        role: token.role,
        plan: token.plan,
        planStatus: token.planStatus,
        status: token.status,
        emailVerifiedAt: token.emailVerifiedAt
    });
    if (matchesPrefix(path, STAFF_PATHS) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isStaffRole"])(token.role)) {
        return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/dashboard", req.url)));
    }
    if (matchesPrefix(path, PREMIUM_PATHS) && !access.hasPremiumAccess) {
        const billingUrl = new URL("/billing", req.url);
        billingUrl.searchParams.set("locked", path);
        return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(billingUrl));
    }
    if (!access.emailVerified && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$role$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["isRootRole"])(token.role)) {
        const isAllowed = matchesPrefix(path, VERIFICATION_ALLOWED_PREFIXES);
        if (!isAllowed) {
            const verifyUrl = new URL("/verify", req.url);
            verifyUrl.searchParams.set("next", path);
            return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(verifyUrl));
        }
    }
    return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next());
}
const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/billing/:path*",
        "/financeiro/:path*",
        "/calendar/:path*",
        "/conteudos/:path*",
        "/dogs/:path*",
        "/forum/:path*",
        "/profile/:path*",
        "/racas/ia/:path*",
        "/racas/comparador/:path*",
        "/racas/radar/:path*",
        "/training/:path*",
        "/verify/:path*",
        "/api/admin/:path*",
        "/api/billing/:path*",
        "/api/content/:path*",
        "/api/dogs/:path*",
        "/api/forum/:path*",
        "/api/profile/:path*",
        "/api/schedule/:path*",
        "/api/subscription/:path*",
        "/api/training/:path*",
        "/api/verify/:path*",
        "/blog/new/:path*"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a992eee7._.js.map