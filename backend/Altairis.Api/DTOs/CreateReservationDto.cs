using System;
using System.ComponentModel.DataAnnotations;

namespace Altairis.Api.DTOs;

public class CreateReservationDto
{
    [Required]
    public Guid HotelId { get; set; }

    [Required]
    public Guid RoomTypeId { get; set; }

    [Required]
    public DateTime CheckIn { get; set; }

    [Required]
    public DateTime CheckOut { get; set; }

    [Required]
    [StringLength(100)]
    public string GuestName { get; set; } = null!;
}

public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public string HotelName { get; set; } = null!;
    public Guid RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = null!;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string GuestName { get; set; } = null!;
    public string Status { get; set; } = null!;
}
