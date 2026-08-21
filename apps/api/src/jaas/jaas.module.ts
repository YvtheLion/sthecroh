import { Global, Module } from '@nestjs/common';
import { JaasService } from './jaas.service';

@Global()
@Module({
  providers: [JaasService],
  exports: [JaasService],
})
export class JaasModule {}
