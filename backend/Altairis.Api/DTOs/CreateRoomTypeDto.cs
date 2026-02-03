using System.ComponentModel.DataAnnotations;

namespace Altairis.Api.DTOs;

public class CreateRoomTypeDto
{
    [Required]
    public Guid HotelId { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Range(1, 10)]
    public int Capacity { get; set; }
}
