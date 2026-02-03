using Altairis.Api.DTOs;

public class HotelDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Country { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Address { get; set; } = null!;
    public IEnumerable<RoomTypeDto> RoomTypes { get; set; } = new List<RoomTypeDto>();
}
