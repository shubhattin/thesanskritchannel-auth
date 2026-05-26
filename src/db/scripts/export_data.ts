import { dbClient_ext, queryClient } from './client';
import { readFile } from 'fs/promises';
import { dbMode, take_input } from '~/tools/kry.server';
import { user, account, verification, jwks, user_app_scope_join } from '~/db/schema';
import {
  UserSchemaZod,
  AccountSchemaZod,
  VerificationSchemaZod,
  JwksSchemaZod,
  UserAppScopeJoinSchemaZod
} from '~/db/schema_zod';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import chalk from 'chalk';

const main = async () => {
  /*
   Better backup & restore tools like `pg_dump` and `pg_restore` should be used.
  
   Although Here the foriegn key relations are not that complex so we are doing it manually
  */
  if (!(await confirm_environemnt())) return;

  console.log(`Insering Data into ${dbMode} Database...`);

  const in_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];

  const data = z
    .object({
      user: UserSchemaZod.array(),
      account: AccountSchemaZod.array(),
      verification: VerificationSchemaZod.array(),
      user_app_scope_join: UserAppScopeJoinSchemaZod.array(),
      jwks: JwksSchemaZod.array()
    })
    .parse(JSON.parse((await readFile(`./out/${in_file_name}`)).toString()));

  dbClient_ext.transaction(async (tx) => {
    // deleting all the tables initially
    try {
      await tx.delete(user);
      await tx.delete(account);
      await tx.delete(verification);
      await tx.delete(jwks);
      console.log(chalk.green('✓ Deleted All Tables Successfully'));
    } catch (e) {
      console.log(chalk.red('✗ Error while deleting tables:'), chalk.yellow(e));
    }

    // inserting user
    try {
      await tx.insert(user).values(data.user);
      console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`users`'));
    } catch (e) {
      console.log(chalk.red('✗ Error while inserting users:'), chalk.yellow(e));
    }

    // inserting account
    try {
      await tx.insert(account).values(data.account);
      console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`account`'));
    } catch (e) {
      console.log(chalk.red('✗ Error while inserting account:'), chalk.yellow(e));
    }

    // inserting verification
    try {
      await tx.insert(verification).values(data.verification);
      console.log(
        chalk.green('✓ Successfully added values into table'),
        chalk.blue('`verification`')
      );
    } catch (e) {
      console.log(chalk.red('✗ Error while inserting verification:'), chalk.yellow(e));
    }

    // inserting user_app_scope_join
    try {
      await tx.insert(user_app_scope_join).values(data.user_app_scope_join);
      console.log(
        chalk.green('✓ Successfully added values into table'),
        chalk.blue('`user_app_scope_join`')
      );
    } catch (e) {
      console.log(chalk.red('✗ Error while inserting user_app_scope_join:'), chalk.yellow(e));
    }

    // resetting jwks
    try {
      await tx.insert(jwks).values(data.jwks);
      console.log(chalk.green('✓ Successfully added values into table'), chalk.blue('`jwks`'));
    } catch (e) {
      console.log(chalk.red('✗ Error while inserting jwks:'), chalk.yellow(e));
    }
  });
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure INSERT in ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
