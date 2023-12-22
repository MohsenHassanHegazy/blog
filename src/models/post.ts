import { Schema, Types, model, Model } from 'mongoose';

interface IPost { 
title:string;
posterUrl?:string;
content:string;
imagesListUrl?:string[];
createdAt:Date;
updatedAt:Date;
comments:object[];
creator:object;
_doc:any;
}

const PostSchema =new Schema<IPost>({
    title:{
        type:String,
        required:true
     },
     posterUrl:{
        type:String,
        required:false
      },
      content:{
        type:String,
        required:true
       },
       imagesListUrl:[],
       comments:[{
        type:Types.ObjectId,
        ref:'Comment'
        }],
        creator:{
         type:Types.ObjectId,
         required:true,
         ref:'User'
         }

 },
 {timestamps:true}
 )

export default model<IPost>('Post',PostSchema)