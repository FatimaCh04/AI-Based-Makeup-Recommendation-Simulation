"""
Email Service for AI GLAM
Sends OTP verification emails via Gmail SMTP using Google App Passwords.
Optimized for high-speed delivery with direct SSL and background threading.
"""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
import threading
import os

# Default SMTP configuration with user credentials
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 465))
SMTP_EMAIL = os.environ.get("SMTP_EMAIL", "alizanaeem37@gmail.com")
# Strip spaces from app password: 'pmsy laug yrkn avrx' -> 'pmsylaugyrknavrx'
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "pmsylaugyrknavrx").replace(" ", "")


def _send_mail_worker(to_email, otp_code, user_name):
    """Internal worker that connects to Gmail via SSL and sends the email."""
    subject = f"{otp_code} is your AI GLAM Verification Code"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AI GLAM Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF6F1; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #30232A;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6F1; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #F8DCE5; overflow: hidden; box-shadow: 0 4px 20px rgba(185, 47, 96, 0.06);">
              <!-- Top Banner -->
              <tr>
                <td style="padding: 32px 36px 20px 36px; text-align: center; background-color: #FFF1F5; border-bottom: 1px solid #F8DCE5;">
                  <div style="display: inline-block; width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #B92F60, #C94D78); line-height: 44px; text-align: center; color: #FFFFFF; font-size: 20px; font-weight: bold;">
                    ✨
                  </div>
                  <h1 style="margin: 12px 0 2px 0; font-size: 22px; font-weight: 700; color: #30232A; letter-spacing: -0.5px;">AI GLAM</h1>
                  <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B92F60; font-weight: 700;">Studio Verification</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #30232A;">Welcome, {user_name}!</h2>
                  <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #55444C;">
                    Thank you for joining AI GLAM. Please use the following 6-digit verification code to complete your profile registration:
                  </p>

                  <!-- OTP Code Box -->
                  <div style="background-color: #FFF1F5; border: 1.5px dashed #B92F60; border-radius: 16px; padding: 22px; text-align: center; margin: 0 0 24px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #B92F60; font-family: 'Courier New', Courier, monospace;">
                      {otp_code}
                    </span>
                  </div>

                  <p style="margin: 0 0 8px 0; font-size: 11px; color: #8A727C;">
                    ⏱️ This code expires in <strong>10 minutes</strong>.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #8A727C;">
                    🔒 If you didn't request this registration, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 36px; background-color: #FAFAFA; border-top: 1px solid #F8DCE5; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #A08C94;">
                    &copy; 2026 AI GLAM Studio &middot; Intelligent Beauty Simulation
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"AI GLAM <{SMTP_EMAIL}>"
    msg["To"] = to_email
    # Standard headers for fast inbox delivery & antispam bypass
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="gmail.com")
    msg["X-Priority"] = "1"
    msg["Priority"] = "Urgent"
    msg["Importance"] = "high"

    msg.attach(MIMEText(f"Your AI GLAM verification code is: {otp_code}\n\nThis code will expire in 10 minutes.", "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        # Use direct SSL on port 465 for fastest connection
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=12)
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, [to_email], msg.as_string())
        server.quit()
        print(f" [AI GLAM OTP] Email successfully delivered to {to_email}", flush=True)
        return True, "Verification code sent to your email address."
    except Exception as e:
        print(f" [AI GLAM OTP WARNING] Gmail SMTP error: {e}", flush=True)
        return False, f"Could not connect to SMTP server: {str(e)}"


def send_otp_email(to_email, otp_code, user_name="Beauty Enthusiast", run_in_background=True):
    """
    Send OTP verification email.
    If run_in_background=True (default), sends in a background thread so the user's
    browser UI responds instantaneously without waiting for network latency.
    """
    print(f"\n=======================================================", flush=True)
    print(f" [AI GLAM OTP] Email: {to_email}", flush=True)
    print(f" [AI GLAM OTP] 6-Digit Code: {otp_code}", flush=True)
    print(f"=======================================================\n", flush=True)

    if run_in_background:
        thread = threading.Thread(
            target=_send_mail_worker,
            args=(to_email, otp_code, user_name),
            daemon=True
        )
        thread.start()
        return True, "Verification code sent to your email address."
    else:
        return _send_mail_worker(to_email, otp_code, user_name)


def _send_reset_mail_worker(to_email, otp_code, user_name):
    """Internal worker for password reset email."""
    subject = f"{otp_code} is your AI GLAM Password Reset Code"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AI GLAM Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF6F1; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #30232A;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF6F1; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #F8DCE5; overflow: hidden; box-shadow: 0 4px 20px rgba(185, 47, 96, 0.06);">
              <!-- Top Banner -->
              <tr>
                <td style="padding: 32px 36px 20px 36px; text-align: center; background-color: #FFF1F5; border-bottom: 1px solid #F8DCE5;">
                  <div style="display: inline-block; width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #B92F60, #C94D78); line-height: 44px; text-align: center; color: #FFFFFF; font-size: 20px; font-weight: bold;">
                    🔐
                  </div>
                  <h1 style="margin: 12px 0 2px 0; font-size: 22px; font-weight: 700; color: #30232A; letter-spacing: -0.5px;">AI GLAM</h1>
                  <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #B92F60; font-weight: 700;">Password Reset</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #30232A;">Hello, {user_name}!</h2>
                  <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #55444C;">
                    We received a request to reset your AI GLAM account password. Use the 6-digit verification code below to set a new password:
                  </p>

                  <!-- OTP Code Box -->
                  <div style="background-color: #FFF1F5; border: 1.5px dashed #B92F60; border-radius: 16px; padding: 22px; text-align: center; margin: 0 0 24px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #B92F60; font-family: 'Courier New', Courier, monospace;">
                      {otp_code}
                    </span>
                  </div>

                  <p style="margin: 0 0 8px 0; font-size: 11px; color: #8A727C;">
                    ⏱️ This reset code is valid for <strong>10 minutes</strong>.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #8A727C;">
                    🔒 If you did not request a password reset, please ignore this email or make sure your account is secure.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 36px; background-color: #FAFAFA; border-top: 1px solid #F8DCE5; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #A08C94;">
                    &copy; 2026 AI GLAM Studio &middot; Intelligent Beauty Simulation
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"AI GLAM <{SMTP_EMAIL}>"
    msg["To"] = to_email
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="gmail.com")
    msg["X-Priority"] = "1"
    msg["Priority"] = "Urgent"
    msg["Importance"] = "high"

    msg.attach(MIMEText(f"Your AI GLAM password reset code is: {otp_code}\n\nThis code expires in 10 minutes.", "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=12)
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, [to_email], msg.as_string())
        server.quit()
        print(f" [AI GLAM RESET] Password reset email delivered to {to_email}", flush=True)
        return True, "Reset code sent."
    except Exception as e:
        print(f" [AI GLAM RESET WARNING] SMTP error: {e}", flush=True)
        return False, str(e)


def send_password_reset_email(to_email, otp_code, user_name="Beauty Enthusiast", run_in_background=True):
    """Send password reset OTP email in background."""
    print(f"\n=======================================================", flush=True)
    print(f" [AI GLAM RESET] Email: {to_email}", flush=True)
    print(f" [AI GLAM RESET] 6-Digit Code: {otp_code}", flush=True)
    print(f"=======================================================\n", flush=True)

    if run_in_background:
        thread = threading.Thread(
            target=_send_reset_mail_worker,
            args=(to_email, otp_code, user_name),
            daemon=True
        )
        thread.start()
        return True, "Password reset code sent."
    else:
        return _send_reset_mail_worker(to_email, otp_code, user_name)


# ── Owner email: all feedback submissions are delivered here ─────────────────
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "alizanaeem37@gmail.com")

# Emoji badges per feedback type
_FEEDBACK_BADGE = {
    "Review":     ("⭐", "#D97706", "#FFFBEB", "#FDE68A"),
    "Complaint":  ("🚨", "#DC2626", "#FEF2F2", "#FECACA"),
    "Suggestion": ("💡", "#7C3AED", "#F5F3FF", "#EDE9FE"),
    "Bug Report": ("🐛", "#0369A1", "#F0F9FF", "#BAE6FD"),
    "Other":      ("✉️",  "#B92F60", "#FFF1F5", "#F8DCE5"),
}


def send_feedback_email(sender_name, sender_email, feedback_type,
                        subject, message, rating, submitted_at):
    """
    Send a user-submitted feedback directly to the owner's email.
    Runs synchronously so we can confirm delivery before responding to the user.
    Returns (success: bool, error_message: str | None).
    """
    badge_emoji, badge_color, badge_bg, badge_border = _FEEDBACK_BADGE.get(
        feedback_type, _FEEDBACK_BADGE["Other"]
    )

    stars = ""
    if rating and int(rating) > 0:
        filled = "★" * int(rating)
        empty  = "☆" * (5 - int(rating))
        stars  = f'<span style="color:#B92F60;font-size:18px;">{filled}</span><span style="color:#D1A0B0;font-size:18px;">{empty}</span>'
    else:
        stars = '<span style="color:#D1A0B0;font-size:13px;">No rating provided</span>'

    email_subject = f"[AI GLAM Feedback] New {feedback_type} from {sender_name}"

    html_body = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>AI GLAM Feedback</title></head>
<body style="margin:0;padding:0;background-color:#FAF6F1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#30232A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
         style="background-color:#FAF6F1;padding:40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%"
               style="max-width:560px;background-color:#FFFFFF;border-radius:24px;
                      border:1px solid #F8DCE5;overflow:hidden;
                      box-shadow:0 4px 20px rgba(185,47,96,0.07);">

          <!-- Header -->
          <tr>
            <td style="padding:28px 36px 20px 36px;text-align:center;
                       background-color:#FFF1F5;border-bottom:1px solid #F8DCE5;">
              <div style="display:inline-block;width:44px;height:44px;border-radius:14px;
                          background:linear-gradient(135deg,#B92F60,#C94D78);
                          line-height:44px;text-align:center;color:#FFF;font-size:20px;">
                ✨
              </div>
              <h1 style="margin:10px 0 2px;font-size:20px;font-weight:700;
                         color:#30232A;letter-spacing:-0.4px;">AI GLAM</h1>
              <p style="margin:0;font-size:10px;text-transform:uppercase;
                        letter-spacing:2px;color:#B92F60;font-weight:700;">
                Feedback &amp; Support
              </p>
            </td>
          </tr>

          <!-- Feedback type badge -->
          <tr>
            <td style="padding:24px 36px 0 36px;">
              <div style="display:inline-block;padding:6px 14px;border-radius:999px;
                          background-color:{badge_bg};border:1px solid {badge_border};
                          font-size:12px;font-weight:700;color:{badge_color};">
                {badge_emoji}&nbsp;&nbsp;{feedback_type}
              </div>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="padding:18px 36px 0 36px;">
              <table width="100%" cellspacing="0" cellpadding="0"
                     style="font-size:13px;border-collapse:collapse;">
                <tr>
                  <td style="padding:9px 12px;background:#FFF1F5;border-radius:10px 0 0 10px;
                             font-weight:600;color:#30232A;width:30%;border-bottom:4px solid #FAF6F1;">
                    From
                  </td>
                  <td style="padding:9px 12px;background:#FFF9FB;border-radius:0 10px 10px 0;
                             color:#30232A;border-bottom:4px solid #FAF6F1;">
                    {sender_name}
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 12px;background:#FFF1F5;border-radius:10px 0 0 10px;
                             font-weight:600;color:#30232A;border-bottom:4px solid #FAF6F1;">
                    Email
                  </td>
                  <td style="padding:9px 12px;background:#FFF9FB;border-radius:0 10px 10px 0;
                             border-bottom:4px solid #FAF6F1;">
                    <a href="mailto:{sender_email}" style="color:#B92F60;text-decoration:none;">
                      {sender_email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 12px;background:#FFF1F5;border-radius:10px 0 0 10px;
                             font-weight:600;color:#30232A;border-bottom:4px solid #FAF6F1;">
                    Subject
                  </td>
                  <td style="padding:9px 12px;background:#FFF9FB;border-radius:0 10px 10px 0;
                             color:#30232A;border-bottom:4px solid #FAF6F1;">
                    {subject}
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 12px;background:#FFF1F5;border-radius:10px 0 0 10px;
                             font-weight:600;color:#30232A;border-bottom:4px solid #FAF6F1;">
                    Rating
                  </td>
                  <td style="padding:9px 12px;background:#FFF9FB;border-radius:0 10px 10px 0;
                             border-bottom:4px solid #FAF6F1;">
                    {stars}
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 12px;background:#FFF1F5;border-radius:10px 0 0 10px;
                             font-weight:600;color:#30232A;">
                    Submitted
                  </td>
                  <td style="padding:9px 12px;background:#FFF9FB;border-radius:0 10px 10px 0;
                             color:#30232A;">
                    {submitted_at}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message block -->
          <tr>
            <td style="padding:20px 36px 28px 36px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;
                        text-transform:uppercase;letter-spacing:1px;color:#B92F60;">
                Message
              </p>
              <div style="background:#FFF1F5;border-left:3px solid #B92F60;
                          border-radius:0 12px 12px 0;padding:16px 18px;
                          font-size:13px;line-height:1.7;color:#30232A;
                          white-space:pre-wrap;">
{message}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;background:#FAFAFA;
                       border-top:1px solid #F8DCE5;text-align:center;">
              <p style="margin:0;font-size:11px;color:#A08C94;">
                &copy; 2026 AI GLAM Studio &middot; This email was sent automatically by the AI GLAM Feedback System.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    plain_body = (
        f"AI GLAM Feedback — {feedback_type}\n"
        f"{'='*50}\n"
        f"From:      {sender_name} <{sender_email}>\n"
        f"Type:      {feedback_type}\n"
        f"Subject:   {subject}\n"
        f"Rating:    {rating}/5\n"
        f"Submitted: {submitted_at}\n"
        f"{'='*50}\n\n"
        f"{message}\n"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = email_subject
    msg["From"]    = f"AI GLAM Feedback <{SMTP_EMAIL}>"
    msg["To"]      = OWNER_EMAIL
    msg["Reply-To"] = f"{sender_name} <{sender_email}>"
    msg["Date"]    = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain="gmail.com")

    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=15)
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, [OWNER_EMAIL], msg.as_string())
        server.quit()
        print(f" [AI GLAM FEEDBACK] {feedback_type} from {sender_email} delivered to {OWNER_EMAIL}", flush=True)
        return True, None
    except Exception as e:
        print(f" [AI GLAM FEEDBACK ERROR] SMTP error: {e}", flush=True)
        return False, str(e)
