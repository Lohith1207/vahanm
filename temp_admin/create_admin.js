const { MongoClient } = require('mongodb');

const uri = process.env.SPRING_DATA_MONGODB_URI || "mongodb://127.0.0.1:27017/vahanm";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Registering admin user through backend API...");
    const response = await fetch("http://localhost:8080/api/v1/auth/signup/customer", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           name: "Super Admin",
           email: "superadmin@vahanm.com",
           password: "adminpassword123",
           phone: "0000000001",
           role: "customer"
        })
    });
    const resText = await response.text();
    console.log("Signup Response:", resText);
    
    console.log("Connecting to MongoDB to update role...");
    await client.connect();
    const database = client.db('vahanm');
    const users = database.collection('users');
    
    const result = await users.updateOne(
        { email: "superadmin@vahanm.com" },
        { $set: { role: "admin", isVerified: true, isActive: true } }
    );
    console.log("Update Result:", result);
    console.log("Successfully created admin user!");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
