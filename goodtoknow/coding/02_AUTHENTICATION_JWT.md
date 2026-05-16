# 02 — Authentication JWT
> Mengamankan aplikasi dengan sistem registrasi dan login berbasis token.

Sipendora menggunakan **JSON Web Token (JWT)** untuk mengelola sesi user tanpa perlu menyimpan sesi di server (stateless).

---

## 1. Instalasi Library
```bash
npm install bcryptjs jsonwebtoken
```

---

## 2. Hashing Password (Registrasi)
Jangan pernah menyimpan password dalam bentuk teks biasa. Gunakan `bcryptjs`.

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
// Simpan hashedPassword ke database
```

---

## 3. Menghasilkan Token (Login)
Saat user berhasil login, server memberikan token yang berisi ID dan Role user.

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
);
```

---

## 4. Middleware Auth (`middleware/auth.js`)
Middleware ini bertugas memeriksa apakah request dari user menyertakan token yang valid.

```javascript
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};
```

---

## 💡 Tips Coding
- Simpan `JWT_SECRET` yang sangat panjang dan acak di `.env`.
- Pisahkan logika register dan login ke dalam `authController.js` agar file route tidak penuh.

---

**Langkah Selanjutnya:**
[03 — Algoritma FCFS Engine](./03_ALGORITMA_FCFS_ENGINE.md)
