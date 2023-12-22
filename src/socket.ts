import { Server } from 'socket.io';
let io:Server;


export default  {
    init:(httpserver:any)=>{
        io=new Server(httpserver);
        return io;
     },
     getio:()=>{
        if(!io){
            throw new Error('socketIO not initialized!')
         }
         return io;
      }
}