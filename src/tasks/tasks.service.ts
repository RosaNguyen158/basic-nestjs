import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status-enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getTask(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;
    let tasks: Task[] = [];
    if (status) {
      tasks = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.status = :status', {
          status: status,
        })
        .getMany();
    }

    if (search) {
      tasks = await this.taskRepository
        .createQueryBuilder('task')
        .where(
          'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
          {
            search: `%${search}%`,
          },
        )
        .getMany();
    }

    return tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    const found = await this.taskRepository.findOneBy({ id: id });
    if (!found) {
      throw new NotFoundException();
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.taskRepository.create({
      title: title,
      description: description,
      status: TaskStatus.OPEN,
    });
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTaskById(id: string): Promise<void> {
    const result = await this.taskRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
  async updateTaskById(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    // await this.taskRepository.update(id, { status: status }); OK
    task.status = status;
    await this.taskRepository.save(task);
    return task;
  }
}
