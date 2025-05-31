import { IGetAllTimeSlotResponse } from "../interfaces/get-all-time-slot-res.interface";
import { IGetAllTimeSlotRequest } from "../interfaces/get-all-time-slot-req.interface";
import { apiClient } from "@/shared/api";

export class TimeSlotService {
  static async getAllTimeSlots({
    subScenarioId,
    date,
  }: IGetAllTimeSlotRequest): Promise<IGetAllTimeSlotResponse[]> {
    const availableTimeslots: IGetAllTimeSlotResponse[] =
      await apiClient.getCollection<IGetAllTimeSlotResponse>(
        `/reservations/available-timeslots?subScenarioId=${subScenarioId}&date=${date}`,
        {
          cacheStrategy: "LongTerm",
        },
      );
    return availableTimeslots;
  }
}
