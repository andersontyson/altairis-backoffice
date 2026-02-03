using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Persistence;

public class AltairisDbContext : DbContext
{
    public AltairisDbContext(DbContextOptions<AltairisDbContext> options)
        : base(options)
    {
    }

    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Hotel -> RoomTypes
        modelBuilder.Entity<Hotel>()
            .HasMany(h => h.RoomTypes)
            .WithOne(rt => rt.Hotel)
            .HasForeignKey(rt => rt.HotelId)
            .OnDelete(DeleteBehavior.Cascade); // OK

        // RoomType -> Inventories
        modelBuilder.Entity<RoomType>()
            .HasMany(rt => rt.Inventories)
            .WithOne(i => i.RoomType)
            .HasForeignKey(i => i.RoomTypeId)
            .OnDelete(DeleteBehavior.Cascade); // OK

        // Reservation -> Hotel
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Hotel)
            .WithMany()
            .HasForeignKey(r => r.HotelId)
            .OnDelete(DeleteBehavior.Restrict);

        // Reservation -> RoomType
        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.RoomType)
            .WithMany()
            .HasForeignKey(r => r.RoomTypeId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}
