using Altairis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(AltairisDbContext context)
    {
        // Asegurar que la DB existe y tiene migraciones
        await context.Database.MigrateAsync();

        if (await context.Hotels.AnyAsync()) return; // Ya hay datos

        // 1. Hoteles
        var hotels = new List<Hotel>
        {
            new Hotel { Id = Guid.NewGuid(), Name = "Altairis Grand Resort", Country = "México", City = "Cancún", Address = "Blvd. Kukulcan Km 12", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Hotel { Id = Guid.NewGuid(), Name = "Altairis City Center", Country = "España", City = "Madrid", Address = "Gran Vía 45", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Hotel { Id = Guid.NewGuid(), Name = "Altairis Beach Paradise", Country = "República Dominicana", City = "Punta Cana", Address = "Playa Bávaro", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Hotel { Id = Guid.NewGuid(), Name = "Altairis Mountain Retreat", Country = "Argentina", City = "Bariloche", Address = "Av. Bustillo Km 5", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Hotel { Id = Guid.NewGuid(), Name = "Altairis Urban Executive", Country = "Colombia", City = "Bogotá", Address = "Calle 72 #10-34", IsActive = true, CreatedAt = DateTime.UtcNow }
        };

        await context.Hotels.AddRangeAsync(hotels);

        // 2. Tipos de Habitación
        var roomTypes = new List<RoomType>();
        foreach (var hotel in hotels)
        {
            roomTypes.Add(new RoomType { Id = Guid.NewGuid(), HotelId = hotel.Id, Name = "Standard", Capacity = 2, IsActive = true });
            roomTypes.Add(new RoomType { Id = Guid.NewGuid(), HotelId = hotel.Id, Name = "Deluxe", Capacity = 3, IsActive = true });
            roomTypes.Add(new RoomType { Id = Guid.NewGuid(), HotelId = hotel.Id, Name = "Suite", Capacity = 4, IsActive = true });
        }
        await context.RoomTypes.AddRangeAsync(roomTypes);

        // 3. Inventario (Próximos 30 días)
        var inventories = new List<Inventory>();
        var startDate = DateTime.Today;
        for (int i = 0; i < 30; i++)
        {
            var date = startDate.AddDays(i);
            foreach (var rt in roomTypes)
            {
                inventories.Add(new Inventory
                {
                    Id = Guid.NewGuid(),
                    RoomTypeId = rt.Id,
                    Date = date,
                    TotalRooms = 10,
                    AvailableRooms = (i % 5 == 0) ? 0 : (i % 7 == 0) ? 2 : 10 // Simular agotado y baja disp.
                });
            }
        }
        await context.Inventories.AddRangeAsync(inventories);

        // 4. Reservas Demo
        var reservations = new List<Reservation>
        {
            new Reservation { Id = Guid.NewGuid(), HotelId = hotels[0].Id, RoomTypeId = roomTypes.First(rt => rt.HotelId == hotels[0].Id).Id, GuestName = "John Doe", CheckIn = startDate, CheckOut = startDate.AddDays(3), Status = "Confirmed" },
            new Reservation { Id = Guid.NewGuid(), HotelId = hotels[1].Id, RoomTypeId = roomTypes.First(rt => rt.HotelId == hotels[1].Id).Id, GuestName = "Jane Smith", CheckIn = startDate.AddDays(1), CheckOut = startDate.AddDays(5), Status = "Pending" },
            new Reservation { Id = Guid.NewGuid(), HotelId = hotels[2].Id, RoomTypeId = roomTypes.First(rt => rt.HotelId == hotels[2].Id).Id, GuestName = "Carlos García", CheckIn = startDate.AddDays(2), CheckOut = startDate.AddDays(4), Status = "Cancelled" },
            new Reservation { Id = Guid.NewGuid(), HotelId = hotels[0].Id, RoomTypeId = roomTypes.First(rt => rt.HotelId == hotels[0].Id).Id, GuestName = "Alice Winston", CheckIn = startDate.AddDays(-5), CheckOut = startDate.AddDays(-2), Status = "Confirmed" }
        };
        await context.Reservations.AddRangeAsync(reservations);

        await context.SaveChangesAsync();
    }
}
