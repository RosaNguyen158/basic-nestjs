import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TasksModule,
    TypeOrmModule.forRoot({
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      type: 'postgres',
      host: 'ec2-34-199-68-114.compute-1.amazonaws.com',
      port: 5432,
      username: 'zflrsrvsniilui',
      password:
        'daaa77560bf8ba5ae18b1e83160824b192b2aa619d36838f9d888ca6e33aea1e',
      database: 'dd5is1mbaarjmc',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
