import { Role, UserStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      status: UserStatus;
    }

    interface Request {
      user?: User;
    }
  }
}
