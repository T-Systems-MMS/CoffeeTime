import { Injectable } from '@nestjs/common';
import { Filling } from 'domain/filling';

@Injectable()
export class StorageService {
  updateHistory(roomId: string, fillings: Filling[]): void{

  }
}
