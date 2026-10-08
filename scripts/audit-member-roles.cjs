// Read-only connectivity probe: never bootstrap Nest or register application models.
const { ConfigModule } = require("@nestjs/config");
const mongoose = require("mongoose");
const {
  beautyDatabaseOptions,
} = require("../apps/beauty-studio-api/src/libs/database.config");

async function main() {
  await ConfigModule.forRoot({ envFilePath: ".env.beauty-studio" });
  const options = beautyDatabaseOptions(process.env);
  let connection;
  try {
    connection = mongoose.createConnection(options.uri, {
      dbName: options.dbName,
      autoCreate: false,
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
    });
    await connection.asPromise();
    if (options.dbName !== "BeautyStudio" || process.env.NODE_ENV !== "development") throw new Error("Role audit requires BeautyStudio development");
    const counts = await connection.db.collection("members").aggregate([{ $group: { _id: "$memberType", count: { $sum: 1 } } }]).toArray();
    console.log(JSON.stringify({ database: options.dbName, roleCounts: counts }));
    console.log(
      `Read-only connection verified: ${options.dbName} (${process.env.NODE_ENV}). No models registered or writes issued.`,
    );
  } catch {
    // Driver error messages may contain credentials/hostnames; do not print them.
    throw new Error(
      "Connection verification failed. Check the configured URI, credentials, network access, and database permissions.",
    );
  } finally {
    if (connection) await connection.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
