using System;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using Newtonsoft.Json;

namespace HospitalManagementSystem.Desktop
{
    public partial class MainForm : Form
    {
        private WebView2 webView;
        private WebViewBridge bridge;

        public MainForm()
        {
            InitializeComponent();
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            try
            {
                // Create WebView2 control inside WinForms Client Area, hidden initially to prevent white flashing
                webView = new WebView2
                {
                    Dock = DockStyle.Fill,
                    Location = new Point(0, 0),
                    MinimumSize = new Size(1024, 768),
                    Visible = false,
                    DefaultBackgroundColor = Color.FromArgb(248, 250, 252) // bg-slate-50 light mode background
                };

                this.Controls.Add(webView);

                // Initialize Microsoft Edge WebView2 Environment
                await webView.EnsureCoreWebView2Async(null);

                // Configure standard desktop WebView settings
                webView.CoreWebView2.Settings.IsScriptEnabled = true;
                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;

                // Instantiate C# Bridge and register callbacks
                bridge = new WebViewBridge(webView);
                webView.CoreWebView2.WebMessageReceived += OnWebViewMessageReceived;

                // Show WebView2 control once navigation is completed to prevent loading flickers
                webView.NavigationCompleted += (sender, e) =>
                {
                    webView.Visible = true;
                };

                // Load the local React development build port or production build directory
                string appUrl = Environment.GetEnvironmentVariable("APP_URL") ?? "http://localhost:3000";
                webView.CoreWebView2.Navigate(appUrl);

                Console.WriteLine("WebView2 successfully initialized and navigated to: " + appUrl);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize Microsoft WebView2. Ensure WebView2 Runtime is installed.\nError: {ex.Message}", "Initialization Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OnWebViewMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string rawMessage = e.WebMessageAsJson;
                if (string.IsNullOrEmpty(rawMessage)) return;

                // Delegate parse & execution to the message handler loop
                MessageHandler.HandleIncomingWebMessage(rawMessage, bridge);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[C# WinForms Bridge Error] OnWebMessageReceived: {ex.Message}");
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private System.ComponentModel.IContainer components = null;

        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1280, 800);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Text = "MediCare Hospital Management System Desktop Client";
            this.MinimumSize = new Size(1024, 768);
        }
    }
}
