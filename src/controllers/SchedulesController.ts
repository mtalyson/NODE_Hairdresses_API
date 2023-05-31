import { NextFunction, Request, Response } from 'express';
import { ScheduleService } from '../service/SchedulesService';

class SchedulesController {
  private scheduleService: ScheduleService;

  constructor() {
    this.scheduleService = new ScheduleService();
  }

  async store(request: Request, response: Response, next: NextFunction) {
    const { name, phone, date } = request.body;

    try {
      const result = await this.scheduleService.create({ name, phone, date });

      return response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export { SchedulesController };
