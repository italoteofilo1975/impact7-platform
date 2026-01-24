import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationTemplateService } from './notification-template-service';

describe('NotificationTemplateService', () => {
  describe('renderTemplate', () => {
    it('deve substituir variáveis simples', () => {
      const template = 'Olá {{userName}}, seu case foi aprovado!';
      const variables = { userName: 'João' };
      
      const result = notificationTemplateService.renderTemplate(template, variables);
      
      expect(result).toBe('Olá João, seu case foi aprovado!');
    });

    it('deve substituir múltiplas variáveis', () => {
      const template = 'Case "{{caseName}}" aprovado por {{reviewerName}} em {{date}}';
      const variables = { 
        caseName: 'Projeto Educação',
        reviewerName: 'Admin',
        date: '14/01/2026'
      };
      
      const result = notificationTemplateService.renderTemplate(template, variables);
      
      expect(result).toBe('Case "Projeto Educação" aprovado por Admin em 14/01/2026');
    });

    it('deve lidar com variáveis com espaços', () => {
      const template = 'Olá {{ userName }}, bem-vindo!';
      const variables = { userName: 'Maria' };
      
      const result = notificationTemplateService.renderTemplate(template, variables);
      
      expect(result).toBe('Olá Maria, bem-vindo!');
    });

    it('deve manter variáveis não encontradas', () => {
      const template = 'Olá {{userName}}, seu saldo é {{balance}}';
      const variables = { userName: 'Pedro' };
      
      const result = notificationTemplateService.renderTemplate(template, variables);
      
      expect(result).toBe('Olá Pedro, seu saldo é {{balance}}');
    });

    it('deve substituir múltiplas ocorrências da mesma variável', () => {
      const template = '{{userName}} ganhou tokens! Parabéns, {{userName}}!';
      const variables = { userName: 'Ana' };
      
      const result = notificationTemplateService.renderTemplate(template, variables);
      
      expect(result).toBe('Ana ganhou tokens! Parabéns, Ana!');
    });
  });

  describe('getVariablesForType', () => {
    it('deve retornar variáveis comuns para qualquer tipo', () => {
      const variables = notificationTemplateService.getVariablesForType('info');
      
      const varNames = variables.map(v => v.name);
      expect(varNames).toContain('userName');
      expect(varNames).toContain('userEmail');
      expect(varNames).toContain('date');
      expect(varNames).toContain('time');
    });

    it('deve retornar variáveis específicas para case_approved', () => {
      const variables = notificationTemplateService.getVariablesForType('case_approved');
      
      const varNames = variables.map(v => v.name);
      expect(varNames).toContain('caseName');
      expect(varNames).toContain('caseId');
      expect(varNames).toContain('reviewerName');
      expect(varNames).toContain('approvalDate');
    });

    it('deve retornar variáveis específicas para certificate_issued', () => {
      const variables = notificationTemplateService.getVariablesForType('certificate_issued');
      
      const varNames = variables.map(v => v.name);
      expect(varNames).toContain('certificateId');
      expect(varNames).toContain('certificateHash');
      expect(varNames).toContain('projectName');
      expect(varNames).toContain('impactScore');
    });

    it('deve retornar variáveis específicas para token_earned', () => {
      const variables = notificationTemplateService.getVariablesForType('token_earned');
      
      const varNames = variables.map(v => v.name);
      expect(varNames).toContain('tokenAmount');
      expect(varNames).toContain('tokenType');
      expect(varNames).toContain('reason');
    });

    it('deve incluir descrição e exemplo para cada variável', () => {
      const variables = notificationTemplateService.getVariablesForType('case_approved');
      
      for (const variable of variables) {
        expect(variable.name).toBeDefined();
        expect(variable.description).toBeDefined();
        expect(variable.example).toBeDefined();
      }
    });
  });

  describe('Template Types', () => {
    it('deve suportar todos os tipos de notificação', () => {
      const types = [
        'info', 'success', 'warning', 'error',
        'case_pending', 'case_approved', 'case_rejected',
        'certificate_issued', 'token_earned', 'system'
      ];

      for (const type of types) {
        const variables = notificationTemplateService.getVariablesForType(type);
        expect(Array.isArray(variables)).toBe(true);
        expect(variables.length).toBeGreaterThan(0);
      }
    });
  });
});
