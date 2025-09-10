namespace mobile
{
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();

            var view = new WebView();
            Content = view;
            view.Source = "http://1.222.23.210:88";
            view.Reload();
        }
    }
}
