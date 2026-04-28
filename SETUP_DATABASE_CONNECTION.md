# Setup Koneksi App ke Backend PostgreSQL

## ✅ Checklist Sebelum Mulai

- [ ] PostgreSQL sudah terinstal
- [ ] Backend folder sudah dibuat (POSAppBackend)
- [ ] Database `pos_app` sudah dibuat di DBeaver
- [ ] `setup_database.sql` sudah dijalankan

## 🚀 Step-by-Step

### Step 1: Jalankan Backend Server

```bash
# Di terminal baru, masuk ke folder backend
cd ../POSAppBackend

# Set password PostgreSQL di .env
# DB_PASSWORD=your_password

# Jalankan server
npm start
```

Jika berhasil, output:
```
🚀 Server running on http://localhost:3000
📊 Database: pos_app
🔌 Database Host: localhost:5432
```

### Step 2: Update API URL di App (Sesuai Device)

Edit file `src/services/apiService.ts` dan ubah `API_BASE_URL`:

**Untuk iOS Simulator:**
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

**Untuk Android Emulator:**
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**Untuk Device Fisik (iPhone/Android):**
1. Cari IP komputer:
   ```bash
   # macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Output contoh: inet 192.168.1.10
   ```

2. Ganti di `apiService.ts`:
   ```typescript
   const API_BASE_URL = 'http://192.168.1.10:3000/api';
   ```

### Step 3: Jalankan App

```bash
# Di terminal terpisah, masuk ke folder app
cd POSApp

# Jalankan app
npm start

# Pilih platform:
# i untuk iOS
# a untuk Android
```

### Step 4: Fetch Data dari API

Saat app load, data akan otomatis diambil dari API. 

**Contoh: Di screen yang pakai products/categories:**

```typescript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';

export function ProductsScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // ... rest of component
}
```

## 📱 Testing Koneksi

### Via Curl (Dari Terminal)
```bash
# Cek health check
curl http://localhost:3000/api/health

# Ambil semua produk
curl http://localhost:3000/api/products
```

### Via Browser
Buka: `http://localhost:3000/api/health`

Jika berhasil, muncul:
```json
{"status":"Server running"}
```

## 🔴 Troubleshooting

### "Network Error" di App
- ✅ Pastikan backend server sudah running (`npm start`)
- ✅ Pastikan API_BASE_URL di `apiService.ts` benar sesuai device
- ✅ Pastikan device/emulator bisa akses IP backend

### "connect ECONNREFUSED" di Backend
- ✅ PostgreSQL belum running
- ✅ Username/password `.env` salah
- ✅ Database `pos_app` belum dibuat

### Data tidak muncul di App
- ✅ Jalankan `setup_database.sql` di DBeaver
- ✅ Cek Network tab di React Native Debugger
- ✅ Cek console log di backend untuk error

## 📂 File Structure Sekarang

```
Documents/
├── POSApp/                    # React Native App
│   ├── src/
│   │   ├── services/
│   │   │   └── apiService.ts  # ← Update API_BASE_URL di sini
│   │   ├── store/
│   │   │   └── slices/
│   │   │       └── productSlice.ts  # ← Sudah ada async thunks
│   │   └── ...
│   └── package.json
│
└── POSAppBackend/            # Backend Server
    ├── server.js             # ← Run: npm start
    ├── .env                  # ← Isi: DB_PASSWORD
    ├── setup_database.sql    # ← Jalankan di DBeaver
    └── README.md
```

## ✨ Selesai!

Sekarang app Anda fully connected ke PostgreSQL database! 🎉

- Data otomatis fetch dari API
- Bisa CRUD products dan categories
- Real-time sync dengan database

---

**Need Help?** Cek file `POSAppBackend/README.md` untuk detail API endpoints.
