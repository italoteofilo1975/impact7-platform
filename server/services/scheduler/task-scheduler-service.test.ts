import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskSchedulerService } from './task-scheduler-service';

describe('TaskSchedulerService', () => {
  afterEach(() => {
    // Stop scheduler after each test
    taskSchedulerService.stop();
  });

  describe('getTasks', () => {
    it('deve retornar lista de tarefas registradas', () => {
      const tasks = taskSchedulerService.getTasks();

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('deve incluir tarefas padrão', () => {
      const tasks = taskSchedulerService.getTasks();
      const taskIds = tasks.map(t => t.id);

      expect(taskIds).toContain('daily_digest');
      expect(taskIds).toContain('weekly_digest');
      expect(taskIds).toContain('notification_cleanup');
    });

    it('cada tarefa deve ter propriedades obrigatórias', () => {
      const tasks = taskSchedulerService.getTasks();

      for (const task of tasks) {
        expect(task.id).toBeDefined();
        expect(task.name).toBeDefined();
        expect(task.description).toBeDefined();
        expect(task.cronExpression).toBeDefined();
        expect(typeof task.isEnabled).toBe('boolean');
        expect(task.nextRun).toBeInstanceOf(Date);
      }
    });
  });

  describe('getTask', () => {
    it('deve retornar tarefa específica por ID', () => {
      const task = taskSchedulerService.getTask('daily_digest');

      expect(task).toBeDefined();
      expect(task?.id).toBe('daily_digest');
      expect(task?.name).toBe('Digest Diário');
    });

    it('deve retornar undefined para tarefa inexistente', () => {
      const task = taskSchedulerService.getTask('non_existent_task');

      expect(task).toBeUndefined();
    });
  });

  describe('setTaskEnabled', () => {
    it('deve habilitar/desabilitar tarefa', () => {
      // Disable
      const result1 = taskSchedulerService.setTaskEnabled('daily_digest', false);
      expect(result1).toBe(true);
      
      let task = taskSchedulerService.getTask('daily_digest');
      expect(task?.isEnabled).toBe(false);

      // Re-enable
      const result2 = taskSchedulerService.setTaskEnabled('daily_digest', true);
      expect(result2).toBe(true);
      
      task = taskSchedulerService.getTask('daily_digest');
      expect(task?.isEnabled).toBe(true);
    });

    it('deve retornar false para tarefa inexistente', () => {
      const result = taskSchedulerService.setTaskEnabled('non_existent', true);
      expect(result).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('deve retornar status do scheduler', () => {
      const status = taskSchedulerService.getStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('taskCount');
      expect(status).toHaveProperty('enabledTaskCount');
      expect(status).toHaveProperty('lastExecution');
      expect(status).toHaveProperty('uptime');
    });

    it('deve mostrar contagem correta de tarefas', () => {
      const status = taskSchedulerService.getStatus();
      const tasks = taskSchedulerService.getTasks();

      expect(status.taskCount).toBe(tasks.length);
    });
  });

  describe('getExecutionLogs', () => {
    it('deve retornar array de logs', () => {
      const logs = taskSchedulerService.getExecutionLogs();

      expect(Array.isArray(logs)).toBe(true);
    });

    it('deve respeitar limite de logs', () => {
      const logs = taskSchedulerService.getExecutionLogs(10);

      expect(logs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('start/stop', () => {
    it('deve iniciar e parar o scheduler', () => {
      // Start
      taskSchedulerService.start();
      let status = taskSchedulerService.getStatus();
      expect(status.isRunning).toBe(true);

      // Stop
      taskSchedulerService.stop();
      status = taskSchedulerService.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it('não deve falhar ao chamar start múltiplas vezes', () => {
      taskSchedulerService.start();
      taskSchedulerService.start(); // Should not throw
      
      const status = taskSchedulerService.getStatus();
      expect(status.isRunning).toBe(true);
    });
  });
});
