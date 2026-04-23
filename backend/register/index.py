import json
import os
import hashlib
import psycopg2


def handler(event: dict, context) -> dict:
    """Регистрация нового игрока в казино"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    email = body.get('email', '').strip().lower()
    user_password = body.get('password', '')

    if not name or not email or not user_password:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните все поля'})
        }

    password_hash = hashlib.sha256(user_password.encode()).hexdigest()

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT id FROM players WHERE email = '%s'" % email.replace("'", "''"))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 409,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Этот email уже зарегистрирован'})
        }

    cur.execute(
        "INSERT INTO players (name, email, password_hash) VALUES ('%s', '%s', '%s') RETURNING id" % (
            name.replace("'", "''"),
            email.replace("'", "''"),
            password_hash
        )
    )
    player_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'player_id': player_id, 'name': name})
    }
