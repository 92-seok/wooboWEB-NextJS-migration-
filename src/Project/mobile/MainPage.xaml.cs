namespace mobile
{
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();

            var view = new WebView();
            Content = view;
            view.Source = "http://woobo.online";
            view.Reload();
        }
    }
}
