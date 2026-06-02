# Delivery App API

TypeScript + Express + MongoDB — تطبيق توصيل (Client · Delivery · Admin).

## مشكلة `querySrv ECONNREFUSED` عند seed أو dev

الجهاز مش قادر يحل DNS لـ `mongodb+srv://`. جرّب بالترتيب:

1. `ipconfig /flushdns` ثم أعد `npm run seed:admin`
2. غيّر DNS لـ **8.8.8.8** (Google) أو **1.1.1.1**
3. من Atlas → **Connect** → **Drivers** → انسخ **Standard connection string** (`mongodb://` بدون `srv`) وضعه في `MONGODB_URI`
4. أوقف VPN أو جرّب شبكة تانية (هوتسبوت الموبايل)

---

## تشغيل سريع

```bash
npm install
cp .env.example .env
# عدّل MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, SMTP, Twilio
npm run seed:admin
npm run dev
```

## التوثيق الكامل للـ API

**كل الـ endpoints — Request / Response:**  
→ **[docs/API.md](./docs/API.md)**

يشمل:
- Admin (دخول تليفون، forgot/reset OTP)
- Client (تسجيل email/phone/google، verify OTP)
- Delivery (تسجيل، طلبات)
- Orders لكل دور
- أكواد الأخطاء وأمثلة Postman

## Railway

| Variable | مطلوب |
|----------|--------|
| `MONGODB_URI` | ✅ |
| `JWT_SECRET` | ✅ |
| `NODE_ENV` | `production` |

Networking → **Target Port** = نفس `PORT` في اللوج (مثلاً `8080`).

## هيكل المشروع

```
src/
├── config/
├── controllers/   client | delivery | admin
├── models/
├── routes/
├── services/
├── middleware/
└── validators/
docs/API.md        ← التوثيق
```
