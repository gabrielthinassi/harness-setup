using System.Text.Json.Serialization;
using Chamados.Api.Endpoints;
using Chamados.Api.Common;
using Chamados.Application;
using Chamados.Application.Abstractions;
using Chamados.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Borda HTTP: tenant e usuário vêm do token
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantContext, HttpTenantContext>();
builder.Services.AddScoped<IUsuarioAtual, HttpUsuarioAtual>();

// Camadas
builder.Services.AddApplication();
builder.Services.AddInfrastructure(
    builder.Configuration.GetConnectionString("Chamados")
        ?? throw new InvalidOperationException("Connection string 'Chamados' não configurada."));

// Segurança (parâmetros do JWT em appsettings: Authentication:Schemes:Bearer)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
builder.Services.AddAuthorization();

// Erros, JSON e documentação
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapChamadosEndpoints();

app.Run();

// Exposto para os testes de integração (WebApplicationFactory<Program>).
public partial class Program
{
}
