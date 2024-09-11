const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const dbName = 'rentcon';
const collectionName = 'rentcon_admins';


async function run() {
    const client = new MongoClient('mongodb+srv://joseph:admin@cluster0.0tqay.mongodb.net/rentcon?retryWrites=true&w=majority&appName=Cluster0');
  
    try {
      await client.connect();
      console.log('Connected to database');
  
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
  
      // Password to be hashed
      const plainPassword = 'superadmin123';
  
      // Generate salt and hash the password
      const saltRounds = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
  
      const admin = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@example.com',
        password_hash: passwordHash,
        role: 'Super-admin',
        phone_num: '09177505862',
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        status: 'active'
      };
  
      const result = await collection.insertOne(admin);
      console.log('Inserted document:', result.insertedId);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      await client.close();
    }
  }
  
run().catch(console.error);
