import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status-enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getTask(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    let tasks: Task[] = await this.taskRepository.find({
      where: {
        user: user,
      },
    });
    if (status) {
      tasks = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.status = :status AND user = :user', {
          status: status,
          user: user,
        })
        .getMany();
    }

    if (search) {
      tasks = await this.taskRepository
        .createQueryBuilder('task')
        .where(
          '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)) AND user = :user',
          {
            search: `%${search}%`,
            user: user,
          },
        )
        .getMany();
    }

    return tasks;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: {
        id: id,
        user: user,
      },
    });
    if (!found) {
      throw new NotFoundException();
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.taskRepository.create({
      title: title,
      description: description,
      status: TaskStatus.OPEN,
      user: user,
    });
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTaskById(id: string, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id: id, user: user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
  async updateTaskById(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    // await this.taskRepository.update(id, { status: status }); OK
    task.status = status;
    await this.taskRepository.save(task);
    return task;
  }
}
