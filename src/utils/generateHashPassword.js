import bcrypt from 'bcrypt';

export async function generateHashPassword(password){
    try {
        const hashPassword = await bcrypt.hash(password,10);
        return hashPassword;
    } catch (error) {
        console.log("Generate Hash Password Error : ",error);
    }
}

export async function comparePassword(password,HashPassword){
    try {
        const isMatch = await bcrypt.compare(password,HashPassword);
        return isMatch;
    } catch (error) {
        console.log("Compare TWO password Error : ",error);
        
    }
}