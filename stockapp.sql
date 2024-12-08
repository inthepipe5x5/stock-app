\echo 'Delete and recreate stockapp db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE stockapp;
CREATE DATABASE stockapp;
\connect stockapp

\i stockapp-schema.sql
\i stockapp-seed.sql

\echo 'Delete and recreate stockapp_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE stockapp_test;
CREATE DATABASE stockapp_test;
\connect stockapp_test

\i stockapp_schema.sql
