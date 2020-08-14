import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('avatar').notNullable();
    table.string('whatsapp').notNullable();
    table.string('bio').notNullable();
    table.boolean('is_teacher').notNullable();
    table.string('password_reset_token').nullable();
    table.string('password_reset_expires').nullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('users');
}
