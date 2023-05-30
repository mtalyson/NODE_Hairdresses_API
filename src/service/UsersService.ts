import { hash } from 'bcrypt';
import { s3 } from '../config/aws';
import { v4 as uuid } from 'uuid';
import { ICreate, IUpdate } from '../interfaces/UsersInterface';
import { UsersRepository } from '../repositories/UsersRepository';

class UsersService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async create({ name, email, password }: ICreate) {
    const findUser = await this.usersRepository.findUserByEmail(email);

    if (findUser) {
      throw new Error('User exists');
    }

    const hashPassword = await hash(password, 10);

    const create = await this.usersRepository.create({
      name,
      email,
      password: hashPassword,
    });

    return create;
  }

  async update({ name, oldPassword, newPassword, avatar_url }: IUpdate) {
    const uploadImage = avatar_url?.buffer;
    const uploadS3 = await s3
      .upload({
        Bucket: 'hairdresses',
        Key: `${uuid()}-${avatar_url?.originalname}`,
        Body: uploadImage,
      })
      .promise();

    console.log('Image URL =', uploadS3.Location);
  }
}

export { UsersService };
