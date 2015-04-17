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
        Socket socket;
        public MainWindow(JArray startingData,Socket socket)
        {
            InitializeComponent();
            this.socket = socket;
            foreach (JToken token in startingData)
            {
                CharacterCard character = new CharacterCard((string)token["championName"],(string)token["championKey"], (int)token["championId"],(int)token["wins"],(int)token["defeats"], (int)token["kills"],(int)token["deaths"]);

                panel.Children.Add(character);
            }

            socket.On("update", (data) =>
            {
                int index = 0;
                foreach (JToken token in (JArray)data)
                {
                    Application.Current.Dispatcher.Invoke((Action)delegate
                    {
                        CharacterCard card = (CharacterCard)panel.Children[index];
                        if ((string)token["championName"] == card.championName)
                        {
                            card.updateStats((int)token["wins"], (int)token["defeats"], (int)token["kills"], (int)token["deaths"]);
                        }
                        else
                        {
                            card.update(
                                (string)token["championName"],
                                (string)token["championKey"],
                                (int)token["championId"],
                                (int)token["wins"],
                                (int)token["defeats"],
                                (int)token["kills"],
                                (int)token["deaths"]);
                        }
                        index++;
                    });
                }
            });
        }

        private void Image_Unloaded(object sender, RoutedEventArgs e)
        {
            socket.Off("update");
        }
    }
}
