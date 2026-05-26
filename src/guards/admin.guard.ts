import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.currentUser?.role === Role.ADMIN;
  }
}
