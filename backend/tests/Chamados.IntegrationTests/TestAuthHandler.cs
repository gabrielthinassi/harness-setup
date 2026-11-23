using System.Security.Claims;
using System.Text.Encodings.Web;
using Chamados.Api.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Chamados.IntegrationTests;

/// <summary>Autenticação fake: o teste informa tenant e usuário por header.</summary>
internal sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string Scheme = "Test";
    public const string HeaderTenant = "X-Test-Tenant";
    public const string HeaderUsuario = "X-Test-Usuario";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(HeaderTenant, out var tenant) ||
            !Request.Headers.TryGetValue(HeaderUsuario, out var usuario))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        Claim[] claims =
        [
            new(HttpTenantContext.ClaimTenant, tenant.ToString()),
            new("sub", usuario.ToString()),
        ];

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme)));
    }
}
