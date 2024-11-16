export class Doctor {
    constructor(id, name, age, email, specialty_id) {
      this.id = id;
      this.name = name;
      this.age = age;
      this.email = email;
      this.specialty_id = specialty_id;
    }
  
    static async findById(pool, id) {
      const result = await pool.query(
        'SELECT d.*, s.name as specialty_name FROM doctor d JOIN specialty s ON d.specialty_id = s.id WHERE d.id = $1',
        [id]
      );
      return result.rows[0];
    }
  
    static async findByEmail(pool, email) {
      const result = await pool.query('SELECT * FROM doctor WHERE email = $1', [email]);
      return result.rows[0];
    }
  }