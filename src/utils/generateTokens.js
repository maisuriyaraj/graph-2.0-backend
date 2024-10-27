import jwt from 'jsonwebtoken';


export async function generateAccessToken(data){
    return jwt.sign({
        _id:data._id,
        email:data.email,
        username:data.username,
    },
    process.env.ACCESS_TOKEN_SECREATE,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}

export async function generateRefereshToken(data){
    return jwt.sign({
        userID : data._id
    },process.env.REFERESH_TOKEN_SECREATE,
    {expiresIn:process.env.REFERESH_TOKEN_EXPIRY})
}


export async function generateResetPasswordToken(data){
    return jwt.sign({
        userID : data._id
    },process.env.RESET_PASSWORD_SECREATE,
    {expiresIn : '30m'})
}