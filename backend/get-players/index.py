import json
import os
import psycopg2


ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'casino2024')


def handler(event: dict, context) -> dict:
    """Получение списка всех зарегистрированных игроков для админки"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = event.get('headers') or {}
    pwd = headers.get('X-Admin-Password') or headers.get('x-admin-password', '')
    if pwd != ADMIN_PASSWORD:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный пароль'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, created_at FROM players ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    players = [
        {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'created_at': row[3].strftime('%d.%m.%Y %H:%M')
        }
        for row in rows
    ]

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'players': players, 'total': len(players)})
    }
