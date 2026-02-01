#!/usr/bin/env python3
"""
Script para corrigir automaticamente erros TypeScript Date→number
Identifica padrões de new Date() e Date.now() em inserts/updates do Drizzle ORM
e converte para Date.now() (que retorna number)
"""

import re
import os
from pathlib import Path

def fix_date_to_number(file_path):
    """Corrige erros Date→number em um arquivo TypeScript"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # Padrão 1: new Date() em campos de timestamp (createdAt, updatedAt, expiresAt, etc.)
    # Substituir por Date.now()
    pattern1 = r'(\w+At):\s*new Date\(\)'
    matches1 = re.findall(pattern1, content)
    if matches1:
        content = re.sub(pattern1, r'\1: Date.now()', content)
        changes_made.append(f"Converted {len(matches1)} 'new Date()' to 'Date.now()' in timestamp fields")
    
    # Padrão 2: createdAt: Date.now() já está correto, não precisa mudar
    
    # Padrão 3: Remover @ts-expect-error desnecessários após correções
    pattern3 = r'// @ts-expect-error.*\n\s*(\w+At):\s*Date\.now\(\)'
    matches3 = re.findall(pattern3, content)
    if matches3:
        content = re.sub(pattern3, r'\1: Date.now()', content)
        changes_made.append(f"Removed {len(matches3)} unnecessary @ts-expect-error comments")
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes_made
    
    return False, []

def main():
    """Processa todos os arquivos TypeScript do projeto"""
    project_root = Path('/home/ubuntu/impact7-platform-permanent')
    
    # Arquivos a processar (baseado em análise anterior de erros)
    target_files = [
        'server/routers.ts',
        'server/db.ts',
        'server/login.ts',
        'server/_core/index.ts',
        'client/src/pages/Status.tsx',
        'client/src/pages/NotificationPreferences.tsx',
    ]
    
    total_files_changed = 0
    total_changes = []
    
    for file_rel_path in target_files:
        file_path = project_root / file_rel_path
        if file_path.exists():
            changed, changes = fix_date_to_number(file_path)
            if changed:
                total_files_changed += 1
                print(f"✅ {file_rel_path}:")
                for change in changes:
                    print(f"   - {change}")
                    total_changes.append(change)
        else:
            print(f"⚠️  {file_rel_path}: File not found")
    
    print(f"\n📊 Summary:")
    print(f"   - Files changed: {total_files_changed}/{len(target_files)}")
    print(f"   - Total changes: {len(total_changes)}")
    
    if total_files_changed > 0:
        print(f"\n✅ Run 'npx tsc --noEmit' to validate TypeScript errors were reduced")
    else:
        print(f"\n⚠️  No changes made. Errors may require manual intervention.")

if __name__ == '__main__':
    main()
