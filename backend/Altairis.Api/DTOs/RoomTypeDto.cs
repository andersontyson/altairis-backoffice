namespace Altairis.Api.DTOs;

public class RoomTypeDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string Name { get; set; } = null!;
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
    public string HotelName { get; set; } = null!;
}

 

public class UpdateRoomTypeDto
{
    public Guid HotelId { get; set; }
    public string Name { get; set; } = null!;
    public int Capacity { get; set; }
}
