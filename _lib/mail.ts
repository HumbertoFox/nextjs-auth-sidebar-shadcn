import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    try {
        const result = await transporter.sendMail({
            from: `'nextjs-starter-kit' <${process.env.SMTP_USER}>`,
            to,
            subject: 'Password reset',
            html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to create a new password:</p>
                <a href='${resetLink}'>${resetLink}</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });
        return { ok: true, result };

    } catch (error) {
        return { ok: false, error };
    };
}

export const sendEmailVerification = async (to: string, link: string) => {
    try {
        const result = await transporter.sendMail({
            from: `'nextjs-starter-kit' <${process.env.SMTP_USER}>`,
            to,
            subject: 'Check your email.',
            html: `
                <h2>Email confirmation</h2>
                <p>Click the link below to confirm your email:</p>
                <a href='${link}'>${link}</a>
                <p>If you did not request this, you can ignore this email.</p>
            `,
        });
        return { ok: true, result };
    } catch (error) {
        return { ok: false, error };
    };
}