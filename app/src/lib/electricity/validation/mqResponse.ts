import {z} from 'zod';
import {MQStatusEnum} from '../types/mqStatusEnum';

export const mQStatusEnumSchema = z.nativeEnum(MQStatusEnum);

export function convertMQStatusEnumToString(status: MQStatusEnum): string {
  switch (status) {
    case MQStatusEnum.Connected:
      return 'Connected';
    case MQStatusEnum.Connecting:
      return 'Connecting';
    case MQStatusEnum.Disconnected:
      return 'Disconnected';
    case MQStatusEnum.Error:
      return 'Error';
    default:
      throw new Error('Invalid MQStatusEnum value');
  }
}