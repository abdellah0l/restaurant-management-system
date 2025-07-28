import { CustomError } from './CustomErr';

export default class NotFoundErr extends CustomError {
  status: number;

  constructor(message: string) {
    super(message, 404);
    this.status = 404;
  }
}

