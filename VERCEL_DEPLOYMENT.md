# 🚀 Vercel Deployment Guide

Bu guide sizə proyekti Vercel-də deploy etməkdə kömək edəcək.

## 📋 Tələblər

- Vercel hesabı
- Remote PostgreSQL database
- Git repository

## 🔧 Hazırlıq

### 1. Database Setup

Remote PostgreSQL database quraşdırın və connection string-i əldə edin:

```
postgresql://username:password@host:port/database?sslmode=require
```

### 2. Environment Variables

Vercel dashboard-da aşağıdakı environment variables əlavə edin:

```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
VERCEL_URL=https://your-app.vercel.app
```

### 3. Database Migration

Database-i migrate edin:

```bash
# Prisma client generate edin
npx prisma generate

# Database schema-nı push edin
npx prisma db push

# Və ya migration yaradın
npx prisma migrate dev --name init
```

## 🚀 Deploy

### 1. Vercel CLI ilə

```bash
# Vercel CLI quraşdırın
npm i -g vercel

# Login olun
vercel login

# Deploy edin
vercel

# Production-a deploy edin
vercel --prod
```

### 2. Vercel Dashboard ilə

1. [Vercel Dashboard](https://vercel.com/dashboard)-a daxil olun
2. "New Project" klikləyin
3. Git repository-nizi seçin
4. Environment variables əlavə edin
5. "Deploy" klikləyin

## 📁 File Structure

```
├── api/                    # Vercel API routes
│   ├── upload.ts          # File upload endpoint
│   ├── upload-image.ts    # Image upload endpoint
│   ├── widget/[widgetId].ts # Widget JavaScript
│   └── demo/              # Demo endpoints
│       ├── create-session.ts
│       ├── add-file.ts
│       └── get-files.ts
├── prisma/                # Database schema
│   └── schema.prisma
├── src/
│   ├── lib/
│   │   └── prisma.ts      # Prisma client
│   ├── hooks/
│   │   └── usePrismaFileManager.tsx
│   └── utils/
│       └── prismaDemoUtils.ts
├── vercel.json            # Vercel configuration
└── package.json
```

## 🔗 API Endpoints

### File Management
- `POST /api/upload` - File upload
- `POST /api/upload-image` - Image upload
- `GET /api/files` - Get files
- `DELETE /api/files/[id]` - Delete file

### Demo System
- `POST /api/demo/create-session` - Create demo session
- `POST /api/demo/add-file` - Add demo file
- `GET /api/demo/get-files` - Get demo files

### Widget System
- `GET /api/widget/[widgetId]` - Get widget JavaScript

## 🛠️ Configuration

### Vercel Configuration (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/upload.ts": {
      "maxDuration": 30
    },
    "api/upload-image.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - `DATABASE_URL` environment variable-nı yoxlayın
   - Database-in əlçatan olduğunu yoxlayın
   - SSL mode-u düzgün təyin edildiyini yoxlayın

2. **Build Error**
   - `npm run build` local-da test edin
   - Dependencies-in düzgün quraşdırıldığını yoxlayın

3. **API Error**
   - Vercel function logs-ı yoxlayın
   - Environment variables-in düzgün təyin edildiyini yoxlayın

### Debug Commands

```bash
# Local build test
npm run build

# Prisma generate
npx prisma generate

# Database connection test
npx prisma db push

# Vercel logs
vercel logs
```

## 📊 Monitoring

Vercel dashboard-da aşağıdakıları izləyə bilərsiniz:

- Function execution times
- Error rates
- API usage
- Database connections

## 🔄 Updates

Proyekti yeniləmək üçün:

```bash
# Changes commit edin
git add .
git commit -m "Update"
git push

# Vercel avtomatik olaraq yeniləyəcək
```

## 🎯 Production Tips

1. **File Storage**: Production-da Cloudinary, AWS S3 və ya başqa file storage service istifadə edin
2. **Database**: Connection pooling konfiqurasiya edin
3. **Caching**: API responses üçün caching əlavə edin
4. **Monitoring**: Error tracking və analytics əlavə edin

## 📞 Support

Əgər problem yaşayırsınızsa:

1. Vercel logs-ı yoxlayın
2. Database connection-ı test edin
3. Environment variables-ı yoxlayın
4. Local build-i test edin
