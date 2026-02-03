using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Altairis.Domain.Entities;

public class Inventory
{
    public Guid Id { get; set; }
    public Guid RoomTypeId { get; set; }
    public DateTime Date { get; set; }
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }

    public RoomType RoomType { get; set; } = null!;
}

