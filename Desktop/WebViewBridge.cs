using System;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Newtonsoft.Json;

namespace HospitalManagementSystem.Desktop
{
    public class WebViewBridge
    {
        private readonly WebView2 _webView;

        public WebViewBridge(WebView2 webView)
        {
            _webView = webView ?? throw new ArgumentNullException(nameof(webView));
        }

        /// <summary>
        /// Sends an operation payload response to React UI via JS Injection.
        /// </summary>
        public void SendResponseToUI(string action, object payload, bool success = true, string errorMessage = "")
        {
            try
            {
                var responseObj = new
                {
                    action = action,
                    success = success,
                    payload = payload,
                    error = errorMessage
                };

                string jsonMessage = JsonConvert.SerializeObject(responseObj);
                
                // Invoke Javascript window callback to dispatch React State updates
                _webView.Invoke((MethodInvoker)delegate
                {
                    _webView.CoreWebView2.PostWebMessageAsJson(jsonMessage);
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WebViewBridge Exception] SendResponseToUI failed: {ex.Message}");
            }
        }

        /// <summary>
        /// Executes asynchronous generic Javascript expressions on UI safely.
        /// </summary>
        public async Task<string> ExecuteScriptAsync(string javascriptCode)
        {
            try
            {
                return await _webView.CoreWebView2.ExecuteScriptAsync(javascriptCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WebViewBridge ExecScript Exception] {ex.Message}");
                return null;
            }
        }
    }
}
