# Supabase to PostgreSQL Migration Guide

Bu sənəd Supabase-dən remote PostgreSQL verilənlər bazasına məlumatların köçürülməsi üçün təlimatları təsvir edir.

## 📋 Tələblər

- Node.js və npm quraşdırılmış olmalıdır
- Remote PostgreSQL verilənlər bazasına qoşulma imkanı
- Supabase API açarı
- Prisma CLI quraşdırılmış olmalıdır

## 🔧 Quraşdırma

1. **Asılılıqları quraşdırın:**
```bash
npm install @prisma/client @supabase/supabase-js pg
```

2. **Environment dəyişənlərini təyin edin:**
```bash
cp env.example .env
```

`.env` faylında `DATABASE_URL`-i remote PostgreSQL verilənlər bazası üçün yeniləyin:
```
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

3. **Prisma şemasını sinxronizasiya edin:**
```bash
npx prisma generate
npx prisma db push
```

## 🚀 Miqrasiya Prosesi

### 1. Backup Yaratma (Məcburi)

Miqrasiyadan əvvəl Supabase-dəki məlumatların backup-ını yaradın:

```bash
node scripts/backup-supabase-data.cjs
```

Bu əməliyyat `backups/` qovluğunda JSON faylları yaradacaq.

### 2. Miqrasiya İcra Etmə

Supabase-dən PostgreSQL-ə məlumatları köçürün:

```bash
node scripts/supabase-to-postgres-migration.cjs
```

Bu skript:
- Mövcud məlumatları remote PostgreSQL-dən alacaq
- Supabase-dən məlumatları çəkəcək
- Mövcud məlumatları yeniləyəcək, yeni məlumatları əlavə edəcək
- Detallı statistikalar göstərəcək

### 3. Miqrasiyanı Yoxlama

Miqrasiyadan sonra məlumatların düzgün köçürüldüyünü yoxlayın:

```bash
node scripts/verify-migration.cjs
```

Bu skript:
- Supabase və PostgreSQL arasında məlumatları müqayisə edəcək
- Çatışmayan və ya fərqli məlumatları göstərəcək
- Ümumi hesabat təqdim edəcək

## 📊 Skriptlər

### `backup-supabase-data.cjs`
- Supabase-dəki bütün məlumatları JSON fayllarına yazır
- `backups/` qovluğunda timestamp ilə fayllar yaradır
- Backup summary faylı yaradır

### `supabase-to-postgres-migration.cjs`
- Mövcud məlumatları remote PostgreSQL-dən alır
- Supabase-dən məlumatları çəkir
- Mövcud məlumatları yeniləyir, yeni məlumatları əlavə edir
- Detallı statistikalar və hesabatlar təqdim edir

### `verify-migration.cjs`
- Supabase və PostgreSQL arasında məlumatları müqayisə edir
- Çatışmayan, əlavə və fərqli məlumatları tapır
- Detallı hesabat təqdim edir

## ⚠️ Diqqət

1. **Backup məcburidir** - Miqrasiyadan əvvəl həmişə backup yaradın
2. **Test mühitində sınayın** - Əvvəlcə test mühitində sınayın
3. **Məlumatları yoxlayın** - Miqrasiyadan sonra məlumatları yoxlayın
4. **Xətaları izləyin** - Skriptlər xətaları göstərəcək, onları həll edin

## 🔍 Xətaların Həlli

### Bağlantı Xətaları
- `DATABASE_URL`-i yoxlayın
- Şəbəkə bağlantısını yoxlayın
- SSL parametrlərini yoxlayın

### Məlumat Xətaları
- Prisma şemasını yeniləyin: `npx prisma generate`
- Verilənlər bazası şemasını yeniləyin: `npx prisma db push`
- Backup fayllarını yoxlayın

### Yetki Xətaları
- Supabase API açarını yoxlayın
- PostgreSQL istifadəçi səlahiyyətlərini yoxlayın

## 📞 Dəstək

Əgər problemlər yaranırsa:
1. Backup fayllarını yoxlayın
2. Xəta mesajlarını diqqətlə oxuyun
3. Log fayllarını yoxlayın
4. Test mühitində sınayın

## 📝 Qeydlər

- Miqrasiya prosesi məlumatların həcminə görə vaxt ala bilər
- Böyük məlumat həcmləri üçün batch processing istifadə edin
- Miqrasiya zamanı sistemdə başqa əməliyyatlar etməyin
- Miqrasiyadan sonra tətbiqi test edin
