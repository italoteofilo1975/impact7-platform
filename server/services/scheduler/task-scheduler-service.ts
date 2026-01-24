import { emailDigestService } from '../notifications/email-digest-service';

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  lastRun: Date | null;
  nextRun: Date;
  isEnabled: boolean;
  handler: () => Promise<void>;
}

export interface TaskExecutionLog {
  taskId: string;
  taskName: string;
  startedAt: Date;
  completedAt: Date | null;
  status: 'running' | 'success' | 'failed';
  result?: string;
  error?: string;
}

/**
 * Task Scheduler Service
 * Manages scheduled tasks like email digests, cleanup jobs, etc.
 */
class TaskSchedulerService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private executionLogs: TaskExecutionLog[] = [];
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    this.registerDefaultTasks();
  }

  /**
   * Register default scheduled tasks
   */
  private registerDefaultTasks(): void {
    // Daily digest at 8:00 AM
    this.registerTask({
      id: 'daily_digest',
      name: 'Digest Diário',
      description: 'Envia resumo diário de notificações não lidas',
      cronExpression: '0 8 * * *', // Every day at 8 AM
      isEnabled: true,
      handler: async () => {
        const result = await emailDigestService.sendDigestEmails('daily');
        console.log(`[Scheduler] Daily digest: ${result.sent} sent, ${result.failed} failed`);
      },
    });

    // Weekly digest on Monday at 8:00 AM
    this.registerTask({
      id: 'weekly_digest',
      name: 'Digest Semanal',
      description: 'Envia resumo semanal de notificações não lidas',
      cronExpression: '0 8 * * 1', // Every Monday at 8 AM
      isEnabled: true,
      handler: async () => {
        const result = await emailDigestService.sendDigestEmails('weekly');
        console.log(`[Scheduler] Weekly digest: ${result.sent} sent, ${result.failed} failed`);
      },
    });

    // Notification cleanup every day at 3 AM
    this.registerTask({
      id: 'notification_cleanup',
      name: 'Limpeza de Notificações',
      description: 'Remove notificações antigas (mais de 90 dias)',
      cronExpression: '0 3 * * *', // Every day at 3 AM
      isEnabled: true,
      handler: async () => {
        // This would call a cleanup function
        console.log('[Scheduler] Notification cleanup executed');
      },
    });

    // Auto alerts check every 6 hours
    this.registerTask({
      id: 'auto_alerts',
      name: 'Alertas Automáticos',
      description: 'Verifica cases pendentes e métricas críticas',
      cronExpression: '0 */6 * * *', // Every 6 hours
      isEnabled: true,
      handler: async () => {
        const { autoAlertService } = await import('../alerts/auto-alert-service');
        const result = await autoAlertService.runAllChecks();
        console.log(`[Scheduler] Auto alerts: ${result.summary}`);
      },
    });
  }

  /**
   * Register a new scheduled task
   */
  registerTask(config: Omit<ScheduledTask, 'lastRun' | 'nextRun'>): void {
    const nextRun = this.calculateNextRun(config.cronExpression);
    
    this.tasks.set(config.id, {
      ...config,
      lastRun: null,
      nextRun,
    });

    console.log(`[Scheduler] Task registered: ${config.name} (${config.id})`);
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(cronExpression: string): Date {
    const now = new Date();
    const parts = cronExpression.split(' ');
    
    if (parts.length !== 5) {
      // Default to next hour if invalid cron
      return new Date(now.getTime() + 60 * 60 * 1000);
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    const next = new Date(now);

    // Simple parsing for common patterns
    if (hour !== '*') {
      next.setHours(parseInt(hour, 10));
    }
    if (minute !== '*') {
      next.setMinutes(parseInt(minute, 10));
    }
    next.setSeconds(0);
    next.setMilliseconds(0);

    // If the calculated time is in the past, move to next occurrence
    if (next <= now) {
      if (dayOfWeek !== '*') {
        // Weekly task
        const targetDay = parseInt(dayOfWeek, 10);
        const currentDay = next.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
        next.setDate(next.getDate() + daysUntilTarget);
      } else {
        // Daily task
        next.setDate(next.getDate() + 1);
      }
    }

    return next;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('[Scheduler] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[Scheduler] Starting task scheduler...');

    // Check tasks every minute
    const checkInterval = setInterval(() => {
      this.checkAndExecuteTasks();
    }, 60 * 1000);

    this.intervals.set('main', checkInterval);

    // Initial check
    this.checkAndExecuteTasks();

    console.log(`[Scheduler] Started with ${this.tasks.size} tasks`);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    for (const [id, interval] of Array.from(this.intervals.entries())) {
      clearInterval(interval);
    }
    this.intervals.clear();

    console.log('[Scheduler] Stopped');
  }

  /**
   * Check and execute due tasks
   */
  private async checkAndExecuteTasks(): Promise<void> {
    const now = new Date();

    for (const [id, task] of Array.from(this.tasks.entries())) {
      if (!task.isEnabled) continue;

      if (task.nextRun <= now) {
        await this.executeTask(id);
      }
    }
  }

  /**
   * Execute a specific task
   */
  async executeTask(taskId: string): Promise<TaskExecutionLog> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const log: TaskExecutionLog = {
      taskId,
      taskName: task.name,
      startedAt: new Date(),
      completedAt: null,
      status: 'running',
    };

    this.executionLogs.unshift(log);
    // Keep only last 100 logs
    if (this.executionLogs.length > 100) {
      this.executionLogs.pop();
    }

    console.log(`[Scheduler] Executing task: ${task.name}`);

    try {
      await task.handler();
      
      log.status = 'success';
      log.completedAt = new Date();
      log.result = 'Task completed successfully';

      // Update task
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.cronExpression);

      console.log(`[Scheduler] Task completed: ${task.name}`);
    } catch (error) {
      log.status = 'failed';
      log.completedAt = new Date();
      log.error = error instanceof Error ? error.message : 'Unknown error';

      console.error(`[Scheduler] Task failed: ${task.name}`, error);
    }

    return log;
  }

  /**
   * Get all registered tasks
   */
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values()).map(task => ({
      ...task,
      handler: undefined as any, // Don't expose handler function
    }));
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    const task = this.tasks.get(taskId);
    if (task) {
      return { ...task, handler: undefined as any };
    }
    return undefined;
  }

  /**
   * Enable/disable a task
   */
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.isEnabled = enabled;
    console.log(`[Scheduler] Task ${taskId} ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  /**
   * Get execution logs
   */
  getExecutionLogs(limit = 50): TaskExecutionLog[] {
    return this.executionLogs.slice(0, limit);
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    taskCount: number;
    enabledTaskCount: number;
    lastExecution: TaskExecutionLog | null;
    uptime: number;
  } {
    const enabledTasks = Array.from(this.tasks.values()).filter(t => t.isEnabled);
    
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.size,
      enabledTaskCount: enabledTasks.length,
      lastExecution: this.executionLogs[0] || null,
      uptime: this.isRunning ? Date.now() : 0,
    };
  }

  /**
   * Manually trigger a task
   */
  async triggerTask(taskId: string): Promise<TaskExecutionLog> {
    return this.executeTask(taskId);
  }
}

// Singleton instance
export const taskSchedulerService = new TaskSchedulerService();

// Auto-start scheduler when module is loaded
// Uncomment in production:
// taskSchedulerService.start();
