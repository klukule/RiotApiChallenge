﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json.Linq;
using System.Threading;

namespace Dekstop_client
{
    /// <summary>
    /// Interaction logic for LoadingFrame.xaml
    /// </summary>
    public partial class LoadingFrame : Window
    {
        public LoadingFrame()
        {
            InitializeComponent();

            var socket = IO.Socket("http://"+Properties.Settings.Default.socketServerURL+":"+Properties.Settings.Default.socketServerPort);
            socket.Connect();
            socket.On("update", (data) =>
            {
                JArray array = (JArray)data;

                Application.Current.Dispatcher.Invoke((Action)delegate
                {
                    socket.Off("update");
                    MainWindow window = new MainWindow((JArray)data, socket);
                    window.Show();
                    this.Close();
                });
                /*foreach (JToken token in array)
                {
                    Console.WriteLine(token["championId"]);
                    Console.WriteLine(token["championKey"]);
                    Console.WriteLine(token["championName"]);
                    Console.WriteLine(token["kills"]);
                    Console.WriteLine(token["deaths"]);
                    Console.WriteLine(token["wins"]);
                    Console.WriteLine(token["defeats"]);
                    Console.WriteLine("-----------");
                }*/
            });
        }
    }
}
