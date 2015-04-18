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
using System.Windows.Media.Animation;

namespace Dekstop_client
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        Socket socket;
        static ProgressBar kdRatioBar;
        static ProgressBar wdRatioBar;
        static StackPanel dataPanel;
        static Label statsForLabel;
        static Label kdRatioLabel;
        static Label wdRatioLabel;
        public static void showDetails(string name,int wins,int defeats,int kills,int deaths)
        {
            if (dataPanel.Visibility == Visibility.Hidden)
            {
                dataPanel.Visibility = Visibility.Visible;
            }
            //Set labels
            kdRatioLabel.Content = kills + " / " + deaths;
            wdRatioLabel.Content = wins + " / " + defeats;
            statsForLabel.Content = "Statistics for " + name;

            //Set maximums
            kdRatioBar.Maximum = kills + deaths;
            wdRatioBar.Maximum = wins + defeats;
            //Set animation duration
            Duration duration = new Duration(TimeSpan.FromSeconds(1));
            //Begin animation for KDbar
            DoubleAnimation kdValueAnim = new DoubleAnimation(kills, duration);
            kdRatioBar.BeginAnimation(ProgressBar.ValueProperty, kdValueAnim);
            //Begin animation for WDbar
            DoubleAnimation wdValueAnim = new DoubleAnimation(wins, duration);
            wdRatioBar.BeginAnimation(ProgressBar.ValueProperty, wdValueAnim);
        }

        public MainWindow(JArray startingData,Socket socket)
        {
            InitializeComponent();

            kdRatioBar = KDRatio;
            wdRatioBar = WDRatio;
            dataPanel = DataPanel;
            statsForLabel = StatsFor;
            kdRatioLabel = KDRatioText;
            wdRatioLabel = WDRatioText;

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

        private void Panel_Unloaded(object sender, RoutedEventArgs e)
        {
            socket.Off("update");
        }
    }
}
