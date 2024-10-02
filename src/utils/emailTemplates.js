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
            <p><a href='http://localhost:3000/resetPassword?token=${userData.access_token}'>Reset Password</a></p>
            <p>Alternatively, open the following url in your browser</p>
            <p><a href='http://localhost:3000/resetPassword?token=${userData.access_token}'>LINK 2</a></p>
        </body>
        </html>
    `;
}