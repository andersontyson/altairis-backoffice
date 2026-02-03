using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
 

namespace Altairis.Domain.Entities;

public class Reservation
{
    public Guid Id { get; set; }
    public Guid HotelId { get; set; }
    public Guid RoomTypeId { get; set; }

    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }

    public string GuestName { get; set; } = null!;
    public string Status { get; set; } = "Confirmed"; // Confirmed / Cancelled

    public Hotel Hotel { get; set; } = null!;
    public RoomType RoomType { get; set; } = null!;
}

