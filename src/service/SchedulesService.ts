import { ICreate } from '../interfaces/SchedulesInterface';
import { getHours, isBefore, startOfHour } from 'date-fns';
import { SchedulesRepository } from '../repositories/SchedulesRepository';

class ScheduleService {
  private scheduleRepository: SchedulesRepository;

  constructor() {
    this.scheduleRepository = new SchedulesRepository();
  }

  async create({ name, phone, date }: ICreate) {
    const dateFormatted = new Date(date);
    const hourStart = startOfHour(dateFormatted);
    const hour = getHours(hourStart);

    if (hour < 9 || hour >= 20) {
      throw new Error('Create a schedule between 9 p.m. and 19 p.m.');
    }

    if (isBefore(hourStart, new Date())) {
      throw new Error('It is not allowed to schedule old date');
    }

    const checkIsAvailable = await this.scheduleRepository.find(hourStart);

    if (checkIsAvailable) {
      throw new Error('Schedule date is not available');
    }

    const create = await this.scheduleRepository.create({
      name,
      phone,
      date: hourStart,
    });

    return create;
  }

  async index(date: Date) {
    const result = await this.scheduleRepository.findAll(date);

    return result;
  }

  async update(id: string, date: Date) {
    const dateFormatted = new Date(date);
    const hourStart = startOfHour(dateFormatted);
    const hour = getHours(hourStart);

    if (hour < 9 || hour >= 20) {
      throw new Error('Create a schedule between 9 p.m. and 19 p.m.');
    }

    if (isBefore(hourStart, new Date())) {
      throw new Error('It is not allowed to schedule old date');
    }

    const checkIsAvailable = await this.scheduleRepository.find(hourStart);

    if (checkIsAvailable) {
      throw new Error('Schedule date is not available');
    }

    const result = await this.scheduleRepository.update(id, date);

    return result;
  }
}

export { ScheduleService };
