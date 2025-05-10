using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace KafkaDebeziumExampleBackend
{
    public class KafkaLogConsumer
    {
        private readonly IHubContext<LogHub> _hub;
        private readonly string _topic = "^dbserver1\\.public\\..*";
        private readonly IConsumer<Ignore, string> _consumer;
        
        public KafkaLogConsumer(IHubContext<LogHub> log)
        {
            while(true)
            {
                try
                {
                    _hub = log;
                    var config = new ConsumerConfig
                    {
                        BootstrapServers = "kafka:9092",
                        GroupId = "kafka-log-consumer",
                        AutoOffsetReset = AutoOffsetReset.Earliest
                    };
                    _consumer = new ConsumerBuilder<Ignore, string>(config).Build();
                    _consumer.Subscribe(_topic);
                    break;
                }
                catch(Exception ex)
                {
                    Console.WriteLine($"Exception: {ex.Message}");
                    Task.Delay(5000);
                }
            }

            
        }

        public void Start()
        {
            Task.Run(async () =>
            {
                while (true)
                {
                    try
                    {
                        var result = _consumer.Consume();
                        var log = result.Message.Value;
                        if(string.IsNullOrWhiteSpace(log))
                            continue;
                        Console.WriteLine($"Received message: {log}");

                        await _hub.Clients.All.SendAsync("ReceiveLog", log);
                    }
                    catch (ConsumeException ex)
                    {
                        Console.WriteLine($"Consume error: {ex.Error.Reason}");
                    }
                    catch (Exception ex){
                        Console.WriteLine($"Exception: {ex.Message}");
                    }
                }
            });
        }
    }
}
