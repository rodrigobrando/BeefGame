import { describe, expect, it } from 'vitest';
import { interpretarTabela } from '../src/core/importar';
import { validarDieta } from '../src/core/nutricao';

describe('importar tabela colada', () => {
  it('lê tabela separada por tab com vírgula decimal e ignora cabeçalho', () => {
    const txt = `Alimento\tMS (%)\tIncl. MS (%)\tIncl. MO (%)
SILAGEM DE MILHO\t30\t60\t80,0
PRE CONFINAMENTO\t87,59\t40\t20,0`;
    const r = interpretarTabela(txt);
    expect(r.ingredientes).toHaveLength(2);
    expect(r.ignoradas).toHaveLength(1);
    expect(r.ingredientes[1].ms).toBeCloseTo(87.59);
    expect(r.ingredientes[0].modoCarga).toBe('pa');
    expect(r.ingredientes[1].modoCarga).toBe('rosca');
    expect(r.ingredientes[0].ordemCarga).toBe(1);
  });
  it('lê markdown com pipes e espaços', () => {
    const r = interpretarTabela('| Alimento | MS | Incl. MS |\n|---|---|---|\n| SOJA GORDA | 92 | 15 |\nPOLPA CITRICA   19   85');
    expect(r.ingredientes.map((i) => i.nome)).toEqual(['SOJA GORDA', 'POLPA CITRICA']);
  });
  it('a validação aponta soma ≠ 100', () => {
    const r = interpretarTabela('A\t50\t60\nB\t90\t30');
    const av = validarDieta({ id: 'x', nome: 'x', consumoMSCabDia: 8, ingredientes: r.ingredientes });
    expect(av.some((a) => a.tipo === 'soma')).toBe(true);
  });
});
