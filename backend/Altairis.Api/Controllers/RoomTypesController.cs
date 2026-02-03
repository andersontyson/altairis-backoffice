using Altairis.Api.DTOs;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomTypesController : ControllerBase
{
    private readonly AltairisDbContext _context;

    public RoomTypesController(AltairisDbContext context)
    {
        _context = context;
    }

    // POST: api/roomtypes
    [HttpPost]
    public async Task<IActionResult> Create(CreateRoomTypeDto dto)
    {
        var roomType = new RoomType
        {
            Id = Guid.NewGuid(),
            HotelId = dto.HotelId,
            Name = dto.Name,
            Capacity = dto.Capacity,
            IsActive = true
        };

        _context.RoomTypes.Add(roomType);
        await _context.SaveChangesAsync();

        return Ok(roomType);
    }

    // PUT: api/roomtypes/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateRoomTypeDto dto)
    {
        var roomType = await _context.RoomTypes.FindAsync(id);
        if (roomType == null || !roomType.IsActive)
            return NotFound("Tipo de habitación no encontrado.");

        // Actualizar campos
        roomType.Name = dto.Name;
        roomType.Capacity = dto.Capacity;
        roomType.HotelId = dto.HotelId;

        _context.RoomTypes.Update(roomType);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/roomtypes
    [HttpGet]
    public async Task<ActionResult<PagedResult<RoomTypeDto>>> GetAll(
        [FromQuery] Guid? hotelId = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.RoomTypes
            .Where(rt => rt.IsActive);

        if (hotelId.HasValue)
        {
            query = query.Where(rt => rt.HotelId == hotelId.Value);
        }

        var totalItems = await query.CountAsync();
        var roomTypes = await query
            .OrderBy(rt => rt.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(rt => rt.Hotel)
            .Select(rt => new RoomTypeDto
            {
                Id = rt.Id,
                HotelId = rt.HotelId,
                Name = rt.Name,
                Capacity = rt.Capacity,
                IsActive = rt.IsActive,
                HotelName = rt.Hotel.Name
            })
            .ToListAsync();

        return Ok(new PagedResult<RoomTypeDto>
        {
            Items = roomTypes,
            TotalItems = totalItems,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
    }
}
