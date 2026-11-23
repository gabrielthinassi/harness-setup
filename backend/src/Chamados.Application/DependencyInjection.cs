using Chamados.Application.Messaging;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Chamados.Application;

public static class DependencyInjection
{
    private static readonly Type[] HandlerInterfaces =
    [
        typeof(ICommandHandler<>),
        typeof(ICommandHandler<,>),
        typeof(IQueryHandler<,>),
    ];

    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        // Registra todos os handlers concretos pelas suas interfaces (sem biblioteca de mediator).
        var registros =
            from type in assembly.GetTypes()
            where type is { IsClass: true, IsAbstract: false }
            from contrato in type.GetInterfaces()
            where contrato.IsGenericType && HandlerInterfaces.Contains(contrato.GetGenericTypeDefinition())
            select (contrato, type);

        foreach (var (contrato, implementacao) in registros)
        {
            services.AddScoped(contrato, implementacao);
        }

        services.AddValidatorsFromAssembly(assembly, includeInternalTypes: true);
        services.TryAddSingleton(TimeProvider.System);

        return services;
    }
}
