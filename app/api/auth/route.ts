import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 数据库连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

// 验证码存储
const verificationCodes: { [key: string]: { code: string; expireTime: Date } } = {};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 生成JWT token
const generateToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY || 'your_secret_key', { expiresIn: '7d' });
};

// 发送验证码
export async function POST(request: NextRequest) {
  try {
    const { phone, action } = await request.json();

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: '无效的手机号码' }, { status: 400 });
    }

    // 检查是否频繁发送
    if (verificationCodes[phone] && 
        new Date().getTime() - verificationCodes[phone].expireTime.getTime() < -4.5 * 60 * 1000) {
      return NextResponse.json({ success: false, message: '请稍后再试' }, { status: 429 });
    }

    // 生成验证码
    const code = Math.random().toString().slice(2, 8);
    const expireTime = new Date(new Date().getTime() + 5 * 60 * 1000);

    // 存储验证码
    verificationCodes[phone] = { code, expireTime };

    // 调用短信API发送验证码
    const response = await fetch('https://gyytz.market.alicloudapi.com/sms/smsSend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `APPCODE ${process.env.SMS_APPCODE}`
      },
      body: new URLSearchParams({
        'mobile': phone,
        'smsSignId': process.env.SMS_SIGN_ID || '',
        'templateId': process.env.SMS_TEMPLATE_ID || '',
        'param': `**code**:${code},**minute**:5`
      })
    });

    if (!response.ok) {
      throw new Error('短信发送失败');
    }

    return NextResponse.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码错误:', error);
    return NextResponse.json({ success: false, message: '发送验证码失败' }, { status: 500 });
  }
}

// 验证码登录
export async function PUT(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: '无效的手机号码' }, { status: 400 });
    }

    // 验证验证码
    const storedCode = verificationCodes[phone];
    if (!storedCode || storedCode.code !== code || new Date() > storedCode.expireTime) {
      return NextResponse.json({ success: false, message: '验证码无效或已过期' }, { status: 400 });
    }

    // 查询用户
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, username, phone FROM users WHERE phone = ?',
        [phone]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0] as { id: number; username: string; phone: string };
        const token = generateToken(user.id);

        // 删除已使用的验证码
        delete verificationCodes[phone];

        return NextResponse.json({
          success: true,
          user: { id: user.id, username: user.username, phone: user.phone },
          token
        });
      } else {
        return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('验证码登录错误:', error);
    return NextResponse.json({ success: false, message: '登录失败' }, { status: 500 });
  }
}