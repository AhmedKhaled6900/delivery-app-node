# Delivery App — API Documentation

**Base URL (local):** `http://localhost:3000`  
**Base URL (production):** `https://YOUR-APP.up.railway.app`

**Headers (للطلبات المحمية):**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**CORS (Frontend):** أضف في Railway Variables:
```env
CORS_ORIGINS=http://localhost:5173,https://your-frontend.com
```
(بدون `/` في الآخر، وبدون quotes)

**صيغة الرد الناجح:**
```json
{ "success": true, "data": { ... } }
```

**صيغة الخطأ:**
```json
{ "success": false, "message": "Error description", "errors": [] }
```
`errors` تظهر فقط عند أخطاء التحقق (validation).

---

## عام

### `GET /health`
فحص سريع (Railway).

**Response `200`:**
```
ok
```

---

### `GET /api/health`
فحص الـ API.

**Response `200`:**
```json
{ "success": true }
```

---

## Admin — `/api/admin`

### Auth — `/api/admin/auth`

#### `POST /api/admin/auth/login/phone`
تسجيل دخول الأدمن برقم التليفون.

**Body:**
```json
{
  "phone": "01012345678",
  "countryCode": "EG",
  "password": "admin123"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| phone | ✅ | رقم محلي أو دولي |
| countryCode | ❌ | ISO-2: `EG`, `SA`, `AE`, `KW`… |
| password | ✅ | 6 أحرف على الأقل |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Super Admin",
      "phone": "+201012345678",
      "email": "admin@delivery.com",
      "role": "super_admin",
      "permissions": ["dashboard.view_stats", "clients.view", "..."],
      "roles": [],
      "phoneVerified": true,
      "emailVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** `401` بيانات غلط

---

#### `POST /api/admin/auth/login/email`
تسجيل دخول بالإيميل.

**Body:**
```json
{
  "email": "admin@delivery.com",
  "password": "admin123"
}
```

**Response:** نفس شكل `login/phone`

---

#### `POST /api/admin/auth/forgot-password`
إرسال OTP لإعادة تعيين كلمة المرور.

**Body (SMS):**
```json
{
  "channel": "phone",
  "phone": "01012345678",
  "countryCode": "EG"
}
```

**Body (Email):**
```json
{
  "channel": "email",
  "email": "admin@delivery.com"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| channel | ✅ | `phone` أو `email` |
| phone | ✅ if channel=phone | |
| email | ✅ if channel=email | |
| countryCode | ❌ | مع `phone` |

**Response `200`:**
```json
{
  "success": true,
  "message": "OTP sent via phone",
  "data": { "channel": "phone" }
}
```

**Errors:** `404` الحساب غير موجود · `429` انتظر قبل إعادة الإرسال

> **تطوير:** بدون SMTP/Twilio الـ OTP يظهر في **console السيرفر**.

---

#### `POST /api/admin/auth/reset-password`
تأكيد OTP وتعيين باسورد جديد.

**Body:**
```json
{
  "channel": "phone",
  "phone": "01012345678",
  "countryCode": "EG",
  "code": "123456",
  "password": "newPassword123"
}
```

| Field | Required |
|-------|----------|
| channel | ✅ `phone` \| `email` |
| code | ✅ 6 أرقام |
| password | ✅ 6+ أحرف |
| phone + countryCode | مع channel=phone |
| email | مع channel=email |

**Response `200`:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "user": { ... },
    "token": "eyJ..."
  }
}
```

**Errors:** `400` OTP غلط أو منتهي

---

#### `GET /api/admin/auth/me`
🔒 **Auth:** Admin token

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "_id", "name", "phone", "email", "role", "permissions", "roles", ... }
  }
}
```

`super_admin` يحصل على كل الصلاحيات تلقائياً. الموظف (`staff`) يحصل على `permissions` مجمّعة من الأدوار المعيّنة له.

---

### Roles & Permissions — `/api/admin/roles` · `/api/admin/staff` · `/api/admin/permissions`

🔒 **Auth:** Admin token + صلاحية مناسبة (أو `super_admin`)

#### الصلاحيات المتاحة

| Permission | الوصف |
|------------|--------|
| `dashboard.view_stats` | عرض إحصائيات الداشبورد |
| `clients.view` | عرض العملاء |
| `deliveries.view` | عرض المندوبين |
| `deliveries.manage` | تفعيل/إيقاف المندوبين |
| `orders.view` | عرض الطلبات |
| `orders.assign` | تعيين الطلبات |
| `orders.cancel` | إلغاء الطلبات |
| `roles.view` | عرض الأدوار |
| `roles.manage` | إنشاء/تعديل/حذف الأدوار |
| `staff.view` | عرض الموظفين |
| `staff.manage` | إضافة/تعديل/إيقاف الموظفين |

#### `GET /api/admin/permissions`
🔒 `roles.view` أو `roles.manage`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "key": "orders.view", "label": "View orders", "labelAr": "عرض الطلبات", "group": "orders" }
  ]
}
```

---

#### `GET /api/admin/roles`
🔒 `roles.view` أو `roles.manage`

#### `POST /api/admin/roles`
🔒 `roles.manage`

**Body:**
```json
{
  "name": "Support Agent",
  "description": "View orders and clients only",
  "permissions": ["dashboard.view_stats", "clients.view", "orders.view"]
}
```

#### `PATCH /api/admin/roles/:id` · `DELETE /api/admin/roles/:id`
🔒 `roles.manage` — الأدوار النظامية (`isSystem: true`) لا يمكن حذفها.

---

#### `GET /api/admin/staff`
🔒 `staff.view` أو `staff.manage`

**Query:** `page` · `limit`

#### `POST /api/admin/staff`
🔒 `staff.manage`

**Body:**
```json
{
  "name": "Ahmed",
  "phone": "01012345678",
  "countryCode": "EG",
  "email": "staff@delivery.com",
  "password": "staff123",
  "roleIds": ["<dashboardRoleId1>", "<dashboardRoleId2>"]
}
```

#### `PATCH /api/admin/staff/:id`
🔒 `staff.manage` — تحديث الاسم، الأدوار، `isActive`، أو كلمة المرور.

#### `DELETE /api/admin/staff/:id`
🔒 `staff.manage` — إيقاف الموظف (`isActive: false`).

**Errors:** `403` لا تملك الصلاحية · `409` دور مستخدم لموظفين

**Seed:** `npm run seed:admin` ينشئ أدوار افتراضية: Viewer، Orders Manager، Operations Manager، HR Manager.

---

### Dashboard — `/api/admin/dashboard`
🔒 **Admin token** + الصلاحية المطلوبة لكل مسار

#### `GET /api/admin/dashboard/stats`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clientsCount": 10,
    "deliveriesCount": 5,
    "ordersCount": 100,
    "pendingOrders": 12,
    "activeDeliveries": 3
  }
}
```

---

#### `GET /api/admin/dashboard/clients`
**Query:** `page` (default 1) · `limit` (default 20)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clients": [ { "_id", "name", "email", "phone", ... } ],
    "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
  }
}
```

---

#### `GET /api/admin/dashboard/deliveries`
**Query:** `page` · `limit`

**Response:** نفس شكل pagination مع `deliveries[]`

---

#### `GET /api/admin/dashboard/orders`
**Query:** `page` · `limit` · `status` (optional: `pending`, `assigned`, …)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "...",
        "status": "pending",
        "client": { "name", "email", "phone" },
        "delivery": null,
        "pickupAddress": { ... },
        "dropoffAddress": { ... },
        "totalAmount": 50
      }
    ],
    "pagination": { ... }
  }
}
```

---

#### `PATCH /api/admin/dashboard/deliveries/:id/toggle-status`
تفعيل / إيقاف مندوب.

**Params:** `id` = MongoDB ID للمندوب

**Response `200`:**
```json
{
  "success": true,
  "data": { "id": "...", "isActive": false }
}
```

---

### Orders — `/api/admin/orders`
🔒 **Admin token**

#### `GET /api/admin/orders/:id`
تفاصيل طلب.

**Response `200`:**
```json
{ "success": true, "data": { "order": { ... } } }
```

---

#### `PATCH /api/admin/orders/:id/assign`
تعيين مندوب لطلب `pending`.

**Body:**
```json
{ "deliveryId": "665f1a2b3c4d5e6f7a8b9c0d" }
```

**Response `200`:**
```json
{ "success": true, "data": { "order": { "status": "assigned", "delivery": { ... } } } }
```

**Errors:** `400` الطلب مش pending

---

#### `PATCH /api/admin/orders/:id/cancel`
إلغاء طلب (`pending` أو `assigned`).

**Response `200`:**
```json
{ "success": true, "data": { "order": { "status": "cancelled" } } }
```

---

## Client — `/api/client`

### Auth — `/api/client/auth`

#### `POST /api/client/auth/register/email`
**Body:**
```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "123456",
  "countryCode": "EG"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "user": {
      "_id": "...",
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "authProvider": "email",
      "emailVerified": false,
      "phoneVerified": false
    },
    "token": "eyJ...",
    "requiresVerification": { "email": true }
  }
}
```

---

#### `POST /api/client/auth/register/phone`
**Body:**
```json
{
  "name": "Ahmed",
  "phone": "01012345678",
  "password": "123456",
  "countryCode": "EG"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "OTP sent to your phone",
  "data": {
    "user": { "phone": "+201012345678", "authProvider": "phone", ... },
    "token": "eyJ...",
    "requiresVerification": { "phone": true }
  }
}
```

---

#### `POST /api/client/auth/register/google`
**Body:**
```json
{
  "idToken": "GOOGLE_ID_TOKEN_FROM_CLIENT_SDK",
  "name": "Ahmed",
  "countryCode": "EG"
}
```

| Field | Required |
|-------|----------|
| idToken | ✅ |
| name | ❌ |
| countryCode | ❌ |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "email": "...",
      "googleId": "...",
      "authProvider": "google",
      "emailVerified": true
    },
    "token": "eyJ..."
  }
}
```

---

#### `POST /api/client/auth/login/email`
**Body:** `{ "email", "password" }`

**Response `200`:** `{ user, token }`  
**Errors:** `403` لو الإيميل مش متأكد · `401` بيانات غلط

---

#### `POST /api/client/auth/login/phone`
**Body:** `{ "phone", "password", "countryCode?" }`

**Response `200`:** `{ user, token }`  
**Errors:** `403` لو التليفون مش متأكد

---

#### `POST /api/client/auth/login/google`
**Body:** `{ "idToken": "..." }`

**Response `200`:** `{ user, token }`  
**Errors:** `404` الحساب غير مسجل

---

#### `POST /api/client/auth/verify-otp`
🔒 **Client token** (بعد التسجيل)

**Body:**
```json
{
  "channel": "phone",
  "code": "123456"
}
```

`channel`: `phone` | `email`

**Response `200`:**
```json
{
  "success": true,
  "message": "phone verified successfully",
  "data": { "user": { "phoneVerified": true }, "token": "eyJ..." }
}
```

---

#### `POST /api/client/auth/resend-otp`
🔒 **Client token**

**Body:** `{ "channel": "phone" }` أو `"email"`

**Response `200`:**
```json
{ "success": true, "message": "OTP resent via phone" }
```

---

#### `GET /api/client/auth/me`
🔒 **Client token**

**Response `200`:**
```json
{ "success": true, "data": { "user": { ... } } }
```

---

### Orders — `/api/client/orders`
🔒 **Client token**

#### `POST /api/client/orders`
إنشاء طلب.

**Body:**
```json
{
  "pickupAddress": {
    "street": "15 Tahrir St",
    "city": "Cairo",
    "coordinates": { "lat": 30.0444, "lng": 31.2357 }
  },
  "dropoffAddress": {
    "street": "22 Nile Rd",
    "city": "Giza"
  },
  "totalAmount": 50,
  "notes": "Call on arrival"
}
```

| Field | Required |
|-------|----------|
| pickupAddress.street, .city | ✅ |
| dropoffAddress.street, .city | ✅ |
| totalAmount | ❌ (default 0) |
| notes | ❌ |
| coordinates | ❌ |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "status": "pending",
      "client": "...",
      "pickupAddress": { ... },
      "dropoffAddress": { ... },
      "totalAmount": 50
    }
  }
}
```

---

#### `GET /api/client/orders`
طلباتي.

**Query:** `page` · `limit` · `status` (optional)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "orders": [ ... ],
    "pagination": { "page", "limit", "total", "pages" }
  }
}
```

---

#### `GET /api/client/orders/:id`
**Response `200`:** `{ "order": { ... } }`  
**Errors:** `403` مش طلبك

---

#### `PATCH /api/client/orders/:id/cancel`
إلغاء طلب `pending` فقط.

**Response `200`:** `{ "order": { "status": "cancelled" } }`

---

## Delivery — `/api/delivery`

### Auth — `/api/delivery/auth`

#### `POST /api/delivery/auth/register`
**Body:**
```json
{
  "name": "Mohamed",
  "email": "driver@example.com",
  "phone": "01098765432",
  "password": "123456",
  "countryCode": "EG",
  "vehicleType": "motorcycle"
}
```

`vehicleType`: `motorcycle` | `car` | `bicycle` (default: motorcycle)

**Response `201`:**
```json
{
  "success": true,
  "data": { "user": { ... }, "token": "eyJ..." }
}
```

---

#### `POST /api/delivery/auth/login`
**Body:** `{ "email", "password" }`

**Response `200`:** `{ user, token }`  
**Errors:** `403` الحساب موقوف

---

#### `GET /api/delivery/auth/me`
🔒 **Delivery token**

---

#### `PATCH /api/delivery/auth/availability`
تبديل حالة التوفر (`isAvailable`).

🔒 **Delivery token**

**Response `200`:**
```json
{
  "success": true,
  "data": { "isAvailable": true }
}
```

---

### Orders — `/api/delivery/orders`
🔒 **Delivery token** · المندوب لازم `isAvailable: true` لقبول الطلبات

#### `GET /api/delivery/orders/available`
طلبات `pending` غير معيّنة.

**Query:** `page` · `limit`

---

#### `GET /api/delivery/orders/my`
طلبات المندوب.

**Query:** `page` · `limit` · `status`

---

#### `POST /api/delivery/orders/:id/accept`
قبول طلب.

**Response `200`:**
```json
{ "success": true, "data": { "order": { "status": "assigned", "delivery": "..." } } }
```

**Errors:** `400` الطلب مش متاح · `400` لازم `isAvailable: true`

---

#### `PATCH /api/delivery/orders/:id/status`
تحديث حالة الطلب.

**Body:**
```json
{ "status": "picked_up" }
```
أو `{ "status": "delivered" }`

**التسلسل:** `assigned` → `picked_up` → `delivered`

**Response `200`:** `{ "order": { "status": "picked_up" } }`

---

#### `GET /api/delivery/orders/:id`
**Response `200`:** `{ "order": { ... } }`  
**Errors:** `403` مش طلبك (إلا لو `pending` للمعاينة)

---

## حالات الطلب (Order Status)

```
pending → assigned → picked_up → delivered
   ↓          ↓
cancelled  cancelled
```

| Status | المعنى |
|--------|--------|
| pending | جديد، في انتظار مندوب |
| assigned | تم التعيين |
| picked_up | تم الاستلام |
| delivered | تم التسليم |
| cancelled | ملغي |

---

## أكواد HTTP الشائعة

| Code | المعنى |
|------|--------|
| 200 | نجاح |
| 201 | تم الإنشاء |
| 400 | بيانات أو OTP غلط |
| 401 | غير مصرح / token غلط |
| 403 | ممنوع (حساب موقوف، مش متأكد، مش طلبك) |
| 404 | غير موجود |
| 409 | مكرر (إيميل/تلفون مسجل) |
| 429 | OTP كثير — انتظر |
| 500 | خطأ سيرفر |

---

## Postman — ملاحظات

1. استخدم **HTTPS** في production (مش HTTP) عشان مايتحولش POST لـ GET.
2. **Login** دايماً **POST** مش GET.
3. انسخ الـ `token` من الرد وحطه: `Authorization: Bearer <token>`.

---

## متغيرات البيئة (مرجع)

| Variable | الاستخدام |
|----------|-----------|
| MONGODB_URI | Atlas |
| JWT_SECRET | التوكنات |
| GOOGLE_CLIENT_ID | Google Sign-In |
| SMTP_* | OTP إيميل |
| TWILIO_* | OTP SMS |
