using Npgsql;

namespace KafkaDebeziumExampleBackend
{
    public static class SqlController
    {
        private static readonly string _connectionString = "Host=postgres;Username=postgres;Password=postgres;Database=demo";

        public static async Task<IResult> ExecuteSql(HttpContext context)
        {
            var form = await context.Request.ReadFromJsonAsync<SqlRequest>();
            if(form is null) return Results.BadRequest("Invalid SQL request");

            try
            {
                await using var conn = new NpgsqlConnection(_connectionString);
                await conn.OpenAsync();

                await using var cmd = new NpgsqlCommand(form.Sql, conn);
                await using var reader = await cmd.ExecuteReaderAsync();
                
                var results = new List<Dictionary<string, object>>();
                while(await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>();
                    for (var i = 0; i < reader.FieldCount; i++)
                    {
                        var columnName = reader.GetName(i);
                        var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                        row[columnName] = value!;
                    }
                    results.Add(row);
                }

                return Results.Ok(results);
            }
            catch(Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        }
    }

    record SqlRequest(string Sql);
}
