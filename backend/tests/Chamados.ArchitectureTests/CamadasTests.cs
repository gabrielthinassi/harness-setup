using System.Reflection;
using Chamados.Domain.Chamados;
using NetArchTest.Rules;
using ApplicationDI = Chamados.Application.DependencyInjection;
using InfrastructureDI = Chamados.Infrastructure.DependencyInjection;

namespace Chamados.ArchitectureTests;

/// <summary>Garante a regra de dependência: Api → Application → Domain; Infrastructure → Application.</summary>
public sealed class CamadasTests
{
    private const string NsApplication = "Chamados.Application";
    private const string NsInfrastructure = "Chamados.Infrastructure";
    private const string NsApi = "Chamados.Api";

    private static readonly Assembly DomainAssembly = typeof(Chamado).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(ApplicationDI).Assembly;
    private static readonly Assembly InfrastructureAssembly = typeof(InfrastructureDI).Assembly;

    [Fact]
    public void Domain_nao_depende_de_outras_camadas_nem_de_frameworks()
    {
        var resultado = Types.InAssembly(DomainAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(NsApplication, NsInfrastructure, NsApi, "Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore")
            .GetResult();

        resultado.IsSuccessful.ShouldBeTrue(Falhas(resultado));
    }

    [Fact]
    public void Application_nao_depende_de_Infrastructure_nem_de_Api()
    {
        var resultado = Types.InAssembly(ApplicationAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(NsInfrastructure, NsApi, "Microsoft.AspNetCore", "Npgsql")
            .GetResult();

        resultado.IsSuccessful.ShouldBeTrue(Falhas(resultado));
    }

    [Fact]
    public void Infrastructure_nao_depende_de_Api()
    {
        var resultado = Types.InAssembly(InfrastructureAssembly)
            .ShouldNot()
            .HaveDependencyOn(NsApi)
            .GetResult();

        resultado.IsSuccessful.ShouldBeTrue(Falhas(resultado));
    }

    private static string Falhas(TestResult resultado) =>
        "Tipos que violam a regra: " + string.Join(", ", resultado.FailingTypeNames ?? []);
}
