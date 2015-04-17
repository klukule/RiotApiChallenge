using System;
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
using System.Windows.Navigation;
using System.Windows.Shapes;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json.Linq;

namespace Dekstop_client
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow(JArray startingData,Socket socket)
        {
            InitializeComponent();
            foreach (JToken token in startingData)
            {
                CharacterCard character = new CharacterCard((string)token["championName"], (string)token["championKey"], (int)token["championId"]);
                panel.Children.Add(character);
            }

            socket.On("update", (data) =>
            {
                //List<CharacterCard> newChars = new List<CharacterCard>();
                Dispatcher.Invoke(new Action(() => panel.Children.Clear()));
                 
                foreach (JToken token in (JArray)data)
                {
                    Application.Current.Dispatcher.Invoke((Action)delegate
               {
                   CharacterCard character = new CharacterCard((string)token["championName"], (string)token["championKey"], (int)token["championId"]);
                   Dispatcher.Invoke(new Action(() => panel.Children.Add(character)));
               });
                }
            });
        }
    }
}
