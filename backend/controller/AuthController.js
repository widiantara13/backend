import User from '../models/UserModel.js';
import argon2 from 'argon2';

export const Login = async (req, res) => {
    const {email, password} = req.body
    const response = await User.findOne({
        where:{
            email:email
        }
    });
    if(!response){
        return res.status(404).json({
            msg: "User not found"
        });
    };
    const match = await argon2.verify(response.password, password);
    if(!match){
        return res.status(400).json({
            msg:"Wrong password"
        });
    };
    req.session.userId = response.uuid;
    const uuid = response.uuid;
    const name = response.name;
    const emailUser = response.email;
    const role = response.role;
    res.status(200).json({
        uuid, name, emailUser, role, msg:"Login success"
    });
};

export const Logout = async (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.status(400).json({
                msg:"Connot log out"
            });
        };
        res.status(200).json({
            msg:"log out success"
        });
    });
};

export const isLogin = async (req, res) =>{
    if(!req.session.userId){
        return res.status(401).json({
            msg: "You need to login to get access"
        });
    };
    const response = await User.findOne({
        attributes:["uuid", "name", "email", "role"],
        where:{
            uuid: req.session.userId
        }
    });
    if(!response){
        return res.status(404).json({
            msg:"User not found"
        });
    };
    res.status(200).json(response)
}