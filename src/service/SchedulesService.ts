import { ICreate } from '../interfaces/SchedulesInterface';
import { getHours, isBefore, startOfHour } from 'date-fns';
import { SchedulesRepository } from '../repositories/SchedulesRepository';

class ScheduleService {
  private schedulesRepository: SchedulesRepository;

  constructor() {
    this.schedulesRepository = new SchedulesRepository();
  }

  async create({ name, phone, date, user_id }: ICreate) {
    const dateFormatted = new Date(date);
    const hourStart = startOfHour(dateFormatted);
    const hour = getHours(hourStart);

    if (hour < 9 || hour >= 20) {
      throw new Error('Create a schedule between 9 p.m. and 19 p.m.');
    }

    if (isBefore(hourStart, new Date())) {
      throw new Error('It is not allowed to schedule old date');
    }

    const checkIsAvailable = await this.schedulesRepository.find(
      hourStart,
      user_id,
    );

    if (checkIsAvailable) {
      throw new Error('Schedule date is not available');
    }

    const create = await this.schedulesRepository.create({
      name,
      phone,
      date: hourStart,
      user_id,
    });

    return create;
  }

  async index(date: Date) {
    const result = await this.schedulesRepository.findAll(date);

    return result;
  }

  async update(id: string, date: Date, user_id: string) {
    const dateFormatted = new Date(date);
    const hourStart = startOfHour(dateFormatted);
    const hour = getHours(hourStart);

    if (hour < 9 || hour >= 20) {
      throw new Error('Create a schedule between 9 p.m. and 19 p.m.');
    }

    if (isBefore(hourStart, new Date())) {
      throw new Error('It is not allowed to schedule old date');
    }

    const checkIsAvailable = await this.schedulesRepository.find(
      hourStart,
      user_id,
    );

    if (checkIsAvailable) {
      throw new Error('Schedule date is not available');
    }

    const result = await this.schedulesRepository.update(id, date);

    return result;
  }

  async delete(id: string) {
    const checkExists = await this.schedulesRepository.findById(id);

    if (!checkExists) {
      throw new Error('Schedule doesnt exists');
    }

    const result = await this.schedulesRepository.delete(id);

    return result;
  }
}

export { ScheduleService };
