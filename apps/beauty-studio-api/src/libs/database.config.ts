import type { MongooseModuleOptions } from "@nestjs/mongoose";

const databaseNames: Record<string, string> = {
  development: "BeautyStudio",
  test: "beauty_studio_test",
  production: "beauty_studio_prod",
};

/** Validate before Mongoose can open a connection. Never use legacy Mongo keys. */
export function beautyDatabaseOptions(
  env: Record<string, string | undefined>,
): MongooseModuleOptions {
  const environment = env.NODE_ENV;
  if (!environment || !Object.hasOwn(databaseNames, environment)) {
    throw new Error("NODE_ENV must be development, test, or production");
  }

  const expectedName = databaseNames[environment];
  if (env.BEAUTY_MONGO_DB_NAME !== expectedName) {
    throw new Error(`BEAUTY_MONGO_DB_NAME must be ${expectedName}`);
  }

  const uri = env.BEAUTY_MONGO_URI;
  // Explicit database in the URI and options must agree; no implicit test/admin DB.
  const match = uri?.match(
    /^mongodb(?:\+srv)?:\/\/([^/?#]+)\/([^/?#]+)(?:\?([^#]*))?$/,
  );
  if (!uri || !match) {
    throw new Error(
      "BEAUTY_MONGO_URI must be a MongoDB URI with an explicit database",
    );
  }
  let uriDatabase: string;
  try {
    uriDatabase = decodeURIComponent(match[2]);
  } catch {
    throw new Error("BEAUTY_MONGO_URI contains an invalid database name");
  }
  if (uriDatabase !== expectedName) {
    throw new Error(
      "BEAUTY_MONGO_URI database must match BEAUTY_MONGO_DB_NAME",
    );
  }
  const query = new URLSearchParams(match[3]);
  for (const key of query.keys()) {
    if (key.toLowerCase() === "dbname") {
      throw new Error("Do not override the database through URI query options");
    }
  }

  // Reject a known original database even if its name matches the naming convention.
  for (const legacyUri of [env.MONGO_DEV, env.MONGO_PROD]) {
    const legacyName = legacyUri?.match(
      /^mongodb(?:\+srv)?:\/\/[^/?#]+\/([^/?#]+)/,
    )?.[1];
    if (legacyName && decodeURIComponent(legacyName) === expectedName) {
      throw new Error(
        "Beauty Studio database must differ from the original database",
      );
    }
  }

  return {
    uri,
    dbName: expectedName,
    autoIndex: false,
    autoCreate: false,
    retryAttempts: 0,
    serverSelectionTimeoutMS: 5000,
  };
}
