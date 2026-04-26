const { query, getDb } = require('../config/db');

class TeacherPayroll {
  static async findAll() {
    const { rows } = await query(`
      SELECT tp.*, 
             t.first_name, t.last_name, t.email as teacher_email,
             y.label as year_label, pp.month
      FROM teacher_payroll tp
      JOIN teachers t ON tp.teacher_id = t.id
      JOIN payroll_periods pp ON tp.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      ORDER BY y.start_date DESC, pp.month, t.last_name
    `);
    return rows;
  }

  static async findById(id) {
    const { rows } = await query(`
      SELECT tp.*, 
             t.first_name, t.last_name, t.email as teacher_email,
             t.bank_account, t.bank_name,
             y.label as year_label, pp.month, pp.start_date, pp.end_date
      FROM teacher_payroll tp
      JOIN teachers t ON tp.teacher_id = t.id
      JOIN payroll_periods pp ON tp.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      WHERE tp.id = ?
    `, [id]);
    return rows[0];
  }

  static async findByTeacher(teacherId) {
    const { rows } = await query(`
      SELECT tp.*, y.label as year_label, pp.month
      FROM teacher_payroll tp
      JOIN payroll_periods pp ON tp.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      WHERE tp.teacher_id = ?
      ORDER BY y.start_date DESC, pp.month
    `, [teacherId]);
    return rows;
  }

  static async findByPeriod(periodId) {
    const { rows } = await query(`
      SELECT tp.*, t.first_name, t.last_name, t.email as teacher_email
      FROM teacher_payroll tp
      JOIN teachers t ON tp.teacher_id = t.id
      WHERE tp.payroll_period_id = ?
      ORDER BY t.last_name
    `, [periodId]);
    return rows;
  }

  static async generateForPeriod(periodId) {
    const db = await getDb();

    try {
      await db.run('BEGIN TRANSACTION');

      const periodRow = await db.get(`
        SELECT pp.*, y.id as year_id
        FROM payroll_periods pp
        JOIN years y ON pp.year_id = y.id
        WHERE pp.id = ?
      `, [periodId]);
      if (!periodRow) throw new Error('Période non trouvée');

      const contracts = await db.all(`
        SELECT tc.*, t.first_name, t.last_name
        FROM teacher_contracts tc
        JOIN teachers t ON tc.teacher_id = t.id
        WHERE tc.year_id = ? AND tc.status = 'actif'
      `, [periodRow.year_id]);

      const payrolls = [];
      for (const contract of contracts) {
        const existing = await db.get(
          `SELECT id FROM teacher_payroll WHERE teacher_id = ? AND payroll_period_id = ?`,
          [contract.teacher_id, periodId]
        );
        if (existing) continue;

        let grossSalary = parseFloat(contract.base_salary || 0);
        if (contract.contract_type === 'horaire') {
          grossSalary = parseFloat(contract.hourly_rate || 0) * parseFloat(contract.hours_per_month || 0);
        }

        const deductions = 0;
        const bonuses = 0;
        const netSalary = grossSalary - deductions + bonuses;

        const result = await db.run(`
          INSERT INTO teacher_payroll 
            (teacher_id, contract_id, payroll_period_id, gross_salary, deductions, bonuses, net_salary, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente')
        `, [
          contract.teacher_id, contract.id, periodId,
          Math.round(grossSalary), Math.round(deductions),
          Math.round(bonuses), Math.round(netSalary)
        ]);

        const newPayroll = await db.get('SELECT * FROM teacher_payroll WHERE id = ?', [result.lastID]);
        payrolls.push(newPayroll);
      }

      await db.run('COMMIT');
      return payrolls;
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  }

  static async markPaid(id, paymentDate) {
    await query(`
      UPDATE teacher_payroll 
      SET payment_date = ?, status = 'payé', updated_at = datetime('now')
      WHERE id = ?
    `, [paymentDate || new Date().toISOString().split('T')[0], id]);
    const { rows } = await query('SELECT * FROM teacher_payroll WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, fields) {
    const allowedFields = ['gross_salary', 'deductions', 'bonuses', 'net_salary', 'status', 'payment_date'];

    const setClauses = [];
    const values = [];

    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = datetime('now')`);
    values.push(id);

    await query(`UPDATE teacher_payroll SET ${setClauses.join(', ')} WHERE id = ?`, values);
    const { rows } = await query('SELECT * FROM teacher_payroll WHERE id = ?', [id]);
    return rows[0];
  }

  static async delete(id) {
    await query(`DELETE FROM teacher_payroll WHERE id = ?`, [id]);
    return { id };
  }
}

module.exports = TeacherPayroll;