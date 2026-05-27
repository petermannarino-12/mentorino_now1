
import { ValidationRule, RuleOperator } from '../types';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

class ValidationService {
  private rules: ValidationRule[] = [];
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  private ensureLoaded() {
    if (!this.loaded && !this.loadingPromise) {
      this.loadingPromise = this.loadRules().then(() => {
        this.loaded = true;
        this.loadingPromise = null;
      });
    }
    return this.loadingPromise || Promise.resolve();
  }

  async loadRules() {
    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('*')
        .eq('isActive', true);

      if (error) {
        console.warn('Validation rules table not found or error fetching:', error);
        return;
      }

      this.rules = data || [];
    } catch (err) {
      console.error('Error loading validation rules:', err);
    }
  }

  getRulesForEntity(entity: ValidationRule['entity']) {
    if (!this.loaded) {
      this.ensureLoaded();
      return [];
    }
    return this.rules.filter(r => r.entity === entity && r.isActive);
  }

  validateField(value: any, rule: ValidationRule): { success: boolean; message?: string } {
    try {
      let schema: z.ZodTypeAny;

      switch (rule.operator) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            return { success: false, message: rule.errorMessage || 'Field is required' };
          }
          return { success: true };
        
        case 'minLength':
          schema = z.string().min(Number(rule.value));
          break;
        
        case 'maxLength':
          schema = z.string().max(Number(rule.value));
          break;
        
        case 'pattern':
          schema = z.string().regex(new RegExp(rule.value));
          break;
        
        case 'min':
          schema = z.number().min(Number(rule.value));
          break;
        
        case 'max':
          schema = z.number().max(Number(rule.value));
          break;
        
        case 'custom':
          // For a real app, this might be a server-side check or a safe eval (use with caution)
          // For now, we'll treat it as a required check if not implemented
          return { success: !!value, message: rule.errorMessage };

        default:
          return { success: true };
      }

      const result = schema.safeParse(value);
      if (!result.success) {
        return { success: false, message: rule.errorMessage || 'Invalid value' };
      }

      return { success: true };
    } catch (err) {
      console.error('Validation error:', err);
      return { success: false, message: 'Validation logic error' };
    }
  }

  validateEntity(entityName: ValidationRule['entity'], data: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};
    const entityRules = this.getRulesForEntity(entityName);

    entityRules.forEach(rule => {
      const value = data[rule.field];
      const result = this.validateField(value, rule);
      if (!result.success) {
        errors[rule.field] = result.message || 'Validation failed';
      }
    });

    return errors;
  }

  async saveRule(rule: Omit<ValidationRule, 'id' | 'created_at'>): Promise<ValidationRule | null> {
    const { data, error } = await supabase
      .from('validation_rules')
      .insert([rule])
      .select()
      .single();

    if (error) {
      console.error('Error saving rule:', error);
      return null;
    }

    await this.loadRules(); // Refresh local cache
    return data;
  }

  async deleteRule(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('validation_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rule:', error);
      return false;
    }

    await this.loadRules(); // Refresh local cache
    return true;
  }

  async toggleRule(id: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('validation_rules')
      .update({ isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling rule:', error);
      return false;
    }

    await this.loadRules(); // Refresh local cache
    return true;
  }
}

export const validationService = new ValidationService();
