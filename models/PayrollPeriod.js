const pool = require('../config/db');

class PayrollPeriod {
  static async findAll() {
    const query = `
      SELECT pp.*, y.label as year_label
      FROM payroll_periods pp
      JOIN years y ON pp.year_id = y.id
      ORDER BY y.start_date DESC, pp.month
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT pp.*, y.label as year_label
      FROM payroll_periods pp
      JOIN years y ON pp.year_id = y.id
      WHERE pp.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByYear(yearId) {
    const query = `
      SELECT * FROM payroll_periods
      WHERE year_id = $1
      ORDER BY month
    `;
    const { rows } = await pool.query(query, [yearId]);
    return rows;
  }

  static async create({ year_id, month, start_date, end_date }) {
    const query = `
      INSERT INTO payroll_periods (year_id, month, start_date, end_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [year_id, month, start_date, end_date];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async generateForYear(yearId) {
    // Génère 12 périodes pour une année scolaire
    const yearQuery = `SELECT * FROM years WHERE id = $1`;
    const { rows: yearRows } = await pool.query(yearQuery, [yearId]);
    if (yearRows.length === 0) throw new Error('Année non trouvée');

    const year = yearRows[0];
    const periods = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year.start_date);
      startDate.setMonth(startDate.getMonth() + month - 1);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Dernier jour du mois

      // Vérifier si la période existe déjà
      const existingQuery = `
        SELECT id FROM payroll_periods 
        WHERE year_id = $1 AND month = $2
      `;
      const { rows: existing } = await pool.query(existingQuery, [yearId, month]);

      if (existing.length === 0) {
        const period = await this.create({
          year_id: yearId,
          month,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        });
        periods.push(period);
      }
    }

    return periods;
  }

  static async update(id, { status, start_date, end_date }) {
    const query = `
      UPDATE payroll_periods
      SET status = COALESCE($1, status),
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const values = [status, start_date, end_date, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM payroll_periods WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = PayrollPeriod;