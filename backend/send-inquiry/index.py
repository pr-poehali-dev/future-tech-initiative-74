import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_USER = 'artemij.kosin@gmail.com'
RECIPIENT = 'artemij.kosin@gmail.com'


def handler(event: dict, context) -> dict:
    """Отправка заявки с лендинга казино на email администратора"""
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
    email = body.get('email', '').strip()
    message = body.get('message', '').strip()

    if not name or not email:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заполните обязательные поля'})
        }

    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'Новая заявка от {name} — Royal Casino'
    msg['From'] = SMTP_USER
    msg['To'] = RECIPIENT

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px;">
      <h2 style="color: #facc15; margin-bottom: 24px;">🎰 Новая заявка — Royal Casino</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #222;">
          <td style="padding: 12px 0; color: #888; width: 120px;">Имя</td>
          <td style="padding: 12px 0; font-weight: bold;">{name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #222;">
          <td style="padding: 12px 0; color: #888;">Email</td>
          <td style="padding: 12px 0;"><a href="mailto:{email}" style="color: #facc15;">{email}</a></td>
        </tr>
        {"" if not message else f'<tr><td style="padding: 12px 0; color: #888; vertical-align: top;">Сообщение</td><td style="padding: 12px 0;">{message}</td></tr>'}
      </table>
    </div>
    """

    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(SMTP_USER, smtp_password)
        server.sendmail(SMTP_USER, RECIPIENT, msg.as_string())

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True})
    }
