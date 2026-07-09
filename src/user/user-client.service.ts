import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class UserClientService {
  private readonly logger = new Logger(UserClientService.name);
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env.USER_SERVICE_URL ?? 'http://localhost:3000';
    this.token = process.env.INTERNAL_SERVICE_TOKEN ?? '';
  }

  async findById(userId: string): Promise<UserDto> {
    const { data } = await firstValueFrom(
      this.http.get<UserDto>(`${this.baseUrl}/user/${userId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      }),
    );
    return data;
  }
}
