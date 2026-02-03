using System;
using System.ComponentModel.DataAnnotations;

namespace Altairis.Api.DTOs
{
    public class CreateInventoryDto
    {
        [Required]
        public Guid RoomTypeId { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Range(1, 1000)]
        public int TotalRooms { get; set; }

        [Range(0, 1000)]
        public int AvailableRooms { get; set; }
    }

    public class InventoryDto
    {
        public Guid Id { get; set; }
        public Guid RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = null!;
        public string HotelName { get; set; } = null!;
        public DateTime Date { get; set; }
        public int TotalRooms { get; set; }
        public int AvailableRooms { get; set; }
    }
}
