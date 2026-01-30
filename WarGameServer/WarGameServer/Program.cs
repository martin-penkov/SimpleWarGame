
using System.Net.NetworkInformation;
using WarGameServer;
using WarGameServer.Communication.Sender;
using WarGameServer.Hubs;
using WarGameServer.Services;

namespace WarGameServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.Configure<GameSettings>(builder.Configuration.GetSection("GameSettings"));
            builder.Services.AddSingleton<IGameService, GameService>();
            builder.Services.AddSingleton<IPlayersHubSender, PlayersHubSender>();
            builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ClientCors", policy =>
                {
                    policy.WithOrigins("https://5018d73dc7fa.ngrok-free.app")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("ClientCors");

            app.UseAuthorization();


            app.MapControllers();
            app.MapHub<PlayerHub>("/hubs/player");

            app.Run();
        }
    }
}
