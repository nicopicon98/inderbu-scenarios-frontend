export async function createReservation(payload: {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}) {
  console.log("Creating reservation with payload:", payload);
  
  // Simulación de la creación de una reserva
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000),
        subScenarioId: payload.subScenarioId,
        timeSlotId: payload.timeSlotId,
        reservationDate: payload.reservationDate,
        status: "active",
        createdAt: new Date().toISOString()
      });
    }, 1000);
  });
}
