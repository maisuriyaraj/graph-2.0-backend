export function forgotPasswordMailTemplate(userData) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body>
            <p>Hi ${userData.userName},</p>
            <p>As you have requested for reset password instructions, here they are, please follow the URL:</p>
            <p><a href='http://localhost:3000/resetPassword?t=${userData.resetPasswordToken}'>Reset Password</a></p>
            <p>Alternatively, open the following url in your browser</p>
            <p><a href='http://localhost:3000/resetPassword?t=${userData.resetPasswordToken}'>LINK 2</a></p>
        </body>
        </html>
    `;
}


export function Send2FAOTPMail(userData,otp) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>2FA OTP Email</title>
        </head>
        <body>
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <p>Hi ${userData.userName},</p>
                        <p>For your security, please use the following One-Time Password (OTP) to complete your login:</p>
                        <p><strong>Your OTP: ${otp}</strong></p>
                        <p>This code is valid for the next in 10 minutes. Please do not share this code with anyone.</p>
                        <p>If you did not request this verification, you can safely ignore this email or contact our support team immediately.</p>
                        <p>Thank you for helping us keep your account secure.</p>
                        <p>Best regards,</p>
                        <p>Graph Communities Support Team</p>
                        <p>Email: rjindustries76233@gmail.com</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>

    `
}