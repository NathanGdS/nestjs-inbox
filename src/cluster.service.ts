import cluster, { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';
import { Logger } from '@nestjs/common';

const numCpus = availableParallelism();
const isPrimary =
  typeof cluster?.isPrimary === 'boolean' ? cluster.isPrimary : false;

export class ClusterService {
  private readonly logger = new Logger(ClusterService.name);

  /**
   * Inicializa a aplicação em modo cluster.
   * @param callback Função assíncrona para inicializar a aplicação.
   */
  static async initialize(callback: () => Promise<void>) {
    const service = new ClusterService();

    if (isPrimary) {
      service.logPrimaryProcess();
      service.forkWorkers();
      service.registerEventHandlers();
    } else {
      service.runWorker(callback);
    }
  }

  private logPrimaryProcess() {
    this.logger.log(`Primary process PID: ${process.pid}`);
    this.logger.log(`Number of CPU Threads: ${numCpus}`);
  }

  private forkWorkers() {
    for (let i = 0; i < numCpus; i++) {
      cluster.fork();
    }
  }

  private registerEventHandlers() {
    cluster.on('fork', this.handleFork.bind(this));
    cluster.on('exit', this.handleExit.bind(this));
    cluster.on('message', this.handleMessage.bind(this));
  }

  private handleFork(worker: Worker) {
    this.logger.log(`Worker started: PID ${worker.process.pid}`);
  }

  private handleExit(worker: Worker, code: number, signal: string | null) {
    this.logger.warn(
      `Worker PID ${worker.process.pid} exited with code ${code} and signal ${signal}. Restarting...`
    );
    cluster.fork();
  }

  private handleMessage(worker: Worker, message: any) {
    this.logger.log(
      `Message from worker PID ${worker.process.pid}: ${JSON.stringify(
        message
      )}`
    );
  }

  private async runWorker(callback: () => Promise<void>) {
    try {
      await callback();
    } catch (error) {
      this.logger.error(`Worker PID ${process.pid} failed to start`, error);
      process.exit(1);
    }
  }
}
