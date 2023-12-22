import mongoose from "mongoose";
import { Schema, Types, model, Model } from 'mongoose';
import Comment from './comment'
import Post from './post'


interface I{
    name:string;
    avatar:string;
    email:string;
    token:number;
    tokenDate:Date;
    validEmail:boolean
    password:string;
    posts:Types.ObjectId[];
    comments:object[];
    likedPosts:object[];
    likedComments:Comment[];
    dislikedPosts:object[];
    dislikedComments:Comment[];
    isadmin:boolean;
    banDate:Date;

 }


 interface IUser extends I {
    _doc:any;
    _id:any;
  }
const User =new Schema<IUser>({
    name:{
        type:String,
        required:true
     },
     avatar:{
      type:String,
      required:true,
      default:'https://as2.ftcdn.net/v2/jpg/03/32/59/65/1000_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg'
   },
    email:{
        type:String,
        required:true
     },
     token:{
      type:Number,
      required:true,
      default:0
      },
     tokenDate:{
      type:Date,
      required:true,
      default:new Date('2000-4-4')

      },
      validEmail:{
        type:Boolean,
        default:false
       }
      ,
     password:{
        type:String,
        required:true
     },
     posts:[{
      type:Types.ObjectId,
      ref:'Post'
    }],
     comments:[{
      type:Types.ObjectId,
      ref:'Comment'
    }],
     likedPosts:[{
      type:Types.ObjectId,
      ref:'Post'
    }],
     likedComments:[{
      type:Types.ObjectId,
      ref:'Comment'
    }],
     dislikedPosts:[{
      type:Types.ObjectId,
      ref:'Post'
    }],
     dislikedComments:[{
      type:Types.ObjectId,
      ref:'Comment'
    }],
    isadmin:{
      type:Boolean,
      default:false
     },
     banDate:{
      type:Date,
      required:true,
      default:new Date('2000-4-4')
      }
     
     
 })

export default  model<IUser>('User',User);