using Altairis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Altairis.Infrastructure.Persistence
{
    public class AltairisDbContextFactory : IDesignTimeDbContextFactory<AltairisDbContext>
    {
        public AltairisDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AltairisDbContext>();
            optionsBuilder.UseSqlServer("Server=.;Database=AltairisDb;Trusted_Connection=True;TrustServerCertificate=True");

            return new AltairisDbContext(optionsBuilder.Options);
        }
    }
}
