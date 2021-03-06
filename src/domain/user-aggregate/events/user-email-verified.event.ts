import { DomainEvent } from '../../seed-work';
import { User } from '../user';

export class UserEmailVerifiedEvent extends DomainEvent {
  constructor(public readonly user: User) {
    super(new Date());
  }
}
