
using Microsoft.Maui.Controls.PlatformConfiguration;
#if ANDROID
using Android.Webkit;
#endif

namespace WooboOnline
{
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();
        }

        private void WebView_Navigating(object sender, WebNavigatingEventArgs e)
        {
            // http 또는 https 스킴이 아니면 외부 브라우저나 앱으로 연결
            if (!e.Url.StartsWith("http") && !e.Url.StartsWith("https"))
            {
                try
                {
                    // 외부 앱을 열고 웹뷰 내비게이션을 취소
                    Browser.Default.OpenAsync(e.Url, BrowserLaunchMode.External);
                    //Launcher.OpenAsync(e.Url);

                    //Android.Content.Intent intent = new Android.Content.Intent(intent.ActionView);
                    e.Cancel = true;
                }
                catch (Exception ex)
                {
                    Application.Current.MainPage.DisplayAlert("네이버지도 기능을 지원하지 않습니다.", ex.Message, "확인");

                    // 처리할 수 없는 스킴인 경우 오류 메시지 표시
                    Console.WriteLine($"Could not handle URL scheme: {ex.Message}");
                    e.Cancel = true;
                }
            }

            
        }

        private void ContentPage_Loaded(object sender, EventArgs e)
        {
#if ANDROID
                var androidWebView = webView.Handler.PlatformView as Android.Webkit.WebView;
                androidWebView.SetWebViewClient(new CustomWebViewClientSample());
#endif
        }
    }

#if ANDROID


    public partial class CustomWebViewClientSample : WebViewClient
    {
        public override bool ShouldOverrideUrlLoading(Android.Webkit.WebView view, string url)
        {
            if (!URLUtil.IsNetworkUrl(url) && !URLUtil.IsJavaScriptUrl(url))
            {
                Android.Net.Uri uri;
                try
                {
                    uri = Android.Net.Uri.Parse(url);
                }
                catch (Exception)
                {
                    return false;
                }

                if ("intent".Equals(uri.Scheme, StringComparison.OrdinalIgnoreCase))
                {
                    return StartSchemeIntent(url);
                }
                else
                {
                    try
                    {
                        var intent = new Android.Content.Intent(Android.Content.Intent.ActionView, uri);
                        Platform.CurrentActivity.StartActivity(intent);
                        return true;
                    }
                    catch (Exception)
                    {
                        return false;
                    }
                }
            }

            return false;
        }

        private bool StartSchemeIntent(string url)
        {
            Android.Content.Intent schemeIntent;
            try
            {
                schemeIntent = Android.Content.Intent.ParseUri(url, Android.Content.IntentUriType.Scheme);
            }
            catch (Java.Net.URISyntaxException)
            {
                return false;
            }

            try
            {
                Platform.CurrentActivity.StartActivity(schemeIntent);
                return true;
            }
            catch (Android.Content.ActivityNotFoundException ex)
            {
                string packageName = schemeIntent.Package;
                if (!string.IsNullOrEmpty(packageName))
                {
                    var marketUri = Android.Net.Uri.Parse("market://details?id=" + packageName);
                    var marketIntent = new Android.Content.Intent(Android.Content.Intent.ActionView, marketUri);
                    Platform.CurrentActivity.StartActivity(marketIntent);
                    return true;
                }
            }
            catch (Exception ex)
            {
                return false;
            }

            return false;
        }
    }
#endif
}
