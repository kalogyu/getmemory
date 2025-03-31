import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 注册新用户
export async function POST(request: NextRequest) {
  try {
    const { username, phone, password, code } = await request.json();

    // 验证必填字段
    if (!username || !phone || !password || !code) {
      return NextResponse.json({ success: false, message: '所有字段都必须填写' }, { status: 400 });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: '无效的手机号码' }, { status: 400 });
    }

    // 验证验证码
    const verificationCodes = global.verificationCodes || {};
    const storedCode = verificationCodes[phone];
    if (!storedCode || storedCode.code !== code || new Date() > storedCode.expireTime) {
      return NextResponse.json({ success: false, message: '验证码无效或已过期' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // 检查用户名和手机号是否已存在
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ? OR phone = ?',
        [username, phone]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json({ success: false, message: '用户名或手机号已存在' }, { status: 409 });
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 插入新用户
      const [result] = await connection.execute(
        'INSERT INTO users (username, phone, password) VALUES (?, ?, ?)',
        [username, phone, hashedPassword]
      );

      // 删除已使用的验证码
      delete verificationCodes[phone];

      return NextResponse.json({
        success: true,
        message: '注册成功',
        user: { username, phone }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json({ success: false, message: '注册失败' }, { status: 500 });
  }
}