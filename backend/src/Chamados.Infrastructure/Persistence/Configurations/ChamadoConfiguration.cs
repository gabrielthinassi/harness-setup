using Chamados.Domain.Chamados;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Chamados.Infrastructure.Persistence.Configurations;

internal sealed class ChamadoConfiguration : IEntityTypeConfiguration<Chamado>
{
    public void Configure(EntityTypeBuilder<Chamado> builder)
    {
        builder.ToTable("chamados");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.TenantId).IsRequired();
        builder.Property(c => c.Titulo).HasMaxLength(Chamado.TituloMaxLength).IsRequired();
        builder.Property(c => c.Descricao).HasMaxLength(Chamado.DescricaoMaxLength).IsRequired();
        builder.Property(c => c.Solucao).HasMaxLength(Chamado.SolucaoMaxLength);
        builder.Property(c => c.Prioridade).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);

        // TenantId sempre como primeira coluna dos índices.
        builder.HasIndex(c => new { c.TenantId, c.Status, c.CriadoEm });
        builder.HasIndex(c => new { c.TenantId, c.ResponsavelId });

        builder.Ignore(c => c.DomainEvents);
        builder.Ignore(c => c.Encerrado);

        builder.OwnsMany(c => c.Comentarios, comentario =>
        {
            comentario.ToTable("chamado_comentarios");
            comentario.WithOwner().HasForeignKey("ChamadoId");
            comentario.HasKey(c => c.Id);
            comentario.Property(c => c.Id).ValueGeneratedNever();
            comentario.Property(c => c.Texto).HasMaxLength(Comentario.TextoMaxLength).IsRequired();
        });

        builder.Navigation(c => c.Comentarios).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
