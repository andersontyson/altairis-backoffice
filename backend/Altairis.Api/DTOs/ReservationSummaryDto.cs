namespace Altairis.Api.DTOs;

public class ReservationSummaryDto
{
    public int TotalReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int PendingReservations { get; set; }
    public int CancelledReservations { get; set; }
    public List<ReservationDto> RecentReservations { get; set; } = new();
}
