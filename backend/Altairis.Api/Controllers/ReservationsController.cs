using Altairis.Api.DTOs;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly AltairisDbContext _context;

    public ReservationsController(AltairisDbContext context)
    {
        _context = context;
    }

    // GET: api/reservations/summary
    [HttpGet("summary")]
    public async Task<ActionResult<ReservationSummaryDto>> GetSummary()
    {
        var reservations = await _context.Reservations
            .Include(r => r.Hotel)
            .Include(r => r.RoomType)
            .ToListAsync();

        var summary = new ReservationSummaryDto
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
                .ToList()
        };

        return Ok(summary);
    }

    // POST: api/reservations
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto dto)
    {
        if (dto.CheckOut <= dto.CheckIn)
            return BadRequest("CheckOut must be after CheckIn.");

        var hotel = await _context.Hotels.FindAsync(dto.HotelId);
        if (hotel == null) return NotFound("Hotel not found.");

        var roomType = await _context.RoomTypes
            .Include(rt => rt.Hotel)
            .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId && rt.HotelId == dto.HotelId);

        if (roomType == null) return NotFound("RoomType not found for this hotel.");

        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            HotelId = dto.HotelId,
            RoomTypeId = dto.RoomTypeId,
            CheckIn = dto.CheckIn.Date,
            CheckOut = dto.CheckOut.Date,
            GuestName = dto.GuestName,
            Status = "Confirmed"
        };

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();

        var reservationDto = new ReservationDto
        {
            Id = reservation.Id,
            HotelId = hotel.Id,
            HotelName = hotel.Name,
            RoomTypeId = roomType.Id,
            RoomTypeName = roomType.Name,
            CheckIn = reservation.CheckIn,
            CheckOut = reservation.CheckOut,
            GuestName = reservation.GuestName,
            Status = reservation.Status
        };

        return Ok(reservationDto);
    }

    // GET: api/reservations
    [HttpGet]
    public async Task<ActionResult<PagedResult<ReservationDto>>> GetAll(
        [FromQuery] Guid? hotelId = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Reservations
            .Include(r => r.Hotel)
            .Include(r => r.RoomType)
            .AsQueryable();

        if (hotelId.HasValue)
            query = query.Where(r => r.HotelId == hotelId.Value);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        if (fromDate.HasValue)
            query = query.Where(r => r.CheckIn >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(r => r.CheckOut <= toDate.Value);

        var totalItems = await query.CountAsync();
        var reservations = await query
            .OrderByDescending(r => r.CheckIn)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
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
            .ToListAsync();

        return Ok(new PagedResult<ReservationDto>
        {
            Items = reservations,
            TotalItems = totalItems,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
    }

    // GET: api/reservations/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ReservationDto>> GetById(Guid id)
    {
        var reservation = await _context.Reservations
            .Include(r => r.Hotel)
            .Include(r => r.RoomType)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null) return NotFound();

        return Ok(new ReservationDto
        {
            Id = reservation.Id,
            HotelId = reservation.HotelId,
            HotelName = reservation.Hotel.Name,
            RoomTypeId = reservation.RoomTypeId,
            RoomTypeName = reservation.RoomType.Name,
            CheckIn = reservation.CheckIn,
            CheckOut = reservation.CheckOut,
            GuestName = reservation.GuestName,
            Status = reservation.Status
        });
    }

    // PUT: api/reservations/{id} -> actualizar estado
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] string status)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        if (status != "Confirmed" && status != "Cancelled")
            return BadRequest("Invalid status. Allowed: Confirmed / Cancelled");

        reservation.Status = status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/reservations/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return NotFound();

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
