import { Schema, Types, model, Model } from 'mongoose';
import user from './user'
import post from './post'

interface ICommentSchema{
    postId:typeof post;
    userId:typeof user;
    content:string;
    _doc:{
        userId:typeof user,
        content:string
     };
     createdAt:Date;
     updatedAt:Date;
     replay:object[];
     parent:object
     likes:number;
     dislikes:number;
 }


const CommentSchema =new Schema<ICommentSchema>({
    postId:{
        type:Types.ObjectId,
        ref:'Post',
        required:true
     },
    userId:{
        type:Types.ObjectId,
        ref:'User',
        required:true
     },
    content:{
        type:String,
        required:true
     },
     parent:{
      type:Types.ObjectId,
      ref:'Comment',
      default:null
      }
      
     ,
     replay:[{
        type:Types.ObjectId,
        ref:'Comment',
        required:true
      }],
      likes:{
        type:Number,
        default:0
        },
      dislikes:{
        type:Number,
        default:0
        }
     
    },
    {timestamps:true}
 )

 export default model<ICommentSchema>('Comment',CommentSchema);







 //