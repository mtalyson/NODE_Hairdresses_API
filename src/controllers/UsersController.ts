import { NextFunction, Request, Response } from 'express';
import { UsersService } from '../service/UsersService';

class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  index() {
    //search all
  }

  show() {
    //search one
  }

  async store(request: Request, response: Response, next: NextFunction) {
    const { name, email, password } = request.body;

    try {
      const result = await this.usersService.create({ name, email, password });

      return response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  auth() {
    //authentication
  }

  async update(request: Request, response: Response, next: NextFunction) {
    const { name, oldPassword, newPassword } = request.body;

    try {
      const result = await this.usersService.update({
        name,
        oldPassword,
        newPassword,
        avatar_url: request.file,
      });

      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export { UsersController };
