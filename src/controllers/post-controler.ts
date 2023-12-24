import User from "../models/user"
import Post from "../models/post";
import Comment from "../models/comment"
import express from "express";
import bcrypt from "bcryptjs"
import { ValidationError, validationResult } from "express-validator";
import socket from "../socket";




const getmain = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   res.redirect('/posts')
}

const getNewPost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   return res.render('../views/admin/newPost',{
      pageTitle:'new post',
      errors:null,
         oldinput:{
            title:'',
            content:'',
            posterUrl:''
          }
    })
  
}



const postNewPost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   if (!req.session.user) {
      return res.json({error:'must login'})}
   const userId = req.session.user._id;
   console.log(req.file?.path);
   if(!req.file){
      return res.render('../views/admin/newPost',{
         pageTitle:'new post',
         errors:[{msg:'image is required!'}],
         oldinput:{
            title:req.body.title,
            content:req.body.content,
            posterUrl:''
          }
       })
    }
   const errors =validationResult(req);

   if(!errors.isEmpty()){
      return res.json({
         errors:errors.array()
      });
    }
   const posterUrl =req.file.path.replace("\\" ,"/");;

   const newPost = new Post({
      title: req.body.title,
      content: req.body.content, 
      posterUrl:posterUrl,
      creator: userId
   })

   console.log('userId = ', userId);

   const post = await newPost.save();


   const user = await User.findById(userId);
   if (!user) {
      throw new Error('ladkj');
   }
   user.posts.push(post._id);
   await user.save()
   res.status(201).redirect('/posts');
}

const getEditPost =async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.json({error:'must login'})}
   const postId = req.body.postId;
   const post = await Post.findById(postId);

   if (!post) { return res.status(404).json({ message: 'Post not found.' }); }

   if (post.creator.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' })
   }

   return res.status(200).render('../views/admin/editPost', {
      pageTitle: 'newPost',
      errors:null,
      oldInput:{
         title:post.title,
         content:post.content,
         posterUrl:post.posterUrl
       }
   })

 }

const editPost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   if (!req.session.user) {
      return res.json({error:'must login'})}
   const postId = req.body.postId;
   const post = await Post.findById(postId);

   if (!post) { return res.status(404).json({ message: 'Post not found.' }); }

   if (post.creator.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' })
   }

   post.title = req.body.title;
   post.content = req.body.content;


   await post.save();

   return res.status(201).json({post:post._doc})

}

const deletePost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   if (!req.session.user) {
      return res.redirect('/login')
   }

   const postId = req.body.postId;

   const post = await Post.findById(postId);

   if (!post) { return res.status(404).json({ message: 'Post not found.' }); }

   if (post.creator.toString() !== req.session.user._id.toString() && !req.session.user.isadmin) {
      return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' });
   }
   await Post.findByIdAndDelete(postId);

   const user = await User.findById(req.session.user._id).populate('posts');
   if (user) {
      const newposts = user.posts.filter((p: any) => p._id.toString() !== postId)

      user.posts = newposts;
      await user.save();

      
      await Comment.deleteMany({postId:postId})
      return res.status(200).json({user:user._doc})
   }

}

const postNewComment = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   if (!req.session.user) {
      return res.redirect('/login') }

   const errors =validationResult(req);
   const userId = req.session.user._id;


   if(!errors.isEmpty()){
      return res.json({errors:errors.array()});
    }
   const newComment = new Comment({
      postId: req.body.postId,
      content: req.body.content,
      userId: userId
   })
   const comment = await newComment.save();

   const user = await User.findById(userId);

   if (user) {
      user.comments.push(comment._id);
      await user.save();
   }
   else{
      return res.redirect('/login')
    } 

      const post = await Post.findById(req.body.postId);
      if (post) {
         post.comments.push(comment._id);
         await post.save();
         
      }

   
  socket.getio().emit('newComment',
   { comment:{
      name:user.name,
      content:comment.content,
      likes:0,
      dislikes:0,
      userId:user._id.toString()}
      ,
      msg:'new comment was posted'
      
   })


 
   return res.status(204).send()
}

const postNewReplay = async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.json({error:'must login'})}

   const errors =validationResult(req);
   if(!errors.isEmpty()){
      return res.json({errors:errors.array()});
    }
   const userId = req.session.user._id;
   console.log(req.body);
   const parent =await Comment.findById(req.body.commentId);
   if(!parent){
      console.log('post not found!!!!!')
      return res.status(404)}
   const replay =new Comment({
      postId: req.body.postId,
      content: req.body.content,
      userId: userId,
      parent:parent._id
    })

    await replay.save();
    parent.replay.push(replay._id);
    await parent.save();
    return res.status(204).send();

 } 

const likeComment = async (req: express.Request, res: express.Response, next: express.NextFunction) =>{
   if (!req.session.user) {
      return res.json({error:'must login'})}
   
   const commentId = req.body.commentId;
   const status =req.body.status;
   const comment =await Comment.findById(commentId);
   if(!comment){return res.status(500).json({message:'comment not found'})}

   const user =await User.findById(req.session.user._id);
   if(!user){return res.status(500).json({message:'user not found'}) }
    
   console.log(status);
   if(status == 1){
      const arr =user.likedComments;
      for(let i =0;i!=arr.length;i++){if(arr[i].toString()===commentId){return res.status(200).redirect('/post/' + req.body.postId) }  }
      user.likedComments.push(commentId);
      comment.likes++;
    }
    else if(status ==2){
      const arr =user.dislikedComments;
      for(let i =0;i!=arr.length;i++){if(arr[i].toString()===commentId){return res.status(200).redirect('/post/' + req.body.postId) }  }
       user.dislikedComments.push(commentId);
       comment.dislikes++;
      }
      await comment.save() 
      await user.save();
   
   res.status(200).json({user:user._doc,comment:comment._doc});

 }

const editComment = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   if (!req.session.user) {
      return res.json({error:'must login'})}
   const commentId = req.body.commentId;

   // console.log(req.body);

   const comment = await Comment.findById(commentId);

   if (!comment) { return res.status(404).json({ message: 'comment not found.' }); }

   if (comment.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' })
   }

   comment.content = req.body.content;
   await comment.save();
   return  res.status(201).redirect('/post/' + req.body.postId);

} 
const deleteComment = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
   if (!req.session.user) {
      return res.redirect('/login')
   }
   const commentId = req.body.commentId;

   // console.log(req.body);

   const comment = await Comment.findById(commentId);

   if (!comment) { return res.status(404).json({ message: 'comment not found.' }); }

   if (comment.userId.toString() !== req.session.user._id.toString() && !req.session.user.isadmin ) {
      return res.status(403).json({ message: 'not authorized!!!!!!!!!!!!!!!!!!' })
   }

   
   await Comment.findByIdAndDelete(commentId);

   const post = await Post.findById(req.body.postId);
      if(post){
         post.comments.filter((com)=>com!==commentId )
         await post.save();
       }
      
   const user =await User.findById(req.session.user._id);
      if(user){
         user.comments.filter((com)=>com!==commentId )
         await user.save()
      }
    

   return  res.status(201).redirect('/post/' + req.body.postId);

}

const getPosts = async (req: express.Request, res: express.Response, next: express.NextFunction) => {


   const posts = await Post.find();
   const arr = [];
   for (let i = 0; i < posts.length; i++) {
      const p = {
         title: posts[i].title,
         posterUrl: posts[i].posterUrl,
         updatedAt: posts[i].updatedAt,
         _id: posts[i]._id.toString()
      }

      // console.log(p);

      arr.push(p);
   }

   res.status(200).render('../views/main/mainPage', {
      pageTitle: 'main',
      posts: arr,
      errors:null
   })
}
interface ICommentSchema{
   postId:typeof Post;
   userId:typeof User;
   content:string;
   _doc:{
       userId:typeof User,
       content:string
    };
    createdAt:Date;
    updatedAt:Date;
    replay:object[];
    parent:object
    likes:number;
    dislikes:number;
    _id:any
}

const commentsFunc =async(comment:ICommentSchema)=>{
   const user =await User.findById(comment.userId);
   let name;
   let avatar;
   if(!user){name = 'deleted user';
   avatar ='https://as2.ftcdn.net/v2/jpg/03/32/59/65/1000_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg'}
   else{
      console.log(user._doc);
      name= user.name;
      avatar =user.avatar;
   }
   return {name:name,
           avatar:avatar,
           content:comment.content,
           likes:comment.likes,
           dislikes:comment.dislikes,
           id:comment._id.toString(),
           userId:comment.userId.toString()}
 }

const getPost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    let userId ;

   const postId = req.params.postId;

   const post = await Post.findById(postId);

   if (!post) {
      return res.status(404).json({ msg: "post not found" })
   }
   userId = post.creator.toString();

   const coments = post.comments;
   const arr: any[] = [];

   for(let i =0;i!=coments.length;i++){
      const comId =coments[i];
      const com =await Comment.findById(comId)
      if(!com){continue;}
      if(com.parent!==null){continue;}
      const c = await commentsFunc(com);
      const r =[];
         for(let j=0;j!=com.replay.length;j++){
            const rId =com.replay[j];
            const rep =await Comment.findById(rId)
            if(!rep){continue;}
            r.push(await commentsFunc(rep));
          }
      arr.push({comment:c,replaies:r})  ;  
   }

   

  return res.status(200).render('../views/main/post',
      { postId: postId,
        userId:userId, 
        pageTitle: post.title, 
        post: { ...post._doc } ,
        comments:arr,
      errors:null});
}




const ex = {
   getNewPost: getNewPost,
   postNewPost: postNewPost,
   postNewComment: postNewComment,
   postNewReplay:postNewReplay,
   getPosts: getPosts,
   getPost: getPost,
   getEditPost:getEditPost,
   editPost: editPost,
   deletePost: deletePost,
   getmain: getmain,
   likeComment:likeComment,
   editComment:editComment,
   deleteComment:deleteComment
}

export default ex;