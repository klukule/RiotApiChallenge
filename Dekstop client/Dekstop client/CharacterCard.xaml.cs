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

namespace Dekstop_client
{
    /// <summary>
    /// Interaction logic for CharacterCard.xaml
    /// </summary>
    public partial class CharacterCard : UserControl
    {
        public string championName { get; set; }
        public int championID { get; set; }


        public CharacterCard(string showName,string imageName,int champID)
        {
            InitializeComponent();
            changeName(showName);
            changeImage(imageName);
            this.championID = champID;
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
    }
}
