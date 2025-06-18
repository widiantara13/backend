import { DataTypes } from 'sequelize';
import db from '../config/Config.js';
import User from './UserModel.js';

const Product = db.define("products", {
    uuid:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        validate:{
            notEmpty: true

        }
    },
    name:{
        type: DataTypes.STRING,       
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [2, 100]
        }
    },
    image:{
        type: DataTypes.STRING,       
        allowNull: false,
        validate:{
            notEmpty: true            
        }
    },
    url:{
        type: DataTypes.STRING,       
        allowNull: false,
        validate:{
            notEmpty: true
            
        }
    },
    price:{
        type: DataTypes.INTEGER,       
        allowNull: false,
        validate:{
            notEmpty: true
            
        }
    },
    
    userId:{
        type: DataTypes.INTEGER,       
        allowNull: false,
        validate:{
            notEmpty: true
            
        }
    },
    
},{
    freezeTableName: true,
    timestamps: false
});
User.hasMany(Product);
Product.belongsTo(User, {foreignKey: "userId"});


export default Product;