import User from '../models/UserModel.js';

export const verifyUser = async(req, res, next) => {
    if(!req.session.userId){
        return res.status(401).json({
            msg: "You need to login to get access"
        });
    };
    const response = await User.findOne({        
        where:{
            uuid: req.session.userId
        }
    });
    if(!response){
        return res.status(404).json({
            msg:"User not found"
        });
    };
    req.userId = response.id;
    req.role = response.role;
    next()
};

export const isAdmin = async(req, res, next) => {    
    const response = await User.findOne({        
        where:{
            uuid: req.session.userId
        }
    });
    if(!response){
        return res.status(404).json({
            msg:"User not found"
        });
    };
    if(response.role !== "Admin"){
        return res.status(403).json({
            msg: "Access forbidden"
        });
    };
    
    next()
};