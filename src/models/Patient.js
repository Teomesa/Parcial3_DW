export class Patient {
    constructor(id, name, age, email) {
      this.id = id;
      this.name = name;
      this.age = age;
      this.email = email;
    }
  
    static async findById(pool, id) {
      const result = await pool.query('SELECT * FROM patient WHERE id = $1', [id]);
      return result.rows[0];
    }
  
    static async findByEmail(pool, email) {
      const result = await pool.query('SELECT * FROM patient WHERE email = $1', [email]);
      return result.rows[0];
    }
  }