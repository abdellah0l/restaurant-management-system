import { CustomError } from './CustomErr';

export default class BadRequestErr extends CustomError {
  status: number;

  constructor(message: string) {
    super(message, 400);
    this.status = 400;
  }
}
