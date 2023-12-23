import { Router } from "express";
import adminControler from "../controllers/post-controler";
import { body } from "express-validator";
import isAuth from "../util/isAuth";
import validEmail from "../util/isValid";

const router =Router();

router.get('/',adminControler.getmain)


router.post('/comment',[
    body('content','comment can not be empty!!!')
        .isLength({min:1}),
    body('postId','post not send')
        .notEmpty()
    ],isAuth,adminControler.postNewComment);
router.post('/replay',[
    body('content','comment can not be empty!!!')
        .isLength({min:1}),
        body('commentId','commentId not send')
    ],isAuth,validEmail,adminControler.postNewReplay);

router.get('/getReplay/:commentId',adminControler.getReplay)  

router.get('/getComments/:postId',adminControler.getComments)    

router.post('/likeComment',isAuth,validEmail,adminControler.likeComment)

router.post('/editComment',body('content','content is required!')
.notEmpty(),isAuth,validEmail,adminControler.editComment)

router.delete('/deleteComment',isAuth,validEmail,adminControler.deleteComment)

router.get('/newPost',isAuth,validEmail,adminControler.getNewPost);

router.post('/newPost',[
    body('title','title is required!')
        .notEmpty()
    ,body('content','content is required!')
        .notEmpty()
],
isAuth,adminControler.postNewPost);

router.put('/editPost',isAuth,validEmail,adminControler.editPost);

router.delete('/deletePost',isAuth,validEmail,adminControler.deletePost);

router.get('/post/:postId',adminControler.getPost);

router.get('/posts',adminControler.getPosts);


export default router;