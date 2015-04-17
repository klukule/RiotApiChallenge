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
using System.Timers;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;

namespace Dekstop_client
{
    /// <summary>
    /// Interaction logic for CharacterCard.xaml
    /// </summary>
    public partial class CharacterCard : UserControl
    {
        public string championName { get; set; }
        public int championID { get; set; }

        public int wins { get; set; }
        public int defeats { get; set; }
        public int kills { get; set; }
        public int deaths { get; set; }

        public CharacterCard(string showName,string imageName,int champID,int wins,int defeats,int kills,int deaths)
        {
            InitializeComponent();
            changeName(showName);
            changeImage(imageName);
            this.championID = champID;
            this.wins = wins;
            this.defeats = defeats;
            this.kills = kills;
            this.deaths = deaths;
        }
        //Update all data
        public void update(string showName, string imageName, int champID, int wins, int defeats, int kills, int deaths)
        {
            InitializeComponent();
            changeName(showName);
            changeImage(imageName);
            this.championID = champID;
            this.wins = wins;
            this.defeats = defeats;
            this.kills = kills;
            this.deaths = deaths;
        }
        //Update only stats
        public void updateStats(int wins, int defeats, int kills, int deaths)
        {
            this.wins = wins;
            this.defeats = defeats;
            this.kills = kills;
            this.deaths = deaths;
        }
        bool returning = false;
        public void transformText()
        {
            Thickness margin = champName.Margin;
            double width = (champName.ActualWidth / 4) + 5;
            if (margin.Right < width && returning == false)
            {
                margin.Right += 0.2;
            }
            else
            {
                returning = true;
                margin.Right -= 0.2;
                if (margin.Right < -(width)) { returning = false; }
            }
            champName.Margin = margin;
        }
        public void changeImage(string imageName)
        {
            this.champImage.Source = new BitmapImage(new Uri(Properties.Settings.Default.liPre + imageName + Properties.Settings.Default.liSuf, UriKind.Absolute));
        }

        public void changeName(string name)
        {
            championName = name;
            this.champName.Content = name;
        }

        private void champName_Loaded(object sender, RoutedEventArgs e)
        {
            Label label = (Label)sender;
            if (label.ActualWidth > 77)
            {
                //MessageBox.Show("label " + label.Content.ToString() + " will be scaled");
                System.Windows.Threading.DispatcherTimer dispatcherTimer = new System.Windows.Threading.DispatcherTimer();
                dispatcherTimer.Tick += dispatcherTimer_Tick;
                dispatcherTimer.Interval = new TimeSpan(0,0,0,0,1);
                dispatcherTimer.Start();
            }
        }
        private void dispatcherTimer_Tick(object sender, EventArgs e)
        {
            transformText();
        }

        private void Image_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            MessageBox.Show(this.wins.ToString());
        }

        private void Image_MouseLeave(object sender, MouseEventArgs e)
        {
            imageOverlay.Effect =
            new DropShadowEffect
            {
                Color = Colors.Orange,
                ShadowDepth = 0,
                Opacity = 0,
                BlurRadius = 5,
            };
        }

        private void Image_MouseEnter(object sender, MouseEventArgs e)
        {

            imageOverlay.Effect =
            new DropShadowEffect
            {
                Color = Colors.Orange,
                ShadowDepth=0,
                Opacity=1,
                BlurRadius=5,
            };
        }
    }
}
