using Altairis.Api.DTOs;
using Altairis.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AltairisDbContext _context;

    public DashboardController(AltairisDbContext context)
    {
        _context = context;
    }

    // GET: api/dashboard/summary?hotelId=xxx
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary([FromQuery] string? hotelId)
    {
        var today = DateTime.Today;
        var last7Days = Enumerable.Range(0, 7).Select(i => today.AddDays(-i)).ToList();

        // Intentamos convertir el hotelId a Guid si viene en query
        Guid? hotelGuid = null;
        if (!string.IsNullOrEmpty(hotelId) && Guid.TryParse(hotelId, out var parsedGuid))
        {
            hotelGuid = parsedGuid;
        }

        // Reservas (filtradas si hay hotelGuid)
        var reservationsQuery = _context.Reservations
            .Include(r => r.Hotel)
            .Include(r => r.RoomType)
            .AsQueryable();

        if (hotelGuid.HasValue)
        {
            reservationsQuery = reservationsQuery.Where(r => r.HotelId == hotelGuid.Value);
        }

        var reservations = await reservationsQuery.ToListAsync();

        // RoomTypes (filtradas si hay hotelGuid)
        var roomTypesQuery = _context.RoomTypes.Include(rt => rt.Hotel).AsQueryable();
        if (hotelGuid.HasValue)
        {
            roomTypesQuery = roomTypesQuery.Where(rt => rt.HotelId == hotelGuid.Value);
        }

        var roomTypes = await roomTypesQuery.ToListAsync();
        int totalRooms = roomTypes.Sum(rt => rt.Capacity);

        // Construcción del DTO
        var summary = new DashboardSummaryDto
        {
            TotalReservations = reservations.Count,
            ConfirmedReservations = reservations.Count(r => r.Status == "Confirmed"),
            PendingReservations = reservations.Count(r => r.Status == "Pending"),
            CancelledReservations = reservations.Count(r => r.Status == "Cancelled"),
            RecentReservations = reservations
                .OrderByDescending(r => r.CheckIn)
                .Take(5)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    HotelId = r.HotelId,
                    HotelName = r.Hotel.Name,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType.Name,
                    CheckIn = r.CheckIn,
                    CheckOut = r.CheckOut,
                    GuestName = r.GuestName,
                    Status = r.Status
                })
                .ToList(),

            TotalRooms = totalRooms,
            AvailableRoomsToday = totalRooms - reservations.Count(r => r.CheckIn <= today && r.CheckOut > today),

            // Lista de hoteles para filtro en frontend
            Hotels = await _context.Hotels
                .Select(h => new HotelDto { Id = h.Id, Name = h.Name })
                .ToListAsync()
        };

        // Ocupación últimos 7 días
        summary.OccupancyLast7Days = last7Days
            .Select(date => new OccupancyByDateDto
            {
                Date = date,
                TotalRooms = totalRooms,
                BookedRooms = reservations.Count(r => r.CheckIn <= date && r.CheckOut > date)
            })
            .ToList();

        return Ok(summary);
    }
}
