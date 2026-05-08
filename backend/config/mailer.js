const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();
const emailFrom = (process.env.EMAIL_FROM || '').trim() || `CEMECO <${smtpUser || 'noreply@example.com'}>`;
const useConsoleEmail = process.env.NODE_ENV === 'development' && process.env.USE_CONSOLE_EMAIL === 'true';

const isPlaceholderValue = (value) => {
  return !value || /votre|your|example|test|dummy/i.test(value);
};

console.log('Configuration SMTP:', {
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  user: smtpUser ? '***' : 'non défini',
  pass: smtpPass ? '***' : 'non défini',
  from: emailFrom
});

const configuredTransporter = smtpUser && smtpPass && !isPlaceholderValue(smtpUser) && !isPlaceholderValue(smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    })
  : null;

async function getTransporter() {
  if (configuredTransporter) return configuredTransporter;
  if (useConsoleEmail) return null;
  return null; // Pas de fallback Ethereal
}

// ====================== ENVOI DU CODE DE RÉINITIALISATION ======================
async function sendPasswordResetEmail(email, nom) {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // Code 6 chiffres

  const hasValidSmtpConfig = !!configuredTransporter;
  const fallbackToConsole = process.env.NODE_ENV === 'development' && (!hasValidSmtpConfig || useConsoleEmail);

  if (fallbackToConsole) {
    console.log('\n════════════════════════════════════════════');
    console.log('📧 CODE DE RÉINITIALISATION DE MOT DE PASSE');
    console.log('════════════════════════════════════════════');
    console.log(`👤 Destinataire: ${nom} <${email}>`);
    console.log(`🔐 Code: ${code}`);
    console.log(`⏱️ Validité: 10 minutes`);
    console.log('════════════════════════════════════════════');
    
    return { success: true, code };
  }

  const transporterToUse = await getTransporter();
  if (!transporterToUse) {
    console.warn(`⚠️ SMTP non configuré - Code pour ${email}: ${code}`);
    return { success: false, code }; // On retourne le code en dev
  }

  try {
    await transporterToUse.verify();

    const from = process.env.EMAIL_FROM || `Espace Patient <${smtpUser || 'noreply@example.com'}>`;
    const subject = '🔐 Code de réinitialisation de votre mot de passe';

    const text = `Bonjour ${nom || 'Patient'},\n\nVotre code de réinitialisation est : ${code}\n\nCe code est valide pendant 10 minutes.\n\nCordialement,\nL'équipe médicale`;

    const html = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Réinitialisation de Mot de Passe</h1>
          </div>
          
          <div style="padding: 40px 20px;">
            <p style="font-size: 16px; color: #333;">Bonjour <strong>${nom || 'Patient'}</strong>,</p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              Vous avez demandé une réinitialisation de votre mot de passe.
            </p>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 6px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Votre code de réinitialisation</p>
              <p style="margin: 0; font-size: 42px; font-weight: 700; color: #667eea; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                ${code}
              </p>
              <p style="margin: 12px 0 0 0; color: #999; font-weight: 500;">Valide pendant <strong>10 minutes</strong></p>
            </div>

            <p style="font-size: 14px; color: #555; text-align: center;">
              Ce code vous permettra de créer un nouveau mot de passe sécurisé.
            </p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px; font-size: 13px;">
              <strong>⚠️ Important :</strong><br>
              • Ne partagez jamais ce code avec quiconque<br>
              • Ce code expirera après 10 minutes
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777;">
            Cet email a été envoyé à <strong>${email}</strong><br>
            © 2026 Espace Patient - Tous droits réservés.
          </div>
        </div>
      </body>
    </html>`;

    await transporterToUse.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
      priority: 'high'
    });

    console.log(`✅ Email de réinitialisation envoyé à ${email}`);
    return { success: true, code };   // ← Important : on retourne le code

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.message);
    return { success: false, code: null };
  }
}

// ====================== ENVOI DU CODE OTP ======================
async function sendOTPEmail(email, code, nom) {
  const hasValidSmtpConfig = !!configuredTransporter;
  const fallbackToConsole = process.env.NODE_ENV === 'development' && (!hasValidSmtpConfig || useConsoleEmail);

  if (fallbackToConsole) {
    console.log('\n════════════════════════════════════════════');
    console.log('📧 ENVOI CODE OTP');
    console.log('════════════════════════════════════════════');
    console.log(`👤 Destinataire: ${nom} <${email}>`);
    console.log(`🔐 Code: ${code}`);
    console.log(`⏱️ Validité: 10 minutes`);
    console.log('════════════════════════════════════════════');
    return { success: true };
  }

  const transporterToUse = await getTransporter();
  if (!transporterToUse) {
    throw new Error('SMTP non configuré. Vérifiez EMAIL_USER et EMAIL_PASS.');
  }

  await transporterToUse.verify();

  const subject = '🔐 Code de vérification pour votre réinitialisation';
  const text = `Bonjour ${nom || 'Patient'},\n\nVotre code de vérification est : ${code}\n\nCe code est valide pendant 10 minutes.\n\nCordialement,\nL'équipe CEMECO`;
  const html = `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #3b82f6 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Vérification de mot de passe</h1>
          </div>
          <div style="padding: 40px 20px;">
            <p style="font-size: 16px; color: #333;">Bonjour <strong>${nom || 'Patient'}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">Voici votre code de vérification pour réinitialiser votre mot de passe.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0f766e; padding: 25px; margin: 30px 0; border-radius: 6px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Votre code</p>
              <p style="margin: 0; font-size: 42px; font-weight: 700; color: #0f766e; letter-spacing: 12px; font-family: 'Courier New', monospace;">${code}</p>
              <p style="margin: 12px 0 0 0; color: #999; font-weight: 500;">Valide pendant <strong>10 minutes</strong></p>
            </div>
            <p style="font-size: 14px; color: #555; text-align: center;">Ne partagez jamais ce code avec quelqu'un d'autre.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #777;">
            Cet email a été envoyé à <strong>${email}</strong><br>© 2026 CEMECO - Tous droits réservés.
          </div>
        </div>
      </body>
    </html>`;

  await transporterToUse.sendMail({
    from: emailFrom,
    to: email,
    subject,
    text,
    html,
    priority: 'high'
  });

  console.log(`✅ OTP envoyé à ${email}`);
  return { success: true };
}

// ====================== VÉRIFICATION DU CODE ======================
async function verifyResetOTP(email, otp, db) {
  try {
    const [rows] = await db.execute(
      `SELECT id, reset_otp, reset_otp_expiry, reset_otp_attempts 
       FROM patient 
       WHERE email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: "Aucun compte trouvé avec cet email" };
    }

    const user = rows[0];

    if (!user.reset_otp || !user.reset_otp_expiry) {
      return { success: false, message: "Aucune demande de réinitialisation en cours" };
    }

    if (new Date() > new Date(user.reset_otp_expiry)) {
      return { success: false, message: "Ce code a expiré" };
    }

    if (user.reset_otp_attempts >= 5) {
      return { success: false, message: "Trop de tentatives. Veuillez refaire une demande." };
    }

    if (user.reset_otp !== otp) {
      await db.execute(
        `UPDATE patient SET reset_otp_attempts = reset_otp_attempts + 1 WHERE id = ?`,
        [user.id]
      );
      return { success: false, message: "Code incorrect" };
    }

    return { success: true, userId: user.id, message: "Code valide" };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Erreur serveur" };
  }
}

// ====================== RÉINITIALISATION DU MOT DE PASSE ======================
async function resetPassword(email, otp, newPassword, db) {
  try {
    const verify = await verifyResetOTP(email, otp, db);
    if (!verify.success) return verify;

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute(
      `UPDATE patient 
       SET mot_de_passe = ?,
           reset_otp = NULL,
           reset_otp_expiry = NULL,
           reset_otp_attempts = 0,
           reset_token = NULL,
           reset_token_expiry = NULL,
           dernier_connexion = NOW()
       WHERE email = ?`,
      [hashedPassword, email]
    );

    console.log(`✅ Mot de passe réinitialisé avec succès pour ${email}`);
    return { success: true, message: "Mot de passe modifié avec succès" };

  } catch (err) {
    console.error(err);
    return { success: false, message: "Erreur lors de la réinitialisation du mot de passe" };
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendOTPEmail,
  verifyResetOTP,
  resetPassword
};