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

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 生成JWT token
const generateToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.SECRET_KEY || 'your_secret_key', { expiresIn: '7d' });
};

// 密码登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      // 查询用户
      const [rows] = await connection.execute(
        'SELECT id, username, password, phone FROM users WHERE username = ?',
        [username]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
      }

      const user = rows[0] as { id: number; username: string; password: string; phone: string };

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ success: false, message: '密码错误' }, { status: 401 });
      }

      // 生成token
      const token = generateToken(user.id);

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone
        },
        token
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ success: false, message: '登录失败' }, { status: 500 });
  }
}