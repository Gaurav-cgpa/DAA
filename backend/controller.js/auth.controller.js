import User from "../models/auth.js";
import bcryptjs from "bcryptjs";
import generateandsetcookie from "../utils/generateandsetcookie.js";

export const signup=async(req,res)=>{
      
    const {email,password,confirmpassword}=req.body;
    try {
        if(!email||!password)
        {
            return res.status(400).json({message:"All fields are required"});
        }

        if(password!=confirmpassword)
        {
            return res.status(400).json({message:"Passwword field does not match"});
        }

        const user=await User.findOne({email});
        if(user)
        {
            return res.status(400).json({message:"User with email already registered"});
        }
        else{
            const hashedpassword=await bcryptjs.hash(password,10);

            const newUser= await User.create({
                email,
                password:hashedpassword,
            });

            
            generateandsetcookie(newUser._id,res);

            res.status(200).json({
                success:true,
                user:newUser,
            });
        }
    } catch (error) {
        console.log("Error in signup controller:", error);
		res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login=async(req,res)=>{
     
    const { email, password}=req.boy;
    try {
        if(!email||!password)
        {
            return res.status(400).json({message:"All fields are required"});
        }

        const user=await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({message:"User does not find"});
        }
        else{
            const decoded=await bcryptjs.compare(password,user.password);

            if(decoded)
            {
                generateandsetcookie(user._id,res);

                return res.status(200).json({
                    success:true,
                    user:newUser,
                });
            }
            else{
                return res.status(400).json({message:"Passsword do not match"});
            }
        }
    } catch (error) {
        console.log("Error in login controller:", error);
		res.status(500).json({ success: false, message: "Server error" });
    }

};

export const logout=async(req,res)=>{
    res.clearCookie("jwt");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};