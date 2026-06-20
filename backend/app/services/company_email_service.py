import smtplib
from email.message import EmailMessage


def send_email(
    smtp_host: str,
    smtp_port: int,
    smtp_username: str | None,
    smtp_password: str | None,
    from_email: str,
    from_name: str | None,
    to_email: str,
    subject: str,
    html_body: str | None,
    text_body: str | None,
    use_tls: bool,
    use_ssl: bool,
):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>" if from_name else from_email
    msg["To"] = to_email

    if text_body:
        msg.set_content(text_body)
    else:
        msg.set_content("Este correo requiere un cliente compatible con HTML.")

    if html_body:
        msg.add_alternative(html_body, subtype="html")

    if use_ssl:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=20)

    try:
        server.ehlo()

        if use_tls and not use_ssl:
            server.starttls()
            server.ehlo()

        if smtp_username and smtp_password:
            server.login(smtp_username, smtp_password)

        server.send_message(msg)
    finally:
        server.quit()


def send_test_email(
    smtp_host: str,
    smtp_port: int,
    smtp_username: str | None,
    smtp_password: str | None,
    from_email: str,
    from_name: str | None,
    to_email: str,
    use_tls: bool,
    use_ssl: bool,
):
    send_email(
        smtp_host=smtp_host,
        smtp_port=smtp_port,
        smtp_username=smtp_username,
        smtp_password=smtp_password,
        from_email=from_email,
        from_name=from_name,
        to_email=to_email,
        subject="Correo de prueba - Event Staffing",
        html_body="<p>Esta es una prueba de configuración SMTP enviada desde Event Staffing.</p>",
        text_body="Esta es una prueba de configuración SMTP enviada desde Event Staffing.",
        use_tls=use_tls,
        use_ssl=use_ssl,
    )