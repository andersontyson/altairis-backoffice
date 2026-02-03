using Altairis.Api.DTOs;

public class DashboardSummaryDto
{
    // Reservas
    public int TotalReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int PendingReservations { get; set; }
    public int CancelledReservations { get; set; }
    public List<ReservationDto> RecentReservations { get; set; } = new();

    // Inventario / Disponibilidad
    public int TotalRooms { get; set; }
    public int AvailableRoomsToday { get; set; }
    public List<OccupancyByDateDto> OccupancyLast7Days { get; set; } = new();
    public List<HotelDto> Hotels { get; set; } = new();


}

public class OccupancyByDateDto
{
    public DateTime Date { get; set; }
    public int TotalRooms { get; set; }
    public int BookedRooms { get; set; }
    public int AvailableRooms => TotalRooms - BookedRooms;
}
