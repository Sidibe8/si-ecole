const { query, getDb } = require('../config/db');

class AdminPayroll {
    static async findAll() {
        const { rows } = await query(`
            SELECT ap.*, u.email, u.role, u.nom_complet, y.label as year_label, pp.month
            FROM admin_payroll ap
            JOIN users u ON ap.user_id = u.id
            JOIN payroll_periods pp ON ap.payroll_period_id = pp.id
            JOIN years y ON pp.year_id = y.id
            ORDER BY y.start_date DESC, pp.month, u.nom_complet
        `);
        return rows;
    }

    static async findById(id) {
        const { rows } = await query(`
            SELECT ap.*, u.email, u.role, u.nom_complet, u.bank_account, u.bank_name,
                   y.label as year_label, pp.month, pp.start_date, pp.end_date
            FROM admin_payroll ap
            JOIN users u ON ap.user_id = u.id
            JOIN payroll_periods pp ON ap.payroll_period_id = pp.id
            JOIN years y ON pp.year_id = y.id
            WHERE ap.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByUser(userId) {
        const { rows } = await query(`
            SELECT ap.*, y.label as year_label, pp.month
            FROM admin_payroll ap
            JOIN payroll_periods pp ON ap.payroll_period_id = pp.id
            JOIN years y ON pp.year_id = y.id
            WHERE ap.user_id = ?
            ORDER BY y.start_date DESC, pp.month
        `, [userId]);
        return rows;
    }

    static async findByPeriod(periodId) {
        const { rows } = await query(`
            SELECT ap.*, u.email, u.role, u.nom_complet
            FROM admin_payroll ap
            JOIN users u ON ap.user_id = u.id
            WHERE ap.payroll_period_id = ?
            ORDER BY u.nom_complet
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
                SELECT ac.*, u.email, u.nom_complet
                FROM admin_contracts ac
                JOIN users u ON ac.user_id = u.id
                WHERE ac.year_id = ? AND ac.status = 'actif'
            `, [periodRow.year_id]);

            const payrolls = [];
            for (const contract of contracts) {
                const existing = await db.get(`
                    SELECT id FROM admin_payroll WHERE user_id = ? AND payroll_period_id = ?
                `, [contract.user_id, periodId]);

                if (existing) continue;

                const grossSalary = parseFloat(contract.base_salary);
                const deductions = 0;
                const bonuses = 0;
                const overtimeAmount = 0;
                const netSalary = grossSalary - deductions + bonuses + overtimeAmount;

                const result = await db.run(`
                    INSERT INTO admin_payroll 
                        (user_id, contract_id, payroll_period_id, gross_salary, overtime_hours, overtime_amount, deductions, bonuses, net_salary, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente')
                `, [
                    contract.user_id, contract.id, periodId,
                    Math.round(grossSalary), 0, Math.round(overtimeAmount),
                    Math.round(deductions), Math.round(bonuses), Math.round(netSalary)
                ]);

                const newPayroll = await db.get('SELECT * FROM admin_payroll WHERE id = ?', [result.lastID]);
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
            UPDATE admin_payroll 
            SET payment_date = ?, status = 'payé', updated_at = datetime('now')
            WHERE id = ?
        `, [paymentDate || new Date().toISOString().split('T')[0], id]);
        const { rows } = await query('SELECT * FROM admin_payroll WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, fields) {
        const allowedFields = [
            'gross_salary', 'overtime_hours', 'overtime_amount',
            'deductions', 'bonuses', 'net_salary', 'status', 'payment_date'
        ];

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

        await query(`UPDATE admin_payroll SET ${setClauses.join(', ')} WHERE id = ?`, values);
        const { rows } = await query('SELECT * FROM admin_payroll WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        await query(`DELETE FROM admin_payroll WHERE id = ?`, [id]);
        return { id };
    }
}

module.exports = AdminPayroll;