using System;
using System.Windows.Forms;

namespace HospitalManagementSystem.Desktop
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            DatabaseInitializer.Initialize();

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Start the application and run the MainForm
            Application.Run(new MainForm());
        }
    }
}
