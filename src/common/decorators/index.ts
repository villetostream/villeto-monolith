import { Reflector } from '@nestjs/core';
import { SKIP_RESPONSE_INTERCEPTOR } from '../constants';

export const SkipResponse = Reflector.createDecorator<boolean>({
  key: SKIP_RESPONSE_INTERCEPTOR,
});
