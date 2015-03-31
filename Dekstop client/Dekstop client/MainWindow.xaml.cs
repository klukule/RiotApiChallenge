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
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            panel.Children.Add(new CharacterCard("Garen", "Garen",1));
            panel.Children.Add(new CharacterCard("Ahri", "Ahri",2));
            panel.Children.Add(new CharacterCard("Nunu", "Nunu",3));
            panel.Children.Add(new CharacterCard("Aatrox", "Aatrox",4));
            panel.Children.Add(new CharacterCard("Fiddlesticks", "FiddleSticks",5));
        }
    }
}
