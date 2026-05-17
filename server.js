import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DATA_PATH = path.join(__dirname, 'data', 'users.json');

app.use(express.json());

// Ensure data directory and file exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify([]));
}

// Temporary storage for OTPs
const pendingUsers = new Map();

// Register Endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  const users = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingUsers.set(email, { email, password, name, otp });

  console.log(`[OTP] Gửi mã ${otp} tới email ${email}`);
  
  // Trả về OTP trong response cho mục đích demo (trong thực tế sẽ gửi qua email)
  res.json({ message: 'OTP đã được gửi', email, demoOtp: otp });
});

// Verify OTP Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const pending = pendingUsers.get(email);

  if (!pending || pending.otp !== otp) {
    return res.status(400).json({ message: 'Mã OTP không chính xác' });
  }

  const users = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  users.push({
    id: Date.now().toString(),
    email: pending.email,
    password: pending.password,
    name: pending.name,
    phone: pending.phone,
    role: 'user',
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2));
  pendingUsers.delete(email);

  console.log(`[AUTH] Người dùng mới đã kích hoạt: ${pending.email}`);
  res.json({ message: 'Đăng ký thành công' });
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Thử đăng nhập: ${email}`);
  
  const users = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    console.log(`[AUTH] Đăng nhập thất bại: ${email}`);
    return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
  }

  console.log(`[AUTH] Đăng nhập thành công: ${email} (Role: ${user.role})`);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Đăng nhập thành công', user: userWithoutPassword });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
