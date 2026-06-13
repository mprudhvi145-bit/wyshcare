import { IsString, IsOptional, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  deviceToken: string;

  @IsOptional()
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform?: string;
}
