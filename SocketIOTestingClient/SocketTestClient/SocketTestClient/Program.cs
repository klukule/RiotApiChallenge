using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Quobject.SocketIoClientDotNet.Client;

namespace SocketTestClient
{
    class Program
    {
        static void Main(string[] args)
        {
            var socket = IO.Socket("http://localhost:3000");
            socket.Connect();
                socket.On(Socket.EVENT_CONNECT, () =>
                {
                    //socket.Emit("chat message", "HELLO ALL");

                });

                socket.On("update", (data) =>
                {
                    Console.WriteLine(data);
                });
            
            socket.Disconnect();
            Console.ReadLine();
        }
    }
}
