using Altairis.Api.DTOs;
using Altairis.Domain.Entities;
using Altairis.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Altairis.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoriesController : ControllerBase
    {
        private readonly AltairisDbContext _context;

        public InventoriesController(AltairisDbContext context)
        {
            _context = context;
        }

        // POST: api/inventories
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInventoryDto dto)
        {
            if (dto.AvailableRooms > dto.TotalRooms)
                return BadRequest("AvailableRooms cannot exceed TotalRooms.");

            var roomType = await _context.RoomTypes
                .Include(rt => rt.Hotel)
                .FirstOrDefaultAsync(rt => rt.Id == dto.RoomTypeId);

            if (roomType == null)
                return NotFound("RoomType not found.");

            // Evitar duplicados: misma fecha y RoomType
            var exists = await _context.Inventories.AnyAsync(i =>
                i.RoomTypeId == dto.RoomTypeId && i.Date.Date == dto.Date.Date);

            if (exists)
                return BadRequest("Inventory for this RoomType and Date already exists.");

            var inventory = new Inventory
            {
                Id = Guid.NewGuid(),
                RoomTypeId = dto.RoomTypeId,
                Date = dto.Date.Date,
                TotalRooms = dto.TotalRooms,
                AvailableRooms = dto.AvailableRooms
            };

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            var inventoryDto = new InventoryDto
            {
                Id = inventory.Id,
                RoomTypeId = inventory.RoomTypeId,
                RoomTypeName = roomType.Name,
                HotelName = roomType.Hotel.Name,
                Date = inventory.Date,
                TotalRooms = inventory.TotalRooms,
                AvailableRooms = inventory.AvailableRooms
            };

            return Ok(inventoryDto);
        }

        // GET: api/inventories
        [HttpGet]
        public async Task<ActionResult<PagedResult<InventoryDto>>> GetAvailability(
            [FromQuery] Guid hotelId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 100)
        {
            var query = _context.Inventories
                .Include(i => i.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .Where(i => i.Date >= fromDate && i.Date <= toDate && i.RoomType.HotelId == hotelId);

            var totalItems = await query.CountAsync();
            var availability = await query
                .OrderBy(i => i.Date)
                .ThenBy(i => i.RoomType.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(i => new InventoryDto
                {
                    Id = i.Id,
                    RoomTypeId = i.RoomTypeId,
                    RoomTypeName = i.RoomType.Name,
                    HotelName = i.RoomType.Hotel.Name,
                    Date = i.Date,
                    TotalRooms = i.TotalRooms,
                    AvailableRooms = i.AvailableRooms
                })
                .ToListAsync();

            return Ok(new PagedResult<InventoryDto>
            {
                Items = availability,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        // GET: api/inventories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryDto>> GetById(Guid id)
        {
            var inventory = await _context.Inventories
                .Include(i => i.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .Where(i => i.Id == id)
                .Select(i => new InventoryDto
                {
                    Id = i.Id,
                    RoomTypeId = i.RoomTypeId,
                    RoomTypeName = i.RoomType.Name,
                    HotelName = i.RoomType.Hotel.Name,
                    Date = i.Date,
                    TotalRooms = i.TotalRooms,
                    AvailableRooms = i.AvailableRooms
                })
                .FirstOrDefaultAsync();

            if (inventory == null) return NotFound();
            return Ok(inventory);
        }

        // PUT: api/inventories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateInventoryDto dto)
        {
            var inventory = await _context.Inventories
                .Include(i => i.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (inventory == null) return NotFound("Inventory not found.");
            if (dto.AvailableRooms > dto.TotalRooms) return BadRequest("AvailableRooms cannot exceed TotalRooms.");

            // Evitar duplicados al actualizar
            var duplicate = await _context.Inventories.AnyAsync(i =>
                i.RoomTypeId == dto.RoomTypeId &&
                i.Date.Date == dto.Date.Date &&
                i.Id != id);

            if (duplicate) return BadRequest("Another inventory entry exists for this RoomType and Date.");

            inventory.Date = dto.Date.Date;
            inventory.TotalRooms = dto.TotalRooms;
            inventory.AvailableRooms = dto.AvailableRooms;

            await _context.SaveChangesAsync();

            var inventoryDto = new InventoryDto
            {
                Id = inventory.Id,
                RoomTypeId = inventory.RoomTypeId,
                RoomTypeName = inventory.RoomType.Name,
                HotelName = inventory.RoomType.Hotel.Name,
                Date = inventory.Date,
                TotalRooms = inventory.TotalRooms,
                AvailableRooms = inventory.AvailableRooms
            };

            return Ok(inventoryDto);
        }

        // DELETE: api/inventories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var inventory = await _context.Inventories.FindAsync(id);
            if (inventory == null) return NotFound();

            _context.Inventories.Remove(inventory);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
