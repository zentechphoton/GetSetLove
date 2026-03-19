@echo off
REM Create database using PostgreSQL
REM Find psql.exe in common PostgreSQL installation locations

set PGPASSWORD=Gafru123

REM Try PostgreSQL 18
if exist "C:\Program Files\PostgreSQL\18\bin\psql.exe" (
    "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE gsl_db;"
    goto :done
)

REM Try PostgreSQL 16
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
    "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE gsl_db;"
    goto :done
)

REM Try PostgreSQL 15
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
    "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE gsl_db;"
    goto :done
)

REM Try PostgreSQL 14
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" (
    "C:\Program Files\PostgreSQL\14\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE gsl_db;"
    goto :done
)

echo Could not find psql.exe. Please create database manually.
echo Run: psql -U postgres
echo Then: CREATE DATABASE gsl_db;
pause
exit /b 1

:done
echo Database gsl_db created successfully!
pause

