import { CustomError } from './CustomErr';

export default class UnauthorizedErr extends CustomError {
  status: number;

  constructor(message: string) {
    super(message, 401);
    this.status = 401;
  }
}