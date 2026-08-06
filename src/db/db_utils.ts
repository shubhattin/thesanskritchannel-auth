import Type from 'typebox';
import { Value } from 'typebox/value';

export const get_db_url = (env: any): string => {
  let url: string = null!;
  if (typeof process !== 'undefined') {
    if (process.env.DB_MODE === 'PROD') url = env.PG_DATABASE_URL1;
    else if (process.env.DB_MODE === 'PREVIEW') url = env.PG_DATABASE_URL2;
    else url = env.PG_DATABASE_URL;
  } else url = env.PG_DATABASE_URL;
  const schema = Type.String({ description: 'Connection string for PostgreSQL' });
  if (!Value.Check(schema, url)) throw new Error('Please set `PG_DATABASE_URL`');
  return url;
};
