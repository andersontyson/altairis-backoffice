using Altairis.Infrastructure.Persistence;
using Altairis.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Altairis.Api.DTOs;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly AltairisDbContext _context;

    public HotelsController(AltairisDbContext context)
    {
        _context = context;
    }

    // POST: api/hotels
    [HttpPost]
    public async Task<IActionResult> Create(Hotel hotel)
    {
        hotel.Id = Guid.NewGuid();
        hotel.CreatedAt = DateTime.UtcNow;
        hotel.IsActive = true;

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        return Ok(hotel);
    }

    // GET: api/hotels
    [HttpGet]
    public async Task<ActionResult<PagedResult<HotelDto>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Hotels
            .Where(h => h.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(h => h.Name.Contains(search) || h.City.Contains(search) || h.Country.Contains(search));
        }

        var totalItems = await query.CountAsync();
        var hotels = await query
            .OrderBy(h => h.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(h => h.RoomTypes)
            .Select(h => new HotelDto
            {
                Id = h.Id,
                Name = h.Name,
                Country = h.Country,
                City = h.City,
                Address = h.Address,
                RoomTypes = h.RoomTypes
                    .Where(rt => rt.IsActive)
                    .Select(rt => new RoomTypeDto
                    {
                        Id = rt.Id,
                        HotelId = rt.HotelId,
                        Name = rt.Name,
                        Capacity = rt.Capacity,
                        IsActive = rt.IsActive
                    })
            })
            .ToListAsync();

        return Ok(new PagedResult<HotelDto>
        {
            Items = hotels,
            TotalItems = totalItems,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
    }

    // PUT: api/hotels/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, HotelDto hotelDto)
    {
        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null)
            return NotFound();

        // Actualizar solo los campos permitidos
        hotel.Name = hotelDto.Name;
        hotel.Country = hotelDto.Country;
        hotel.City = hotelDto.City;
        hotel.Address = hotelDto.Address;

        _context.Hotels.Update(hotel);
        await _context.SaveChangesAsync();

        return NoContent(); // 204 OK
    }

    // DELETE: api/hotels/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null)
            return NotFound();

        // Validación: no eliminar si existen reservas activas (Pending o Confirmed)
        var hasActiveReservations = await _context.Reservations
            .AnyAsync(r => r.HotelId == id && (r.Status == "Pending" || r.Status == "Confirmed"));

        if (hasActiveReservations)
            return BadRequest("No se puede eliminar un hotel que tiene reservas pendientes o confirmadas.");

        // Soft delete
        hotel.IsActive = false;
        _context.Hotels.Update(hotel);
        await _context.SaveChangesAsync();

        return NoContent(); // 204 OK
    }

}
