using System.Reflection;
using Chamados.Application.Messaging;
using Chamados.Domain.Common;
using NetArchTest.Rules;

namespace Chamados.ArchitectureTests;

public sealed class ConvencoesTests
{
    private static readonly Assembly DomainAssembly = typeof(Entity<>).Assembly;
    private static readonly Assembly ApplicationAssembly = typeof(ICommand).Assembly;

    [Fact]
    public void Todo_aggregate_root_pertence_a_um_tenant()
    {
        var semTenant = DomainAssembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && HerdaDe(t, typeof(AggregateRoot<>)))
            .Where(t => !typeof(ITenantEntity).IsAssignableFrom(t))
            .Select(t => t.Name)
            .ToList();

        semTenant.ShouldBeEmpty("Aggregates sem ITenantEntity (se for global de propósito, documente e adicione exceção aqui).");
    }

    [Fact]
    public void Entidades_nao_tem_setters_publicos()
    {
        var violacoes = DomainAssembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && HerdaDe(t, typeof(Entity<>)))
            .SelectMany(t => t.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.SetMethod is { IsPublic: true } && !IsInitOnly(p))
                .Select(p => $"{t.Name}.{p.Name}"))
            .ToList();

        violacoes.ShouldBeEmpty("Estado do domínio só muda por métodos de negócio.");
    }

    [Fact]
    public void Handlers_sao_sealed_e_internos()
    {
        var resultado = Types.InAssembly(ApplicationAssembly)
            .That().HaveNameEndingWith("Handler")
            .Should().BeSealed()
            .And().NotBePublic()
            .GetResult();

        resultado.IsSuccessful.ShouldBeTrue(string.Join(", ", resultado.FailingTypeNames ?? []));
    }

    [Fact]
    public void Commands_e_queries_seguem_a_nomenclatura()
    {
        var tipos = ApplicationAssembly.GetTypes().Where(t => !t.IsInterface).ToList();

        var commandsMalNomeados = tipos
            .Where(t => Implementa(t, typeof(ICommand)) || Implementa(t, typeof(ICommand<>)))
            .Where(t => !t.Name.EndsWith("Command", StringComparison.Ordinal))
            .Select(t => t.Name);

        var queriesMalNomeadas = tipos
            .Where(t => Implementa(t, typeof(IQuery<>)))
            .Where(t => !t.Name.EndsWith("Query", StringComparison.Ordinal))
            .Select(t => t.Name);

        commandsMalNomeados.Concat(queriesMalNomeadas).ShouldBeEmpty();
    }

    [Fact]
    public void Eventos_de_dominio_sao_records_sealed()
    {
        var violacoes = DomainAssembly.GetTypes()
            .Where(t => !t.IsInterface && typeof(IDomainEvent).IsAssignableFrom(t))
            .Where(t => !t.IsSealed || t.GetMethod("<Clone>$") is null)
            .Select(t => t.Name)
            .ToList();

        violacoes.ShouldBeEmpty();
    }

    private static bool HerdaDe(Type tipo, Type genericoBase)
    {
        for (var atual = tipo.BaseType; atual is not null; atual = atual.BaseType)
        {
            if (atual.IsGenericType && atual.GetGenericTypeDefinition() == genericoBase)
            {
                return true;
            }
        }

        return false;
    }

    private static bool Implementa(Type tipo, Type contrato) =>
        contrato.IsGenericTypeDefinition
            ? tipo.GetInterfaces().Any(i => i.IsGenericType && i.GetGenericTypeDefinition() == contrato)
            : contrato.IsAssignableFrom(tipo);

    private static bool IsInitOnly(PropertyInfo propriedade) =>
        propriedade.SetMethod!.ReturnParameter
            .GetRequiredCustomModifiers()
            .Any(m => m.FullName == "System.Runtime.CompilerServices.IsExternalInit");
}
