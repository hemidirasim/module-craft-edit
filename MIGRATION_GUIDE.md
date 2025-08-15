# Migration Guide: Supabase to Vercel + Remote Database

Bu sənəd sistemin Supabase-dən Vercel və remote database-ə miqrasiya etməsi üçün addım-addım təlimatları təqdim edir.

## 🎯 Miqrasiya Məqsədi

- Supabase auth sistemini JWT-based auth ilə əvəz etmək
- Supabase storage-ni Vercel Blob ilə əvəz etmək
- Remote PostgreSQL database istifadə etmək
- Vercel platformunda deploy etmək

## 📋 Tələb olunan Dəyişikliklər

### 1. Database Schema
- Mövcud Prisma schema saxlanılır
- Yeni auth sistemi üçün əlavə cədvəllər yoxdur
- Demo sistemi saxlanılır

### 2. Authentication
- Supabase auth → JWT-based auth
- `@supabase/supabase-js` → `jsonwebtoken` + `bcryptjs`
- Session management localStorage ilə

### 3. File Storage
- Supabase Storage → Vercel Blob
- `@supabase/supabase-js` → `@vercel/blob`
- Public URL-lər avtomatik yaradılır

### 4. API Endpoints
- Yeni auth endpoints: `/api/auth/*`
- Yeni file endpoints: `/api/upload-file`, `/api/files/*`
- Yeni folder endpoints: `/api/folders/*`

## 🚀 Quraşdırma Addımları

### 1. Environment Variables

`.env` faylını yaradın:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Vercel Configuration
VERCEL_URL="https://your-app.vercel.app"
VERCEL_BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Authentication (JWT)
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-app.vercel.app"
```

### 2. Database Setup

```bash
# Database-i quraşdır
npm run db:setup

# Və ya sıfırla və yenidən quraşdır
npm run db:reset
```

### 3. Dependencies Install

```bash
npm install
```

### 4. Local Development

```bash
npm run dev
```

## 🔧 Yeni API Endpoints

### Authentication
- `POST /api/auth/signup` - Yeni istifadəçi yaratmaq
- `POST /api/auth/signin` - Giriş etmək
- `POST /api/auth/demo` - Demo istifadəçi yaratmaq
- `GET /api/auth/verify` - Token yoxlamaq

### Files
- `GET /api/files` - Faylları siyahılamaq
- `POST /api/upload-file` - Fayl yükləmək
- `DELETE /api/files/[fileId]` - Fayl silmək

### Folders
- `POST /api/folders` - Qovluq yaratmaq
- `DELETE /api/folders/[folderId]` - Qovluq silmək

## 📁 Yeni File Structure

```
src/
├── lib/
│   ├── auth.ts          # JWT-based auth service
│   └── prisma.ts        # Database client
├── hooks/
│   ├── useAuth.tsx      # Auth hook (updated)
│   └── useFileManager.tsx # File manager hook (updated)
└── components/
    └── auth/
        ├── LoginForm.tsx  # Updated for new auth
        └── SignupForm.tsx # Updated for new auth

api/
├── auth/
│   ├── signup.ts
│   ├── signin.ts
│   ├── demo.ts
│   └── verify.ts
├── files/
│   ├── index.ts
│   └── [fileId].ts
├── folders/
│   ├── index.ts
│   └── [folderId].ts
└── upload-file.ts
```

## 🔄 Miqrasiya Prosesi

### 1. Data Migration
Mövcud Supabase məlumatlarını yeni database-ə köçürmək:

```bash
# Supabase-dən məlumatları export et
npx supabase db dump --data-only > supabase_backup.sql

# Yeni database-ə import et
psql $DATABASE_URL < supabase_backup.sql
```

### 2. File Migration
Supabase Storage-dən Vercel Blob-a faylları köçürmək:

```bash
# Migration script işlə
node scripts/migrate-storage-to-vercel.js
```

### 3. Environment Update
Production environment variables-i yenilə:

```bash
# Vercel-də environment variables təyin et
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add VERCEL_BLOB_READ_WRITE_TOKEN
```

## 🧪 Test

### 1. Local Testing
```bash
# Test user ilə giriş et
Email: test@example.com
Password: test123

# Demo rejimini test et
Demo user avtomatik yaradılır
```

### 2. API Testing
```bash
# Auth test
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# File upload test
curl -X POST http://localhost:3000/api/upload-file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg"
```

## 🚀 Deployment

### 1. Vercel Deployment
```bash
# Vercel CLI ilə deploy et
vercel --prod

# Və ya GitHub-dan avtomatik deploy
git push origin main
```

### 2. Environment Variables
Vercel dashboard-da environment variables təyin et:
- `DATABASE_URL`
- `JWT_SECRET`
- `VERCEL_BLOB_READ_WRITE_TOKEN`

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Database URL-i yoxla
   echo $DATABASE_URL
   
   # Connection test et
   npm run db:studio
   ```

2. **JWT Token Error**
   ```bash
   # JWT_SECRET təyin et
   export JWT_SECRET="your-secret-key"
   ```

3. **File Upload Error**
   ```bash
   # Vercel Blob token yoxla
   echo $VERCEL_BLOB_READ_WRITE_TOKEN
   ```

### Debug Commands
```bash
# Database status
npm run db:studio

# Prisma client generate
npx prisma generate

# Database reset
npm run db:reset
```

## 📊 Performance Improvements

### 1. Database Optimization
- Indexes avtomatik yaradılır
- Connection pooling istifadə edilir
- Query optimization

### 2. File Storage
- Vercel Blob CDN istifadə edir
- Automatic caching
- Global distribution

### 3. Authentication
- JWT tokens localStorage-də saxlanılır
- Automatic token refresh
- Secure password hashing

## 🔒 Security Considerations

### 1. JWT Security
- Strong secret key istifadə et
- Token expiration təyin et
- HTTPS istifadə et

### 2. Database Security
- SSL connection istifadə et
- Strong passwords
- Regular backups

### 3. File Security
- User-based access control
- File type validation
- Size limits

## 📈 Monitoring

### 1. Vercel Analytics
- Performance metrics
- Error tracking
- User analytics

### 2. Database Monitoring
- Query performance
- Connection pool status
- Error logs

### 3. File Storage Monitoring
- Upload/download metrics
- Storage usage
- CDN performance

## 🎉 Migration Complete!

Sistem uğurla Supabase-dən Vercel və remote database-ə miqrasiya edildi. 

### Next Steps:
1. Production environment variables təyin et
2. Domain və SSL quraşdır
3. Monitoring və analytics quraşdır
4. Backup strategy təyin et

### Support:
Əgər problemlər yaranırsa:
1. Logs yoxla
2. Environment variables yoxla
3. Database connection test et
4. API endpoints test et
