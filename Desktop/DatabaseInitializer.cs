using System;
using System.IO;
using System.Text;
using System.Windows.Forms;
using MySql.Data.MySqlClient;

namespace HospitalManagementSystem.Desktop
{
    public static class DatabaseInitializer
    {
        private const string DefaultConnectionString = "Server=localhost;Database=medicare_hms;Uid=root;Pwd=12345678;";

        public static void Initialize()
        {
            try
            {
                string projectRoot = ResolveProjectRoot();
                string schemaPath = Path.Combine(projectRoot, "Database", "schema.sql");
                string seedPath = Path.Combine(projectRoot, "Database", "seed.sql");

                if (!File.Exists(schemaPath))
                {
                    throw new FileNotFoundException("Schema file not found.", schemaPath);
                }

                if (!File.Exists(seedPath))
                {
                    throw new FileNotFoundException("Seed file not found.", seedPath);
                }

                string configuredConnectionString = Environment.GetEnvironmentVariable("MYSQL_CONN") ?? DefaultConnectionString;
                string serverConnectionString = StripDatabaseParameter(configuredConnectionString);

                using (var connection = new MySqlConnection(serverConnectionString))
                {
                    connection.Open();

                    ExecuteSqlScript(connection, File.ReadAllText(schemaPath, Encoding.UTF8));
                    ExecuteSqlScript(connection, File.ReadAllText(seedPath, Encoding.UTF8));
                }

                Console.WriteLine("MySQL schema and seed data initialized successfully.");
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Failed to initialize the MySQL database before launch.\n\n{ex.Message}",
                    "Database Initialization Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);

                Environment.Exit(1);
            }
        }

        private static void ExecuteSqlScript(MySqlConnection connection, string sql)
        {
            var script = new MySqlScript(connection, sql);
            script.Execute();
        }

        private static string StripDatabaseParameter(string connectionString)
        {
            var builder = new MySqlConnectionStringBuilder(connectionString);

            if (builder.ContainsKey("Database"))
            {
                builder.Remove("Database");
            }

            if (builder.ContainsKey("Initial Catalog"))
            {
                builder.Remove("Initial Catalog");
            }

            return builder.ConnectionString;
        }

        private static string ResolveProjectRoot()
        {
            var directory = new DirectoryInfo(AppContext.BaseDirectory);

            while (directory != null)
            {
                if (Directory.Exists(Path.Combine(directory.FullName, "Database")))
                {
                    return directory.FullName;
                }

                directory = directory.Parent;
            }

            throw new DirectoryNotFoundException("Could not locate the project root containing the Database folder.");
        }
    }
}