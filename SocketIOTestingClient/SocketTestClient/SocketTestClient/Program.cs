using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
namespace SocketTestClient
{
    class Program
    {
        static void Main(string[] args)
        {
            var socket = IO.Socket("http://54.201.28.167:3000");
            socket.Connect();
                socket.On(Socket.EVENT_CONNECT, () =>
                {
                    //socket.Emit("chat message", "HELLO ALL");

                });

                socket.On("update", (data) =>
                {
                    //Console.WriteLine(data);
                    JArray array = (JArray)data;
                    foreach (JToken token in array)
                    {
                        Console.WriteLine(token["championId"]);
                        Console.WriteLine(token["championKey"]);
                        Console.WriteLine(token["championName"]);
                        Console.WriteLine(token["kills"]);
                        Console.WriteLine(token["deaths"]);
                        Console.WriteLine(token["wins"]);
                        Console.WriteLine(token["defeats"]);
                        Console.WriteLine("-----------");
                    }
                    socket.Disconnect();
                });
            
            socket.Disconnect();
            Console.ReadLine();
        }
    }
}
