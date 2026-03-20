import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
} from './entities/log-analysis-job.entity';
import { Repository } from 'typeorm';
import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';

@Injectable()
export class LogAnalysisJobsService {
  constructor(
    @InjectRepository(LogAnalysisJob) private repo: Repository<LogAnalysisJob>,
    private logSourcesService: LogSourcesService,
    private remoteServerService: RemoteServersService,
  ) {}

  async create(props: CreateLogAnalysisJobDto, ownerId: string) {
    const logSource = await this.logSourcesService.findOne(
      props.logSourceId,
      ownerId,
    );
    const remoteServer = await this.remoteServerService.findOne(
      props.remoteServerId,
      ownerId,
    );

    if (!logSource) {
      throw new BadRequestException('Log source not found');
    }
    if (!remoteServer) {
      throw new BadRequestException('Remote server not found');
    }

    const logAnalysisJob = this.repo.create({
      ...props,
      ownerId,
      status: LogAnalysisJobStatus.INITIALIZED,
      logSource,
      remoteServer,
    });

    return this.repo.save(logAnalysisJob);
  }

  findAll(ownerId: string) {
    return this.repo.find({ where: { ownerId } });
  }

  findOne(id: string, ownerId: string) {
    return this.repo.findOneBy({ id, ownerId });
  }

  async getById(id: string, ownerId: string) {
    const logAnalysisJob = await this.findOne(id, ownerId);
    if (!logAnalysisJob) {
      throw new NotFoundException('Log analysis job not found');
    }
    return logAnalysisJob;
  }

  async update(
    id: string,
    updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    ownerId,
  ) {
    const logAnalysisJob = await this.getById(id, ownerId);
    return this.repo.save({ ...updateLogAnalysisJobDto, ...logAnalysisJob });
  }

  async remove(id: string, ownerId: string) {
    return this.repo.delete({ id, ownerId });
  }
}
