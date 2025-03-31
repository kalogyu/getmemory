from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
from mysql.connector import Error
import os
import random
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 创建Flask应用实例
app = Flask(__name__)
# 设置密钥用于session加密
app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key')

# 存储验证码的字典
verification_codes = {}

# SMS API配置
SMS_API_URL = "https://gyytz.market.alicloudapi.com/sms/smsSend"
SMS_APPCODE = os.getenv('SMS_APPCODE')
SMS_SIGN_ID = os.getenv('SMS_SIGN_ID')
SMS_TEMPLATE_ID = os.getenv('SMS_TEMPLATE_ID')

# MySQL配置
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD')
}

def get_db_connection():
    try:
        # 首先创建数据库连接（不指定数据库）
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        # 创建数据库（如果不存在）
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {os.getenv('MYSQL_DATABASE')}")
        cursor.close()
        
        # 关闭连接
        conn.close()
        
        # 重新连接并指定数据库
        config_with_db = MYSQL_CONFIG.copy()
        config_with_db['database'] = os.getenv('MYSQL_DATABASE')
        conn = mysql.connector.connect(**config_with_db)
        return conn
    except Error as e:
        print(f"数据库连接错误: {e}")
        return None

# 数据库初始化函数
def init_db():
    try:
        conn = get_db_connection()
        if conn is None:
            return
        
        cursor = conn.cursor()
        
        # 创建用户表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建群组表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS `groups` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        ''')
        
        # 创建群组成员表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS group_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                user_id INT NOT NULL,
                role ENUM('admin', 'member') DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES `groups`(id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE KEY unique_group_member (group_id, user_id)
            )
        ''')
        
        # 创建群组消息表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS group_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES `groups`(id),
                FOREIGN KEY (sender_id) REFERENCES users(id)
            )
        ''')
        
        # 创建评论表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # 创建私聊消息表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )
        ''')
        
        # 创建索引
        try:
            cursor.execute('CREATE INDEX idx_username ON users(username)')
            cursor.execute('CREATE INDEX idx_phone ON users(phone)')
            cursor.execute('CREATE INDEX idx_messages_sender ON messages(sender_id)')
            cursor.execute('CREATE INDEX idx_messages_receiver ON messages(receiver_id)')
            cursor.execute('CREATE INDEX idx_group_messages_group ON group_messages(group_id)')
            cursor.execute('CREATE INDEX idx_group_messages_sender ON group_messages(sender_id)')
            cursor.execute('CREATE INDEX idx_group_members_group ON group_members(group_id)')
            cursor.execute('CREATE INDEX idx_group_members_user ON group_members(user_id)')
            cursor.execute('CREATE INDEX idx_comments_user ON comments(user_id)')
        except Error as e:
            # 如果索引已存在，忽略错误
            pass
        
        conn.commit()
        cursor.close()
        conn.close()
        
    except Error as e:
        print(f"数据库初始化错误: {e}")

# 根路由
@app.route('/')
def index():
    return redirect(url_for('login'))

# 发送验证码
def send_verification_code(phone):
    try:
        # 生成验证码
        code = str(random.randint(100000, 999999))
        
        # 准备请求参数
        data = {
            "mobile": phone,
            "smsSignId": SMS_SIGN_ID,
            "templateId": SMS_TEMPLATE_ID,
            "param": f"**code**:{code},**minute**:5"
        }
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "APPCODE " + SMS_APPCODE
        }
        
        # 发送短信
        response = requests.post(SMS_API_URL, headers=headers, params=data)
        
        if response.status_code == 200:
            # 存储验证码
            verification_codes[phone] = {
                'code': code,
                'expire_time': datetime.now() + timedelta(minutes=5),
                'last_send_time': datetime.now()
            }
            return True
        else:
            print(f"发送短信失败: {response.text}")
            return False
            
    except Exception as e:
        print(f"发送短信失败: {str(e)}")
        return False

# 登录页面
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        login_type = request.form.get('login_type', 'password')
        
        if login_type == 'password':
            username = request.form.get('username')
            password = request.form.get('password')
            
            conn = get_db_connection()
            if conn is None:
                flash('数据库连接错误', 'error')
                return redirect(url_for('login'))
                
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
            user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if user and check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                session['username'] = user['username']
                return redirect(url_for('dashboard'))
            else:
                flash('用户名或密码错误', 'error')
        else:
            phone = request.form.get('phone')
            code = request.form.get('code')
            
            if phone in verification_codes:
                stored_code = verification_codes[phone]
                if datetime.now() <= stored_code['expire_time'] and code == stored_code['code']:
                    conn = get_db_connection()
                    if conn is None:
                        flash('数据库连接错误', 'error')
                        return redirect(url_for('login'))
                        
                    cursor = conn.cursor(dictionary=True)
                    cursor.execute('SELECT * FROM users WHERE phone = %s', (phone,))
                    user = cursor.fetchone()
                    cursor.close()
                    conn.close()
                    
                    if user:
                        session['user_id'] = user['id']
                        session['username'] = user['username']
                        return redirect(url_for('dashboard'))
                    else:
                        flash('手机号未注册', 'error')
                else:
                    flash('验证码错误或已过期', 'error')
            else:
                flash('请先获取验证码', 'error')
    
    return render_template('login.html')

# 发送验证码接口
@app.route('/send_code', methods=['POST'])
def send_code():
    phone = request.form.get('phone')
    if not phone:
        return jsonify({'success': False, 'message': '手机号不能为空'})
    
    # 检查手机号是否已注册
    conn = get_db_connection()
    if conn is None:
        return jsonify({'success': False, 'message': '数据库连接错误'})
        
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE phone = %s', (phone,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({'success': False, 'message': '手机号未注册'})
    
    # 检查是否频繁发送
    if phone in verification_codes:
        last_send_time = verification_codes[phone].get('last_send_time')
        if last_send_time and datetime.now() - last_send_time < timedelta(minutes=1):
            return jsonify({'success': False, 'message': '请稍后再试'})
    
    if send_verification_code(phone):
        return jsonify({'success': True, 'message': '验证码已发送'})
    else:
        return jsonify({'success': False, 'message': '发送失败，请稍后重试'})

# 注册页面
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        phone = request.form.get('phone')
        
        if not all([username, password, phone]):
            flash('所有字段都必须填写', 'error')
            return redirect(url_for('register'))
        
        conn = get_db_connection()
        if conn is None:
            flash('数据库连接错误', 'error')
            return redirect(url_for('register'))
            
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO users (username, password, phone) VALUES (%s, %s, %s)',
                         (username, generate_password_hash(password), phone))
            conn.commit()
            flash('注册成功，请登录', 'success')
            return redirect(url_for('login'))
        except mysql.connector.IntegrityError:
            flash('用户名或手机号已存在', 'error')
        finally:
            cursor.close()
            conn.close()
    
    return render_template('register.html')

# 仪表板页面
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session['username'])

# 退出登录
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# 用户列表页面
@app.route('/users')
def user_list():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('dashboard'))
        
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, username FROM users WHERE id != %s', (session['user_id'],))
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return render_template('users.html', users=users)

# 聊天页面
@app.route('/chat/<int:user_id>')
def chat(user_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('dashboard'))
        
    cursor = conn.cursor(dictionary=True)
    # 获取聊天对象信息
    cursor.execute('SELECT id, username FROM users WHERE id = %s', (user_id,))
    chat_user = cursor.fetchone()
    
    if not chat_user:
        flash('用户不存在', 'error')
        return redirect(url_for('user_list'))
    
    # 获取历史消息
    cursor.execute('''
        SELECT m.*, u.username as sender_name 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE (m.sender_id = %s AND m.receiver_id = %s)
        OR (m.sender_id = %s AND m.receiver_id = %s)
        ORDER BY m.created_at ASC
    ''', (session['user_id'], user_id, user_id, session['user_id']))
    messages = cursor.fetchall()
    
    # 标记消息为已读
    cursor.execute('''
        UPDATE messages 
        SET is_read = TRUE 
        WHERE receiver_id = %s AND sender_id = %s AND is_read = FALSE
    ''', (session['user_id'], user_id))
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return render_template('chat.html', chat_user=chat_user, messages=messages)

# 发送消息接口
@app.route('/send_message', methods=['POST'])
def send_message():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '请先登录'})
        
    receiver_id = request.form.get('receiver_id')
    content = request.form.get('content')
    
    if not receiver_id or not content:
        return jsonify({'success': False, 'message': '参数错误'})
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'success': False, 'message': '数据库连接错误'})
        
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES (%s, %s, %s)
        ''', (session['user_id'], receiver_id, content))
        conn.commit()
        return jsonify({'success': True, 'message': '发送成功'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        cursor.close()
        conn.close()

# 获取未读消息数量
@app.route('/unread_count')
def unread_count():
    if 'user_id' not in session:
        return jsonify({'count': 0})
        
    conn = get_db_connection()
    if conn is None:
        return jsonify({'count': 0})
        
    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE receiver_id = %s AND is_read = FALSE
    ''', (session['user_id'],))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return jsonify({'count': result['count']})

# 群组列表页面
@app.route('/groups')
def group_list():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('dashboard'))
        
    cursor = conn.cursor(dictionary=True)
    # 获取用户所在的群组
    cursor.execute('''
        SELECT g.*, gm.role 
        FROM `groups` g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = %s
    ''', (session['user_id'],))
    my_groups = cursor.fetchall()
    
    # 获取其他可加入的群组
    cursor.execute('''
        SELECT g.* 
        FROM `groups` g
        WHERE g.id NOT IN (
            SELECT group_id 
            FROM group_members 
            WHERE user_id = %s
        )
    ''', (session['user_id'],))
    other_groups = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('groups.html', my_groups=my_groups, other_groups=other_groups)

# 创建群组
@app.route('/create_group', methods=['POST'])
def create_group():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '请先登录'})
        
    name = request.form.get('name')
    description = request.form.get('description')
    
    if not name:
        return jsonify({'success': False, 'message': '群组名称不能为空'})
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'success': False, 'message': '数据库连接错误'})
        
    cursor = conn.cursor()
    try:
        # 创建群组
        cursor.execute('''
            INSERT INTO `groups` (name, description, created_by)
            VALUES (%s, %s, %s)
        ''', (name, description, session['user_id']))
        group_id = cursor.lastrowid
        
        # 添加创建者为管理员
        cursor.execute('''
            INSERT INTO group_members (group_id, user_id, role)
            VALUES (%s, %s, 'admin')
        ''', (group_id, session['user_id']))
        
        conn.commit()
        return jsonify({'success': True, 'message': '群组创建成功'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        cursor.close()
        conn.close()

# 加入群组
@app.route('/join_group/<int:group_id>')
def join_group(group_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('group_list'))
        
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO group_members (group_id, user_id)
            VALUES (%s, %s)
        ''', (group_id, session['user_id']))
        conn.commit()
        flash('成功加入群组', 'success')
    except Error as e:
        flash('加入群组失败', 'error')
    finally:
        cursor.close()
        conn.close()
    
    return redirect(url_for('group_list'))

# 群组聊天页面
@app.route('/group_chat/<int:group_id>')
def group_chat(group_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('dashboard'))
        
    cursor = conn.cursor(dictionary=True)
    
    # 检查用户是否是群组成员
    cursor.execute('''
        SELECT role FROM group_members 
        WHERE group_id = %s AND user_id = %s
    ''', (group_id, session['user_id']))
    member = cursor.fetchone()
    
    if not member:
        flash('你不是该群组成员', 'error')
        return redirect(url_for('group_list'))
    
    # 获取群组信息
    cursor.execute('''
        SELECT g.*, u.username as creator_name
        FROM `groups` g
        JOIN users u ON g.created_by = u.id
        WHERE g.id = %s
    ''', (group_id,))
    group = cursor.fetchone()
    
    # 获取群组成员
    cursor.execute('''
        SELECT u.id, u.username, gm.role, gm.joined_at
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = %s
        ORDER BY gm.joined_at ASC
    ''', (group_id,))
    members = cursor.fetchall()
    
    # 获取群组消息
    cursor.execute('''
        SELECT gm.*, u.username as sender_name
        FROM group_messages gm
        JOIN users u ON gm.sender_id = u.id
        WHERE gm.group_id = %s
        ORDER BY gm.created_at ASC
    ''', (group_id,))
    messages = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('group_chat.html', 
                         group=group, 
                         members=members, 
                         messages=messages,
                         is_admin=member['role'] == 'admin')

# 发送群组消息
@app.route('/send_group_message', methods=['POST'])
def send_group_message():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '请先登录'})
        
    group_id = request.form.get('group_id')
    content = request.form.get('content')
    
    if not group_id or not content:
        return jsonify({'success': False, 'message': '参数错误'})
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'success': False, 'message': '数据库连接错误'})
        
    cursor = conn.cursor()
    try:
        # 检查用户是否是群组成员
        cursor.execute('''
            SELECT 1 FROM group_members 
            WHERE group_id = %s AND user_id = %s
        ''', (group_id, session['user_id']))
        
        if not cursor.fetchone():
            return jsonify({'success': False, 'message': '你不是该群组成员'})
        
        # 发送消息
        cursor.execute('''
            INSERT INTO group_messages (group_id, sender_id, content)
            VALUES (%s, %s, %s)
        ''', (group_id, session['user_id'], content))
        
        conn.commit()
        return jsonify({'success': True, 'message': '发送成功'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        cursor.close()
        conn.close()

# 管理群组成员
@app.route('/manage_group/<int:group_id>', methods=['GET', 'POST'])
def manage_group(group_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('group_list'))
        
    cursor = conn.cursor(dictionary=True)
    
    # 检查用户是否是群组管理员
    cursor.execute('''
        SELECT role FROM group_members 
        WHERE group_id = %s AND user_id = %s
    ''', (group_id, session['user_id']))
    member = cursor.fetchone()
    
    if not member or member['role'] != 'admin':
        flash('你没有权限管理该群组', 'error')
        return redirect(url_for('group_list'))
    
    if request.method == 'POST':
        action = request.form.get('action')
        user_id = request.form.get('user_id')
        
        if action == 'remove':
            cursor.execute('''
                DELETE FROM group_members 
                WHERE group_id = %s AND user_id = %s
            ''', (group_id, user_id))
            flash('成员已移除', 'success')
        elif action == 'promote':
            cursor.execute('''
                UPDATE group_members 
                SET role = 'admin' 
                WHERE group_id = %s AND user_id = %s
            ''', (group_id, user_id))
            flash('成员已提升为管理员', 'success')
        elif action == 'demote':
            cursor.execute('''
                UPDATE group_members 
                SET role = 'member' 
                WHERE group_id = %s AND user_id = %s
            ''', (group_id, user_id))
            flash('成员已降级为普通成员', 'success')
        
        conn.commit()
        return redirect(url_for('manage_group', group_id=group_id))
    
    # 获取群组信息
    cursor.execute('''
        SELECT g.*, u.username as creator_name
        FROM `groups` g
        JOIN users u ON g.created_by = u.id
        WHERE g.id = %s
    ''', (group_id,))
    group = cursor.fetchone()
    
    # 获取群组成员
    cursor.execute('''
        SELECT u.id, u.username, gm.role, gm.joined_at
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = %s
        ORDER BY gm.joined_at ASC
    ''', (group_id,))
    members = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('manage_group.html', group=group, members=members)

# 评论区页面
@app.route('/comments')
def comment_list():
    if 'user_id' not in session:
        return redirect(url_for('login'))
        
    conn = get_db_connection()
    if conn is None:
        flash('数据库连接错误', 'error')
        return redirect(url_for('dashboard'))
        
    cursor = conn.cursor(dictionary=True)
    # 获取所有评论，包括评论者信息
    cursor.execute('''
        SELECT c.*, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
    ''')
    comments = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return render_template('comments.html', comments=comments)

# 发表评论
@app.route('/add_comment', methods=['POST'])
def add_comment():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '请先登录'})
        
    content = request.form.get('content')
    if not content:
        return jsonify({'success': False, 'message': '评论内容不能为空'})
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({'success': False, 'message': '数据库连接错误'})
        
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO comments (user_id, content)
            VALUES (%s, %s)
        ''', (session['user_id'], content))
        conn.commit()
        return jsonify({'success': True, 'message': '评论发表成功'})
    except Error as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True)