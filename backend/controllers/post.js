const Post = require("../models/post");
const User = require("../models/user");
//Create a post
exports.createPost = async (req, res) => {
  try {
    const newPostData = {
      caption:req.body.caption,
      image:{
        public_id:"cloudinary_public_id",
        url:"cloudinary_url"
      },
      owner:req.user._id
    }
    const post = await Post.create(newPostData);
    const user = await User.findById(req.user._id);
    user.posts.push(post._id);
    await user.save();
    res.status(201).json({
      success:true,
      post
    })
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};
//Delete Post
exports.deletePost = async(req,res)=>{
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({
        success:false,
        message:"Post not found"
      });
    }
    if(post.owner.toString() !== req.user._id.toString()){
      return res.status(401).json({
        success:false,
        message:"Unauthorized"
      })
    }
    await post.remove();
    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);
    user.posts.slice(index,1);
    await user.save();
    res.status(200).json({
      success:true,
      message:"Post Deleted"
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}
//Like or Dislike
exports.likeOrDislike = async(req,res)=>{
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({
        success:false,
        message:"Post not found"
      });
    }
    if(post.likes.includes(req.user._id)){
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index,1);
      await post.save();
      return res.status(200).json({
        success:true,
        message:"Post Disliked"
      });
    }else{
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({
        success:true,
        message:"Post Liked"
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}
//Get Post of Following
exports.getPostOfFollowing = async(req,res)=>{
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({
      owner:{
        $in:user.following
      }
    })
    res.status(200).json({
      success:true,
      posts
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
}