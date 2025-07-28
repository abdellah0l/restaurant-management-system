import { CustomError } from './CustomErr';

//Used when a client wants to access a protected recource and
//the server doesn't know the client's identity
export default class UnauthorizedErr extends CustomError {
  status: number;

  constructor(message: string) {
    super(message, 401);
    this.status = 401;
  }
}