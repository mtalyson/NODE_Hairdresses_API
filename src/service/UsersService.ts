import { compare, hash } from 'bcrypt';
import { s3 } from '../config/aws';
import { v4 as uuid } from 'uuid';
import { ICreate, IUpdate } from '../interfaces/UsersInterface';
import { UsersRepository } from '../repositories/UsersRepository';
import { sign, verify } from 'jsonwebtoken';

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

  async update({
    name,
    oldPassword,
    newPassword,
    avatar_url,
    user_id,
  }: IUpdate) {
    if (name) {
      await this.usersRepository.updateName(name, user_id);
    }

    if (oldPassword && newPassword) {
      const findUserById = await this.usersRepository.findUserById(user_id);

      if (!findUserById) {
        throw new Error('User not found.');
      }

      const passwordMatch = await compare(oldPassword, findUserById.password);

      if (!passwordMatch) {
        throw new Error('Password invalid.');
      }

      const hashPassword = await hash(newPassword, 10);

      await this.usersRepository.updatePassword(hashPassword, user_id);
    }

    if (avatar_url) {
      const uploadImage = avatar_url?.buffer;
      const uploadS3 = await s3
        .upload({
          Bucket: 'hairdresses',
          Key: `${uuid()}-${avatar_url?.originalname}`,
          Body: uploadImage,
        })
        .promise();

      await this.usersRepository.updateAvatar(uploadS3.Location, user_id);
    }

    return {
      message: 'User updated successfully',
    };
  }

  async auth(email: string, password: string) {
    const findUser = await this.usersRepository.findUserByEmail(email);

    if (!findUser) {
      throw new Error('Email ou senha inválidos.');
    }

    const passwordMatch = await compare(password, findUser.password);

    if (!passwordMatch) {
      throw new Error('Email ou senha inválidos.');
    }

    let secretKeyToken: string | undefined = process.env.ACCESS_KEY_TOKEN;

    if (!secretKeyToken) {
      throw new Error('There is no token key.');
    }

    let secretKeyRefreshToken: string | undefined =
      process.env.ACCESS_KEY_TOKEN_REFRESH;

    if (!secretKeyRefreshToken) {
      throw new Error('There is no refresh_token key.');
    }

    const token = sign({ email }, secretKeyToken, {
      subject: findUser.id,
      expiresIn: '1h',
    });

    const refreshToken = sign({ email }, secretKeyRefreshToken, {
      subject: findUser.id,
      expiresIn: '7d',
    });

    return {
      token,
      refresh_token: refreshToken,
      user: {
        name: findUser.name,
        email: findUser.email,
      },
    };
  }

  async refresh(refresh_token: string) {
    if (!refresh_token) {
      throw new Error('Refresh token missing.');
    }

    let secretKeyToken: string | undefined = process.env.ACCESS_KEY_TOKEN;

    if (!secretKeyToken) {
      throw new Error('There is no token key.');
    }

    let secretKeyRefreshToken: string | undefined =
      process.env.ACCESS_KEY_TOKEN_REFRESH;

    if (!secretKeyRefreshToken) {
      throw new Error('There is no refresh token key.');
    }

    const verifyRefreshToken = await verify(
      refresh_token,
      secretKeyRefreshToken,
    );
    const { sub } = verifyRefreshToken;

    const newToken = sign({ sub }, secretKeyToken, {
      expiresIn: '1h',
    });

    const refreshToken = sign({ sub }, secretKeyRefreshToken, {
      expiresIn: '7d',
    });

    return { token: newToken, refresh_token: refreshToken };
  }
}

export { UsersService };
