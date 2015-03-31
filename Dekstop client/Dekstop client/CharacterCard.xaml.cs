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
        public void changeImage(string imageName)
        {
            this.champImage.Source = new BitmapImage(new Uri(Properties.Settings.Default.liPre + imageName + Properties.Settings.Default.liSuf, UriKind.Absolute));
        }

        public void changeName(string name)
        {
            championName = name;
            this.champName.Content = name;
        }
    }
}
