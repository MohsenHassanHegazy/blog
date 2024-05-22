writingComments = (event) => {
  var socket = io();

  socket.on("newComment", (arg) => {
    var comment = document.createElement("div");
    var commentsDiv = document.getElementById("comments");
    comment.innerHTML = `
     
      <h1> ${arg.comment.name} </h1>
      <h3> ${arg.comment.content}</h3>
      <h5>${arg.comment.likes} like</h5> 
      <h5>${arg.comment.dislikes} dislike</h5> 
      `;
    commentsDiv.appendChild(comment);
  });
};
document.addEventListener("submit", writingComments);
